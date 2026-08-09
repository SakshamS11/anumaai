"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { createCustomerOrganization } from "@/app/platform/organizations/actions";

function CreateOrganizationButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button button-primary" disabled={pending} type="submit">
      {pending ? "Creating organization…" : "Create organization"}
    </button>
  );
}

export function NewOrganizationDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState({
    name: "",
    country: "IN",
    currency: "INR",
    timezone: "Asia/Kolkata",
    environment: "customer",
  });
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");

  function close() {
    dialog.current?.close();
    setStep(1);
    setValidationError("");
  }
  function continueFrom(current: number) {
    const fieldset = form.current?.querySelector<HTMLFieldSetElement>(`[data-step="${current}"]`);
    const invalid = Array.from(fieldset?.elements ?? []).find(
      (element): element is HTMLInputElement | HTMLSelectElement =>
        (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) &&
        !element.checkValidity(),
    );
    if (invalid) {
      setValidationError(
        invalid.name === "email"
          ? "Enter a valid work email."
          : "Enter an organization name of at least two characters.",
      );
      invalid.focus();
      return;
    }
    setValidationError("");
    setStep(current + 1);
  }

  return (
    <>
      <button
        className="button button-primary"
        onClick={() => dialog.current?.showModal()}
        type="button"
      >
        + New organization
      </button>
      <dialog className="product-dialog organization-dialog" ref={dialog}>
        <form action={createCustomerOrganization} ref={form}>
          <header>
            <div>
              <p className="eyebrow">New customer environment</p>
              <h2>Create organization</h2>
            </div>
            <button aria-label="Close" className="dialog-close" onClick={close} type="button">
              ×
            </button>
          </header>
          <ol className="dialog-steps" aria-label="Organization creation progress">
            {["Company", "Administrator", "Review"].map((label, index) => (
              <li aria-current={step === index + 1 ? "step" : undefined} key={label}>
                <span>{index + 1}</span>
                {label}
              </li>
            ))}
          </ol>
          <fieldset data-step="1" hidden={step !== 1}>
            <legend>Company details</legend>
            <label className="form-field">
              <span>Organization name</span>
              <input
                name="name"
                minLength={2}
                required
                value={company.name}
                onChange={(event) => {
                  setCompany({ ...company, name: event.target.value });
                  setValidationError("");
                }}
              />
            </label>
            <label className="form-field">
              <span>Country</span>
              <select
                name="country"
                value={company.country}
                onChange={(event) => setCompany({ ...company, country: event.target.value })}
              >
                <option value="IN">India</option>
                <option value="AE">United Arab Emirates</option>
              </select>
            </label>
            <label className="form-field">
              <span>Currency</span>
              <select
                name="currency"
                value={company.currency}
                onChange={(event) => setCompany({ ...company, currency: event.target.value })}
              >
                <option value="INR">INR — Indian Rupee</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>
            </label>
            <label className="form-field">
              <span>Timezone</span>
              <select
                name="timezone"
                value={company.timezone}
                onChange={(event) => setCompany({ ...company, timezone: event.target.value })}
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
              </select>
            </label>
            <label className="form-field">
              <span>Environment</span>
              <select
                name="environment_type"
                value={company.environment}
                onChange={(event) => setCompany({ ...company, environment: event.target.value })}
              >
                <option value="customer">Customer</option>
                <option value="test">Test environment</option>
              </select>
            </label>
          </fieldset>
          <fieldset data-step="2" hidden={step !== 2}>
            <legend>Who will administer ANUMA for this organization?</legend>
            <p>We&apos;ll invite this person to set up and manage their organization.</p>
            <label className="form-field">
              <span>Work email</span>
              <input
                autoComplete="email"
                name="email"
                required
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setValidationError("");
                }}
              />
            </label>
            <p className="role-explanation">
              <strong>Organization Administrator</strong>
              <br />
              Organization-wide people, structure, checks and settings access.
            </p>
          </fieldset>
          <section className="organization-review" hidden={step !== 3}>
            <h3>Review organization</h3>
            <dl>
              <dt>Organization</dt>
              <dd>{company.name}</dd>
              <dt>Country</dt>
              <dd>{company.country === "IN" ? "India" : "United Arab Emirates"}</dd>
              <dt>Currency</dt>
              <dd>{company.currency}</dd>
              <dt>Timezone</dt>
              <dd>{company.timezone}</dd>
              <dt>Administrator</dt>
              <dd>{email}</dd>
            </dl>
          </section>
          {validationError ? (
            <p className="auth-message auth-message-error" role="alert">
              {validationError}
            </p>
          ) : null}
          <footer>
            <button
              className="button button-quiet"
              onClick={step === 1 ? close : () => setStep(step - 1)}
              type="button"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>
            {step < 3 ? (
              <button
                className="button button-primary"
                onClick={() => continueFrom(step)}
                type="button"
              >
                Continue
              </button>
            ) : (
              <CreateOrganizationButton />
            )}
          </footer>
        </form>
      </dialog>
    </>
  );
}
