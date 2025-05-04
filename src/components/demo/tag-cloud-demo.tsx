
import { TagCloud } from "@/components/ui/tag-cloud";

const exampleTags = [
  "React",
  "TypeScript",
  "JavaScript",
  "TailwindCSS",
  "Node.js",
  "Frontend",
  "Backend",
  "Fullstack",
  "Web Development",
  "UI/UX",
  "shadcn/ui",
  "Vite",
  "Next.js",
  "API",
  "Database",
  "Cloud",
  "DevOps",
  "Testing",
  "Agile",
];

export function TagCloudDemo() {
  return (
    <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg border bg-background px-10 py-16 ">
      {/* Using a light background (bg-background is often light by default) */}
      <TagCloud tags={exampleTags} />
    </div>
  );
}
