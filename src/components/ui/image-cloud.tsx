
"use client"

import React from "react";
import {
  Cloud,
  ICloud,
} from "react-icon-cloud";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom'; // Import Link for navigation

// Basic cloud properties
export const imageCloudProps: Omit<ICloud, "children"> = {
  containerProps: {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%", 
    },
  },
  options: {
    reverse: true,
    depth: 1.5, 
    wheelZoom: false,
    imageScale: 0.2, // Small icons
    activeCursor: "pointer",
    tooltip: "native", 
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: "#0000",
    maxSpeed: 0.015, // Reduced maxSpeed for slower animation
    minSpeed: 0.005, // Reduced minSpeed for slower animation
    radiusX: 2000, // Changed from radius to radiusX
  },
};

// Type for individual items in the cloud
export type ImageCloudItem = {
  id: string | number;
  imageUrl: string;
  alt: string;
  link?: string; // Optional link for the image
};

// Props for the ImageCloud component
export type ImageCloudProps = {
  items: ImageCloudItem[];
  className?: string;
  cloudOptions?: Partial<ICloud["options"]>;
  imageClassName?: string; // Allow custom styling for images
};

export function ImageCloud({ items, className, cloudOptions, imageClassName }: ImageCloudProps) {

  // Merge default options with any provided overrides
  const mergedOptions = { ...imageCloudProps.options, ...cloudOptions };

  // Ensure items is an array before mapping
  const renderedImages = React.useMemo(() => {
    if (!Array.isArray(items)) {
      console.error("[ImageCloud] Received non-array items prop:", items);
      return null;
    }
    return items.map((item) => {
      const imgElement = (
        <img
          key={item.id} // Use item.id as key
          src={item.imageUrl}
          alt={item.alt} 
          title={item.alt} // Add title for native tooltip
          className={cn(
            "w-6 h-6 object-cover rounded-full shadow-sm", // Keep base size or adjust if needed
            imageClassName
          )} 
        />
      );

      // Wrap with Link if provided
      if (item.link) {
        return (
          <Link to={item.link} key={item.id} className="block">
            {imgElement}
          </Link>
        );
      }

      return imgElement; // Return plain image if no link
    });
  }, [items, imageClassName]);

  if (!renderedImages || renderedImages.length === 0) {
      return null; // Don't render if no valid items
  }

  return (
    // Added 'image-cloud-wrapper' class
    <div 
      className={cn("relative w-full h-full image-cloud-wrapper", className)}
    > 
      {/* @ts-ignore - Cloud component might have type issues with img/a children */}
      <Cloud {...imageCloudProps} options={mergedOptions}>
        <>{renderedImages}</>
      </Cloud>
    </div>
  );
}
