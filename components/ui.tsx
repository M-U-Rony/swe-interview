import Link from "next/link";

/** Small shared pieces of the v2 UI (D12). */

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="font-mono text-[15px] font-medium no-underline">
      swe/interview
    </Link>
  );
}

export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-mono text-[13px] uppercase tracking-[0.04em] ${className}`}>{children}</span>;
}

export function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="m-0 font-mono text-[13px] font-medium uppercase tracking-[0.04em]">
      {children}
    </h2>
  );
}

export function Arrow() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function MicIcon({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

/** Filled squares for used items, outlined for the rest (quota, answers). */
export function Squares({ filled, total, size = 14, dashedEmpty = false, light = false }: {
  filled: number;
  total: number;
  size?: number;
  dashedEmpty?: boolean;
  light?: boolean;
}) {
  const fill = light ? "bg-night-text" : "bg-ink";
  const border = light ? "border-night-text" : "border-ink";
  return (
    <span aria-hidden="true" className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{ width: size, height: size }}
          className={i < filled ? fill : `box-border border-[1.5px] ${dashedEmpty ? "border-dashed" : ""} ${border}`}
        />
      ))}
    </span>
  );
}

export const buttonPrimary =
  "inline-flex items-center gap-3.5 bg-ink px-7 py-5 text-lg font-semibold text-paper no-underline hover:bg-black disabled:opacity-50";
export const buttonOutline =
  "inline-flex min-h-12 items-center justify-center gap-2 border-[1.5px] border-ink px-5 py-3 font-semibold hover:bg-ink hover:text-paper disabled:opacity-50";
export const inputClass =
  "w-full border border-ink bg-surface px-4 py-3 text-base text-ink outline-none focus-visible:border-signal";
