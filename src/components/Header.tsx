"use client";

import { motion } from "framer-motion";

export type Category = "all" | "sea" | "streets" | "architecture";

const FILTERS: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sea", label: "Sea" },
  { key: "streets", label: "Streets" },
  { key: "architecture", label: "Architecture" },
];

interface HeaderProps {
  active: Category;
  onChange: (c: Category) => void;
  visible: boolean;
}

export default function Header({ active, onChange, visible }: HeaderProps) {
  return (
    <motion.header
      className="sticky top-0 z-40 w-full"
      initial={{ y: -80, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="border-b border-surface-line/8 bg-ink/75 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8 py-4">
          <span className="font-display text-lg tracking-wide text-bone select-none">
            SARA<span className="text-gold">.</span>
          </span>

          <nav className="relative flex items-center gap-1 rounded-full border border-surface-line/10 bg-surface/70 p-1 shadow-[0_1px_4px_rgba(54,44,40,0.04)]">
            {FILTERS.map((f) => {
              const isActive = active === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => onChange(f.key)}
                  className={`relative px-3.5 sm:px-4 py-1.5 text-[12px] sm:text-[13px] font-body rounded-full transition-colors duration-300 ${
                    isActive ? "text-ink" : "text-bone-dim hover:text-bone"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="pill-bg"
                      className="absolute inset-0 rounded-full bg-gold"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
