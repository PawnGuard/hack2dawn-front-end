import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getIdenticonUrl(seed: string, size: number = 120): string {
  // El URI encoding asegura que espacios o caracteres raros en el username no rompan la URL
  const encodedSeed = encodeURIComponent(seed.trim());
  return `https://api.dicebear.com/9.x/identicon/svg?seed=${encodedSeed}&size=${size}&backgroundColor=transparent`;
}