"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const BOOT_LINES = [
  "$ initializing visual_archive.sys",
  "$ mounting /src/identity ............ ok",
  "$ loading aperture, light, grain ..... ok",
  "$ compiling 24 frames ................ ok",
  "$ render target: human eye",
];

interface BootIntroProps {
  onComplete: () => void;
}

export default function BootIntro({ onComplete }: BootIntroProps) {
  const prefersReduced = useReducedMotion();
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [curtainUp, setCurtainUp] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (prefersReduced) {
      const t = setTimeout(() => {
        setVisibleLines(BOOT_LINES.length);
        setProgress(100);
        setCurtainUp(true);
      }, 200);
      return () => clearTimeout(t);
    }

    let lineIdx = 0;
    const lineTimer = setInterval(() => {
      lineIdx += 1;
      setVisibleLines(lineIdx);
      if (lineIdx >= BOOT_LINES.length) clearInterval(lineTimer);
    }, 260);

    let p = 0;
    const progTimer = setInterval(() => {
      p += Math.random() * 14 + 6;
      if (p >= 100) {
        p = 100;
        clearInterval(progTimer);
        setTimeout(() => setCurtainUp(true), 420);
      }
      setProgress(Math.min(p, 100));
    }, 180);

    return () => {
      clearInterval(lineTimer);
      clearInterval(progTimer);
    };
  }, [prefersReduced]);

  useEffect(() => {
    if (curtainUp) {
      const t = setTimeout(() => {
        setDone(true);
        onComplete();
      }, prefersReduced ? 50 : 1100);
      return () => clearTimeout(t);
    }
  }, [curtainUp, onComplete, prefersReduced]);

  if (done) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink"
        initial={{ y: 0 }}
        animate={curtainUp ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="w-full max-w-md px-8 font-mono text-[13px] sm:text-sm text-bone-dim">
          <div className="mb-6 flex items-center gap-2 text-grey">
            <span className="h-2 w-2 rounded-full bg-gold/70" />
            <span className="tracking-wider">SYSTEM BOOT</span>
          </div>

          <div className="space-y-1.5 min-h-[140px]">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={i === BOOT_LINES.length - 1 ? "text-gold" : ""}
              >
                {line}
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-[11px] tracking-widest text-grey">
              <span>LOADING</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="h-px w-full bg-surface-line/15 overflow-hidden">
              <motion.div
                className="h-full bg-gold"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.15, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
