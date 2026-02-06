"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { CharacterGroup, type CharacterMood } from "./characters";

interface FormState {
  email: string;
  password: string;
  focusedField: "email" | "password" | null;
  passwordVisible: boolean;
  rememberMe: boolean;
  hoveringButton: "login" | "google" | null;
  loginState: "idle" | "loading" | "failed";
}

const INITIAL_STATE: FormState = {
  email: "",
  password: "",
  focusedField: null,
  passwordVisible: false,
  rememberMe: false,
  hoveringButton: null,
  loginState: "idle",
};

function deriveMood(state: FormState): CharacterMood {
  if (state.loginState === "failed") return "sad";
  if (state.loginState === "loading") return "excited";
  if (state.passwordVisible) return "looking-away";
  if (state.hoveringButton) return "excited";
  if (
    state.focusedField === "email" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)
  )
    return "happy";
  if (state.focusedField) return "watching";
  return "idle";
}

export function FunFormApp({ instanceId: _ }: { instanceId: string }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  const mood = deriveMood(form);

  const patch = useCallback((updates: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.22;
      const cy = rect.top + rect.height * 0.55;
      setEyeOffset({
        x: Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width * 0.4))),
        y: Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height * 0.4))),
      });
    },
    [],
  );

  const handleLogin = useCallback(() => {
    setForm(prev => ({ ...prev, loginState: "loading" }));
    setTimeout(() => {
      setForm(prev => ({ ...prev, loginState: "failed" }));
      setTimeout(() => {
        setForm(prev => ({ ...prev, loginState: "idle" }));
      }, 2500);
    }, 800);
  }, []);

  return (
    <div
      className="w-full h-full flex bg-[#F8F5F2] overflow-hidden"
      onMouseMove={handleMouseMove}
      role="application"
      aria-label="Fun Form"
    >
      {/* Characters — perspective wrapper gives subtle 3D tilt as cursor moves */}
      <div
        className="w-[45%] flex items-end justify-center"
        style={{ perspective: "800px" }}
      >
        <motion.div
          className="w-full h-[80%] max-w-[400px]"
          animate={{
            rotateY: eyeOffset.x * 4,
            rotateX: -eyeOffset.y * 3,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <CharacterGroup eyeOffset={eyeOffset} mood={mood} />
        </motion.div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-[360px] flex flex-col gap-5">
          {/* Sparkle icon */}
          <svg
            className="mx-auto mb-1"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            role="img"
            aria-label="Sparkle"
          >
            <path
              d="M12 2L13.5 9.5L20 12L13.5 14.5L12 22L10.5 14.5L4 12L10.5 9.5Z"
              fill="#1A1A1A"
            />
          </svg>

          {/* Heading */}
          <div className="text-center mb-2">
            <h1 className="text-[1.75rem] font-bold text-[#1A1A1A] tracking-tight">
              Welcome back!
            </h1>
            <p className="text-[0.8rem] text-[#999] mt-1">
              Please enter your details
            </p>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="fun-form-email"
              className="text-[0.7rem] text-[#999] font-medium"
            >
              Email
            </label>
            <input
              id="fun-form-email"
              type="email"
              value={form.email}
              onChange={e => patch({ email: e.target.value })}
              onFocus={() => patch({ focusedField: "email" })}
              onBlur={() => patch({ focusedField: null })}
              className="w-full border-b border-[#ddd] bg-transparent py-2 text-[0.875rem] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors duration-200"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="fun-form-password"
              className="text-[0.7rem] text-[#999] font-medium"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="fun-form-password"
                type={form.passwordVisible ? "text" : "password"}
                value={form.password}
                onChange={e => patch({ password: e.target.value })}
                onFocus={() => patch({ focusedField: "password" })}
                onBlur={() => patch({ focusedField: null })}
                className="w-full border-b border-[#ddd] bg-transparent py-2 text-[0.875rem] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors duration-200 pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  patch({ passwordVisible: !form.passwordVisible })
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#1A1A1A] transition-colors duration-200"
              >
                {form.passwordVisible ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between text-[0.7rem]">
            <label className="flex items-center gap-1.5 text-[#999] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={e => patch({ rememberMe: e.target.checked })}
                className="rounded border-[#ddd] accent-[#1A1A1A]"
              />
              Remember for 30 days
            </label>
            <button
              type="button"
              className="text-[#999] hover:text-[#1A1A1A] transition-colors duration-200"
            >
              Forgot password
            </button>
          </div>

          {/* Login button */}
          <button
            type="button"
            onClick={handleLogin}
            onMouseEnter={() => patch({ hoveringButton: "login" })}
            onMouseLeave={() => patch({ hoveringButton: null })}
            disabled={form.loginState === "loading"}
            className="w-full py-2.5 bg-[#1A1A1A] text-white rounded-full text-[0.875rem] font-medium hover:bg-[#333] active:scale-[0.99] transition-all duration-200 disabled:opacity-70"
          >
            {form.loginState === "loading" ? "Logging in..." : "Log in"}
          </button>

          {/* Google login */}
          <button
            type="button"
            onMouseEnter={() => patch({ hoveringButton: "google" })}
            onMouseLeave={() => patch({ hoveringButton: null })}
            className="w-full py-2.5 bg-white border border-[#ddd] text-[#1A1A1A] rounded-full text-[0.875rem] font-medium hover:bg-[#fafafa] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="font-bold text-[1rem]">G</span>
            Log in with Google
          </button>

          {/* Sign up */}
          <p className="text-center text-[0.7rem] text-[#999]">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="text-[#1A1A1A] font-medium hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
