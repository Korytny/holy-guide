"use client";

import { motion, MotionProps, HTMLMotionProps } from "framer-motion"; // Import MotionProps and HTMLMotionProps

import { cn } from "@/lib/utils"; // Corrected import path

interface BlurIntProps extends HTMLMotionProps<'h1'>, MotionProps { // Extend with HTMLMotionProps<'h1'> and MotionProps
  word: string;
  className?: string;
  variant?: {
    hidden: { filter: string; opacity: number };
    visible: { filter: string; opacity: number };
  };
  duration?: number;
}
const BlurIn = ({ word, className, variant, duration = 1, ...rest }: BlurIntProps) => { // Destructure rest props
  const defaultVariants = {
    hidden: { filter: "blur(10px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 },
  };
  const combinedVariants = variant || defaultVariants;

  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      transition={{ duration }}
      variants={combinedVariants}
      className={cn(
        "font-display text-center text-4xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-7xl md:leading-[5rem]",
        className,
      )}
    >
      {word}
    </motion.h1>
  );
};

export { BlurIn };
