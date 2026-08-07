import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthForm } from "@/components/auth/auth-form";

describe("AuthForm", () => {
  it("renders sign-in credentials with accessible labels", () => {
    render(<AuthForm action={vi.fn()} mode="sign-in" />);

    expect(screen.getByLabelText("Email address")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  it("uses account-creation wording and a new-password field for sign-up", () => {
    render(<AuthForm action={vi.fn()} mode="sign-up" />);

    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByRole("button", { name: "Create development account" })).toBeEnabled();
  });
});
