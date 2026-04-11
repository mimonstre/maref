"use client";

import { useEffect, useRef, useState } from "react";

export function useTimedMessage(delay = 2000) {
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showMessage(nextMessage: string) {
    setMessage(nextMessage);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMessage(""), delay);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { message, setMessage, showMessage };
}
