"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function PublicNavigation() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setOpen(false);
      trigger.current?.focus();
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const dismiss = () => setOpen(false);

  return (
    <header className="marketing-nav">
      <Link className="wordmark" href="/">
        ANUMA
      </Link>
      <nav aria-label="Public navigation" className="marketing-nav-links">
        <a href="#product">Product</a>
        <a href="#how-it-works">How it works</a>
      </nav>
      <div className="marketing-nav-actions">
        <Link href="/sign-in">Sign in</Link>
        <a className="button button-primary" href="mailto:hello@anuma.ai?subject=ANUMA%20demo">
          Book a demo
        </a>
      </div>
      <button
        aria-controls="public-mobile-menu"
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="public-menu-trigger"
        onClick={() => setOpen((value) => !value)}
        ref={trigger}
        type="button"
      >
        {open ? "Close" : "Menu"}
      </button>
      <div
        className={open ? "public-mobile-menu is-open" : "public-mobile-menu"}
        id="public-mobile-menu"
      >
        <nav aria-label="Mobile public navigation">
          <a href="#product" onClick={dismiss}>
            Product
          </a>
          <a href="#how-it-works" onClick={dismiss}>
            How it works
          </a>
          <span />
          <Link href="/sign-in" onClick={dismiss}>
            Sign in
          </Link>
          <a
            className="button button-primary"
            href="mailto:hello@anuma.ai?subject=ANUMA%20demo"
            onClick={dismiss}
          >
            Book a demo
          </a>
        </nav>
      </div>
    </header>
  );
}
