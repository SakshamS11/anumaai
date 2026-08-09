"use client";

import type { ReactNode } from "react";
import { useRef } from "react";

export function ActionDialog({
  buttonLabel,
  eyebrow,
  title,
  children,
}: {
  buttonLabel: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        className="button button-primary"
        onClick={() => dialog.current?.showModal()}
        type="button"
      >
        {buttonLabel}
      </button>
      <dialog className="product-dialog" ref={dialog}>
        <header>
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2>{title}</h2>
          </div>
          <button
            aria-label="Close"
            className="dialog-close"
            onClick={() => dialog.current?.close()}
            type="button"
          >
            ×
          </button>
        </header>
        {children}
      </dialog>
    </>
  );
}
