"use client";

import type { Parser } from "expr-eval";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function CalculatorApp({ instanceId: _ }: { instanceId: string }) {
  const [display, setDisplay] = useState<string>("0"); // current entry/result
  const [expr, setExpr] = useState<string>(""); // machine-friendly expression
  const [prettyExpr, setPrettyExpr] = useState<string>(""); // UI expression (÷ × − +)
  const [error, setError] = useState<boolean>(false);
  const [hasTyped, setHasTyped] = useState<boolean>(false);
  const parserRef = useRef<Parser | null>(null);

  // Lazy-load the evaluator
  useEffect(() => {
    let mounted = true;
    import("expr-eval")
      .then((mod) => {
        if (!mounted) return;
        parserRef.current = new mod.Parser();
      })
      .catch(() => {
        // If loading fails, we'll still show UI; equals will throw and be handled.
      });
    return () => {
      mounted = false;
    };
  }, []);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setExpr("");
    setPrettyExpr("");
    setError(false);
    setHasTyped(false);
  }, []);

  const clearEntry = useCallback(() => {
    if (!hasTyped && !expr) return clearAll();
    setDisplay("0");
    setHasTyped(false);
  }, [clearAll, expr, hasTyped]);

  const appendToCurrentNumber = useCallback(
    (ch: string) => {
      if (error) clearAll();
      setDisplay((prev) => {
        let next = prev;
        if (!hasTyped || prev === "0") next = ch === "." ? "0." : ch;
        else next = prev + ch;
        return next;
      });
      setHasTyped(true);
    },
    [clearAll, error, hasTyped],
  );

  const commitNumberToExpr = useCallback(
    (op?: string, prettyOp?: string) => {
      const num = sanitizeNumber(display);
      setExpr((prev) => {
        const endsWithOp = /[+\-*/]$/.test(prev);
        if (op) {
          if (hasTyped) {
            return prev ? `${prev}${num}${op}` : `${num}${op}`;
          }
          if (endsWithOp) return prev.slice(0, -1) + op;
          const base = prev || num;
          return `${base}${op}`;
        }
        if (hasTyped) return prev ? `${prev}${num}` : num;
        return prev;
      });
      setPrettyExpr((prev) => {
        const endsWithPrettyOp = /[÷×−+]$/.test(prev);
        if (prettyOp) {
          if (hasTyped)
            return prev ? `${prev}${num}${prettyOp}` : `${num}${prettyOp}`;
          if (endsWithPrettyOp) return prev.slice(0, -1) + prettyOp;
          const base = prev || num;
          return `${base}${prettyOp}`;
        }
        if (hasTyped) return prev ? `${prev}${num}` : num;
        return prev;
      });
      setHasTyped(false);
    },
    [display, hasTyped],
  );

  const handleDigit = useCallback(
    (d: string) => {
      if (d === ".") {
        const current = display;
        if (current.includes(".")) return; // prevent double decimal
      }
      appendToCurrentNumber(d);
    },
    [appendToCurrentNumber, display],
  );

  const toOpSymbol = useCallback((op: string) => {
    switch (op) {
      case "÷":
        return "/";
      case "×":
        return "*";
      case "−":
        return "-";
      case "+":
      default:
        return op;
    }
  }, []);

  const handleOp = useCallback(
    (op: "÷" | "×" | "−" | "+") => {
      commitNumberToExpr(toOpSymbol(op), op);
    },
    [commitNumberToExpr, toOpSymbol],
  );

  const handleEval = useCallback(() => {
    try {
      const full = (() => {
        const num = hasTyped ? sanitizeNumber(display) : "";
        return `${expr}${num}` || "0";
      })();
      if (!parserRef.current) throw new Error("Parser not ready");
      const node = parserRef.current.parse(full);
      const val = node.evaluate({});
      if (!Number.isFinite(val)) throw new Error("Math error");
      const formatted = formatResult(val);
      setDisplay(formatted);
      setExpr("");
      setPrettyExpr("");
      setHasTyped(false);
      setError(false);
    } catch {
      setDisplay("Error");
      setError(true);
      setExpr("");
      setPrettyExpr("");
      setHasTyped(false);
    }
  }, [display, expr, hasTyped]);

  const handlePercent = useCallback(() => {
    try {
      const n = parseFloat(display);
      if (Number.isNaN(n)) throw new Error("NaN");
      const v = n / 100;
      setDisplay(formatResult(v));
      setHasTyped(true);
    } catch {
      setDisplay("Error");
      setError(true);
    }
  }, [display]);

  const handleToggleSign = useCallback(() => {
    if (error) return;
    setDisplay((prev) => {
      if (prev === "0" || prev === "Error") return prev;
      if (prev.startsWith("-")) return prev.slice(1);
      return `-${prev}`;
    });
    setHasTyped(true);
  }, [error]);

  const handleBackspace = useCallback(() => {
    if (error) return clearAll();
    setDisplay((prev) => {
      if (!hasTyped || prev.length <= 1) return "0";
      const next = prev.slice(0, -1);
      if (next === "-") return "0";
      return next;
    });
  }, [clearAll, hasTyped, error]);

  // Keyboard support similar to macOS
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      if ((e.target as HTMLElement | null)?.tagName === "INPUT") return;
      if (/^[0-9]$/.test(key)) return void handleDigit(key);
      if (key === ".") return void handleDigit(".");
      if (key === "+") return void handleOp("+");
      if (key === "-") return void handleOp("−");
      if (key === "*") return void handleOp("×");
      if (key === "/") return void handleOp("÷");
      if (key === "Enter" || key === "=") return void handleEval();
      if (key === "Escape") return void clearAll();
      if (key === "%") return void handlePercent();
      if (key === "Backspace") return void handleBackspace();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    clearAll,
    handleBackspace,
    handleDigit,
    handleEval,
    handleOp,
    handlePercent,
  ]);

  const acLabel = useMemo(
    () => (hasTyped || expr ? "C" : "AC"),
    [expr, hasTyped],
  );

  return (
    <div
      className="text-white w-full h-full flex flex-col bg-[#27282A]/80 justify-end"
      role="application"
      aria-label="Calculator"
    >
      {/* Display area: macOS-like top-right value with small expression */}
      <div className="px-3 pt-3">
        <div className="w-full rounded-2xl px-3 py-3 min-h-[62px] flex flex-col items-end justify-center">
          <div className="text-right text-white/70 text-[12px] leading-tight w-full truncate">
            {prettyExpr}
            {hasTyped ? sanitizeNumber(display) : ""}
          </div>
          <div className="text-right tabular-nums tracking-tight text-[34px] leading-[1] select-text">
            {display}
          </div>
        </div>
      </div>

      {/* Keypad */}
      <div className="p-3">
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <CalcKey
            kind="func"
            label={acLabel}
            onPress={() => (acLabel === "C" ? clearEntry() : clearAll())}
          />
          <CalcKey kind="func" label="±" onPress={handleToggleSign} />
          <CalcKey kind="func" label="%" onPress={handlePercent} />
          <CalcKey kind="op" label="÷" onPress={() => handleOp("÷")} />

          {/* Row 2 */}
          <CalcKey label="7" onPress={() => handleDigit("7")} />
          <CalcKey label="8" onPress={() => handleDigit("8")} />
          <CalcKey label="9" onPress={() => handleDigit("9")} />
          <CalcKey kind="op" label="×" onPress={() => handleOp("×")} />

          {/* Row 3 */}
          <CalcKey label="4" onPress={() => handleDigit("4")} />
          <CalcKey label="5" onPress={() => handleDigit("5")} />
          <CalcKey label="6" onPress={() => handleDigit("6")} />
          <CalcKey kind="op" label="−" onPress={() => handleOp("−")} />

          {/* Row 4 */}
          <CalcKey label="1" onPress={() => handleDigit("1")} />
          <CalcKey label="2" onPress={() => handleDigit("2")} />
          <CalcKey label="3" onPress={() => handleDigit("3")} />
          <CalcKey kind="op" label="+" onPress={() => handleOp("+")} />

          {/* Row 5 */}
          <CalcKey label="⌫" onPress={handleBackspace} />
          <CalcKey label="0" onPress={() => handleDigit("0")} />
          <CalcKey label="." onPress={() => handleDigit(".")} />
          <CalcKey kind="op-strong" label="=" onPress={handleEval} />
        </div>
      </div>
    </div>
  );
}

function sanitizeNumber(s: string): string {
  // Trim trailing decimal dot, normalize leading zeros
  if (s.endsWith(".")) s = s.slice(0, -1);
  if (s === "-0") return "0";
  return s;
}

function formatResult(n: number): string {
  // Match macOS-ish formatting: up to 12 significant digits, strip trailing zeros
  const abs = Math.abs(n);
  if ((abs !== 0 && (abs >= 1e12 || abs < 1e-9)) || !Number.isFinite(n)) {
    return n
      .toExponential(9)
      .replace(/(?:\.\d*?)0+(e[+-]?\d+)/i, "$1")
      .replace(/\.e/i, "e");
  }
  const str = n.toLocaleString(undefined, {
    useGrouping: false,
    maximumSignificantDigits: 12,
  });
  // Remove trailing zeros after decimal
  return str.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.$/, "");
}

function CalcKey({
  label,
  onPress,
  kind = "digit",
  className = "",
}: {
  label: string;
  onPress: () => void;
  kind?: "digit" | "func" | "op" | "op-strong";
  className?: string;
}) {
  const base = cn(
    "aspect-square w-full rounded-full text-[17px] font-semibold select-none",
    "flex items-center justify-center",
    "shadow-[0_1.5px_0_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.12)]",
    "active:scale-[0.995] active:translate-y-[0.5px] transition-transform duration-75",
  );
  const styles = {
    digit: cn(
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]",
      "border border-white/10 hover:bg-white/12",
    ),
    func: cn(
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))]",
      "text-white border border-white/20",
    ),
    op: cn(
      "bg-[linear-gradient(180deg,#ffb14d,#ff8a27)]",
      "border border-[#ff8a27]/70",
    ),
    "op-strong": cn(
      "bg-[linear-gradient(180deg,#ffb14d,#ff8a27)]",
      "border border-[#ff8a27]/70",
    ),
  } as const;
  const textClass = kind === "func" ? "text-[16px] font-semibold" : undefined;
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(base, styles[kind], textClass, className)}
      aria-label={`Key ${label}`}
    >
      {label}
    </button>
  );
}
