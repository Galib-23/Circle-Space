import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateString: string): string {
  const currentDate: Date = new Date();
  const pastDate: Date = new Date(dateString);

  const timeDifference: number = currentDate.getTime() - pastDate.getTime();
  const seconds: number = Math.floor(timeDifference / 1000);
  const minutes: number = Math.floor(seconds / 60);
  const hours: number = Math.floor(minutes / 60);
  const days: number = Math.floor(hours / 24);

  if (days > 1) {
      return `${days} days ago`;
  } else if (hours > 1) {
      return `${hours} hours ago`;
  } else if (minutes > 1) {
      return `${minutes} minutes ago`;
  } else if(seconds > 1){
      return `${seconds} seconds ago`;
  } else {
    return 'Just now'
  }
}
