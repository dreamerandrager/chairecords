'use client';

import { ClipLoader } from 'react-spinners';
import { cn } from '@/lib/utils';

type LoaderProps = {
  variant?: 'inline' | 'container' | 'fullscreen';
  size?: number;
  label?: string;
  message?: string;
  className?: string;        
  spinnerClassName?: string;  
};

export function Loader({
  variant = 'container',
  size = 24,
  label = 'Loading…',
  message,
  className,
  spinnerClassName = 'text-foreground/70',
}: LoaderProps) {
  if (variant === 'fullscreen') {
    return (
      <div role="status" aria-label={label}
           className={cn('fixed inset-0 grid place-items-center', className)}>
        <LoaderBody size={size} message={message} spinnerClassName={spinnerClassName} />
      </div>
    );
  }

  if (variant === 'container') {
    // Centers within the parent box; gives itself some height if parent has none.
    return (
      <div role="status" aria-label={label}
           className={cn('grid place-items-center w-full h-full min-h-[50vh]', className)}>
        <LoaderBody size={size} message={message} spinnerClassName={spinnerClassName} />
      </div>
    );
  }

  // inline
  return (
    <span role="status" aria-label={label} className={spinnerClassName}>
      <ClipLoader size={size} color="currentColor" />
    </span>
  );
}

function LoaderBody({
  size, message, spinnerClassName,
}: { size: number; message?: string; spinnerClassName: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={spinnerClassName}>
        <ClipLoader size={size} color="currentColor" />
      </span>
      {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
