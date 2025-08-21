import { useCallback, useEffect, useState } from "react";

export function useCapsLockDetection() {
  const [caps, setCaps] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.getModifierState?.("CapsLock")) {
      setCaps(true);
    } else {
      setCaps(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return caps;
}
