'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

export function InputModal({
  open,
  title = 'Add value',
  description,
  placeholder = 'Type here…',
  defaultValue = '',
  confirmLabel = 'Add',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  const [val, setVal] = useState(defaultValue ?? '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setVal(defaultValue ?? '');
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open, defaultValue]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm(val.trim());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, val, onCancel, onConfirm]);

  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200]',
        'bg-black/55 backdrop-blur-md',
        'flex items-center justify-center p-3 sm:p-6'
      )}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm">
        <button
          aria-label="Close"
          onClick={onCancel}
          className="absolute -top-2 -right-2 z-10 rounded-full bg-background/90 shadow p-1 hover:bg-background"
        >
          <X className="h-4 w-4" />
        </button>

        <Card className="rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="space-y-3">
            {title && <h3 className="text-base font-semibold">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}

            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={val}
              onChange={(e) => setVal(e.target.value)}
            />

            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="justify-center"
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                onClick={() => onConfirm(val.trim())}
                className="justify-center"
                disabled={val.trim().length === 0}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
