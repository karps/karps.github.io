import { Time } from "@/types/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertSecondsToTime = (seconds: number): Time => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return {
    minutes,
    seconds: remainingSeconds,
  };
};

export const getCopyString = (part: number, duty: string) => {
  const d = new Date();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  switch (part) {
    case 0:
      return `${duty} start @ :${minutes}`;
    case 1:
      return `${duty} mid @ :${minutes}`;
    case 2:
      if (JSON.parse(localStorage.getItem("continuous") ?? "false")) {
        return `${duty} start/end @ :${minutes} - looking for confirmations`;
      } else {
        return `${duty} end @ :${minutes} - looking for confirmations`;
      }
    default:
      return "error";
  }
};
