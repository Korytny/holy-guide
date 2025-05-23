"use client";

import { WordPullUp } from "@/components/ui/word-pull-up";

export function WordPullUpDemo() {
  return (
    <WordPullUp
      className="text-4xl font-bold tracking-[-0.02em] text-black dark:text-white md:text-7xl md:leading-[5rem]"
      words="Word Pull Up"
    />
  );
}
