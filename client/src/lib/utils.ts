import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function parseCurrencyToCents(value: string | number) {
  if (typeof value === "number") return Math.round(value * 100);
  const parsed = parseFloat(value.replace(",", "."));
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}
