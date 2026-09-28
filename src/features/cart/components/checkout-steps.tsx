import Link from "next/link";
import styles from "./cart-view.module.css";

const steps = [
  { id: "bag", no: "01", label: "Bag", href: "/cart" },
  { id: "details", no: "02", label: "Details", href: "/checkout" },
  { id: "pay", no: "03", label: "Pay", href: null },
] as const;

type Step = (typeof steps)[number]["id"];

export function CheckoutSteps({ current }: { current: Step }) {
  const currentIndex = steps.findIndex((step) => step.id === current);
  return (
    <ol className={styles.steps} aria-label="Checkout steps">
      {steps.map((step, index) => {
        const content = <><b>{step.no}</b> {step.label}</>;
        const done = index < currentIndex && step.href;
        return [
          index > 0 ? <li key={`${step.id}-line`} className={styles.stepLine} aria-hidden="true" /> : null,
          <li key={step.id}>
            {done ? (
              <Link href={step.href} className={`${styles.step} ${styles.stepDone} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}>{content}</Link>
            ) : (
              <span className={styles.step} aria-current={step.id === current ? "step" : undefined}>{content}</span>
            )}
          </li>,
        ];
      })}
    </ol>
  );
}
