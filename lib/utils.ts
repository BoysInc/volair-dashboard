import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumberWithCommas(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatCurrency(value: number | string, currency: string = 'USD'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}


// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T, E = Error>(
  promise: Promise<T>, errorType?: new (...args: any[]) => E
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    // If an error type is provided, return it
    if (errorType) {
      return { data: null, error: error as E };
    }

    // If no error type is provided, return a generic error
    return { data: null, error: error as E };
  }
}