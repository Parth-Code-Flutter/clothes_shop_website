"use client";

import { useState, useTransition, type FormEvent } from "react";
import { addCustomerNoteAction, setCustomerMarketingAction } from "@/features/admin/customers/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import { buttonClass, inputClass } from "@/features/admin/components/ui";
import { cn } from "@/lib/utils";

function Switch({ checked, disabled, onChange, label, hint }: { checked: boolean; disabled?: boolean; onChange: (next: boolean) => void; label: string; hint: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-[13px] font-medium text-adm-ink">{label}</span>
        <span className="block text-[12px] text-adm-ink-faint">{hint}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adm-accent disabled:opacity-60",
          checked ? "bg-adm-accent" : "bg-adm-line-strong",
        )}
      >
        <span className={cn("inline-block size-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </button>
    </label>
  );
}

export function CustomerMarketing({ customerId, initial }: { customerId: string; initial: { email: boolean; sms: boolean } }) {
  const [state, setState] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [toast, showToast] = useToast();

  const change = (channel: "email" | "sms", subscribed: boolean) => {
    const previous = state;
    setState({ ...state, [channel]: subscribed });
    startTransition(async () => {
      const result = await setCustomerMarketingAction(customerId, channel, subscribed);
      if (!result.ok) setState(previous);
      showToast(result.message, !result.ok ? "error" : result.persisted ? "success" : "info");
    });
  };

  return (
    <div className="-mt-1 flex flex-col gap-4">
      <Switch checked={state.email} disabled={pending} onChange={(next) => change("email", next)} label="Email" hint="New drops, offers and restock alerts" />
      <Switch checked={state.sms} disabled={pending} onChange={(next) => change("sms", next)} label="SMS & WhatsApp" hint="Sale reminders and festive offers" />
      <p className="text-[12px] text-adm-ink-faint">Only change these when the customer asks. Order updates are always sent.</p>
      {toast}
    </div>
  );
}

export function CustomerNotes({ customerId }: { customerId: string }) {
  const [notes, setNotes] = useState<{ text: string; at: number }[]>([]);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [toast, showToast] = useToast();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await addCustomerNoteAction(customerId, note);
      if (!result.ok) {
        showToast(result.message, "error");
        return;
      }
      setNotes((current) => [{ text: note.trim(), at: Date.now() }, ...current]);
      setNote("");
      showToast(result.message, result.persisted ? "success" : "info");
    });
  };

  return (
    <div className="-mt-1">
      <form onSubmit={submit} className="flex flex-col gap-2">
        <label>
          <span className="sr-only">Add a note</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Sizes they prefer, special requests, anything your team should know"
            className={cn(inputClass, "h-auto resize-none py-2")}
          />
        </label>
        <button type="submit" disabled={pending || !note.trim()} className={cn(buttonClass.secondary, "self-end")}>
          Save note
        </button>
      </form>
      {notes.length ? (
        <ul className="mt-4 flex flex-col gap-3 border-t border-adm-line pt-4">
          {notes.map((entry) => (
            <li key={entry.at} className="text-[13px]">
              <p className="text-adm-ink">{entry.text}</p>
              <p className="mt-0.5 text-[12px] text-adm-ink-faint">You · Just now</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[12px] text-adm-ink-faint">No notes yet.</p>
      )}
      {toast}
    </div>
  );
}
