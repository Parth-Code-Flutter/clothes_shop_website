"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ACCOUNT_STORAGE_KEY,
  emptyAccount,
  parseAccount,
  type LocalAccount,
} from "./utils";

type AccountContextValue = {
  account: LocalAccount | null;
  signedIn: boolean;
  saveAccount: (account: LocalAccount) => void;
  signOut: () => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

let memoryAccount: LocalAccount | null = emptyAccount();
let hydrated = false;
const listeners = new Set<() => void>();
const serverAccount: LocalAccount | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  memoryAccount = parseAccount(
    window.localStorage.getItem(ACCOUNT_STORAGE_KEY),
  );
  hydrated = true;
}

function writeAccount(next: LocalAccount | null) {
  memoryAccount = next;
  if (typeof window !== "undefined") {
    if (next) {
      window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(ACCOUNT_STORAGE_KEY);
    }
  }
  emit();
}

function subscribe(listener: () => void) {
  hydrateFromStorage();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  hydrateFromStorage();
  return memoryAccount;
}

function getServerSnapshot() {
  return serverAccount;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const account = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const saveAccount = useCallback((next: LocalAccount) => {
    writeAccount({
      name: next.name.trim(),
      email: next.email.trim(),
    });
  }, []);

  const signOut = useCallback(() => writeAccount(null), []);

  const value = useMemo<AccountContextValue>(
    () => ({
      account,
      signedIn: Boolean(account),
      saveAccount,
      signOut,
    }),
    [account, saveAccount, signOut],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) {
    throw new Error("useAccount must be used inside AccountProvider");
  }
  return value;
}
