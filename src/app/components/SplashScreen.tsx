import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import mbsLogo from "@/imports/MBS_-_fundo_Preto.png";

interface Props {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<"logo" | "tagline" | "done">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("tagline"), 1400);
    const t2 = setTimeout(() => setPhase("done"), 3800);
    const t3 = setTimeout(() => onFinish(), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4, ease: "easeIn" }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: "radial-gradient(ellipse at 40% 40%, #0d1e3a 0%, #070d1a 70%)",
          }}
        >
          {/* Subtle grid lines */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Glow behind logo */}
          <div className="absolute w-56 h-56 rounded-full bg-blue-700/20 blur-3xl" />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-64"
          >
            <ImageWithFallback
              src={mbsLogo}
              alt="MBS Correio Pneumático"
              className="w-full object-contain"
            />
          </motion.div>

          {/* Tagline */}
          <AnimatePresence>
            {phase === "tagline" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 mt-6 flex flex-col items-center gap-2"
              >
                <div className="w-10 h-px bg-blue-500/60" />
                <p className="text-slate-300 text-sm text-center px-8 tracking-wide">
                  Soluções simples para problemas complexos
                </p>
                <div className="w-10 h-px bg-blue-500/60" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading bar */}
          <div className="absolute bottom-12 w-32 h-px bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3.6, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
