"use client";

import { useState } from "react";

export function PasswordInput({
  autoComplete,
  id = "password",
  name = "password",
}: {
  autoComplete: "current-password" | "new-password";
  id?: string;
  name?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-wrap">
      <input
        autoComplete={autoComplete}
        id={id}
        minLength={8}
        name={name}
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
