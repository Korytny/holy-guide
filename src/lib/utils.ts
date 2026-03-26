import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert Supabase Storage URLs to proxy URLs and fix double slashes
export function convertImageUrlToProxy(url: string): string {
  if (!url) return url;
  return url
    .replace('https://rxvckkqqunyqtxjyabub.supabase.co/storage/v1/object/public/', 'https://sb.productmind.ru/storage/v1/object/public/')
    .replace(/\/+/g, '/');
}
