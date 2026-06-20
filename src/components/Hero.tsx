"use client";

import { motion } from "framer-motion";

interface HeroProps {
  ready: boolean;
}

export default function Hero({ ready }: HeroProps) {
  return (
    <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* ambient backdrop glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.06] blur-[120px]" />
      </div>

      <motion.p
        className="font-mono text-[11px] sm:text-xs tracking-[0.35em] text-grey uppercase mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        Visual Architect
      </motion.p>

      <div className="overflow-hidden">
        <motion.h1
          className="font-display text-[18vw] sm:text-[12vw] md:text-[9rem] leading-[0.9] tracking-tight text-bone"
          initial={{ y: "100%" }}
          animate={ready ? { y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          SARA
        </motion.h1>
      </div>

      <motion.p
        className="mt-7 max-w-md font-body text-sm sm:text-base text-bone-dim leading-relaxed"
        initial={{ opacity: 0, y: 12 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        Systems thinker by trade, image-maker by instinct. An archive of frames
        collected between Cairo, Istanbul, and the coast.
      </motion.p>

      <motion.div
        className="mt-10 flex items-center gap-3 font-mono text-[11px] tracking-widest text-grey"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.95 }}
      >
        <span className="h-px w-8 bg-surface-line/20" />
        <span>SCROLL TO ENTER THE ARCHIVE</span>
        <span className="h-px w-8 bg-surface-line/20" />
      </motion.div>
    </section>
  );
}
