"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-8 space-y-7" noValidate>
      <div className="space-y-3">
        <label htmlFor="email" className="block text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email ?? "demo@mindbase.id"}
          className="px-input block w-full px-4 py-3 text-base outline-none"
        />
      </div>
      <div className="space-y-3">
        <label htmlFor="password" className="block text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          placeholder="Minimal 6 karakter"
          className="px-input block w-full px-4 py-3 text-base outline-none"
        />
      </div>

      {state.error && (
        <p role="alert" className="px-flat mx-1 bg-saffron/20 px-4 py-3 text-sm font-medium [--line:var(--color-saffron)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-btn w-full bg-forsythia px-6 py-4 text-base font-bold text-noir disabled:opacity-70 [--shade:var(--color-saffron)]"
      >
        {pending ? "Memuat…" : "Masuk"}
      </button>
    </form>
  );
}
