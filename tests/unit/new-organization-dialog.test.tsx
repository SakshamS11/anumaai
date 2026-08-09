import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/platform/organizations/actions", () => ({
  createCustomerOrganization: vi.fn(),
}));

import { NewOrganizationDialog } from "@/components/platform/new-organization-dialog";

describe("NewOrganizationDialog", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute("open");
    };
  });

  it("shows inline validation before advancing through customer provisioning", () => {
    render(<NewOrganizationDialog />);

    fireEvent.click(screen.getByRole("button", { name: "+ New organization" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByText("Enter an organization name of at least two characters."),
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText("Organization name"), {
      target: { value: "Acme Electronics" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText("Work email")).toBeVisible();

    fireEvent.change(screen.getByLabelText("Work email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Enter a valid work email.")).toBeVisible();

    fireEvent.change(screen.getByLabelText("Work email"), {
      target: { value: "admin@acme.example" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Review organization" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Create organization" })).toBeEnabled();
  });
});
