"use client";

import { useState } from "react";

export function PasswordInput({
  autoComplete,
}: {
  autoComplete: "current-password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-wrap">
      <input
        autoComplete={autoComplete}
        id="password"
        minLength={8}
        name="password"
        required
        type={visible ? "text" : "password"}
      />
      <button
        aria-label={visible ? "Hide password" : "Show password"}
        className="password-toggle"
        onClick={() => setVisible((value) => !value)}
        type="button"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </span>
  );
}
