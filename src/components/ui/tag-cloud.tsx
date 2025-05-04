
"use client"

import React from "react";
import {
  Cloud,
  ICloud,
} from "react-icon-cloud";
import { cn } from "@/lib/utils"; // Assuming you have this utility

// Basic cloud properties, adjust as needed
export const cloudProps: Omit<ICloud, "children"> = {
  containerProps: {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
  },
  // Using simpler options, customize as needed
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    activeCursor: "pointer", // Changed cursor
    tooltip: "native",
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: "#0000", // Transparent outline
    maxSpeed: 0.04,
    minSpeed: 0.02,
    textFont: null, // Use default font
    textColour: "#000000", // Default to black text for light background
  },
};

// Props for the TagCloud component
export type TagCloudProps = {
  tags: string[]; // Expecting an array of strings
  className?: string;
  cloudOptions?: Partial<ICloud["options"]>; // Allow overriding options
  tagClassName?: string; // Allow custom styling for tags
};

export function TagCloud({ tags, className, cloudOptions, tagClassName }: TagCloudProps) {

  // Merge default options with any provided overrides
  const mergedOptions = { ...cloudProps.options, ...cloudOptions };

  // Safeguard: Ensure tags is an array before mapping
  const renderedTags = React.useMemo(() => {
    if (!Array.isArray(tags)) {
      console.error("[TagCloud] Received non-array tags prop:", tags);
      return null; // Return null or an empty fragment if tags is not an array
    }
    return tags.map((tag, index) => (
      <span 
        key={index} 
        className={cn("cursor-pointer text-sm hover:text-primary", tagClassName)} // Basic styling
      >
        {tag}
      </span>
    ));
  }, [tags, tagClassName]); // Recalculate if tags or className changes

  // Don't render the cloud if tags are invalid or empty after validation
  if (!renderedTags) {
    return null;
  }

  return (
    <div className={cn("relative", className)}> 
      {/* @ts-ignore - Cloud component might have type issues with span children */}
      <Cloud {...cloudProps} options={mergedOptions}>
        <>{renderedTags}</>
      </Cloud>
    </div>
  );
}
