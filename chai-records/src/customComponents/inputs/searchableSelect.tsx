'use client';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';

type Option = { value: string; label: string; meta?: any };

export function SearchableSelect({
  value,
  onChange,
  loadOptions,     // (query: string) => Promise<Option[]>
  placeholder = 'Search…',
  disabled,
  emptyText = 'No results',
  initialQuery = '',
}: {
  value: string | null;
  onChange: (next: Option) => void;
  loadOptions: (q: string) => Promise<Option[]>;
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [opts, setOpts] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const data = await loadOptions(q);
        if (!cancel) setOpts(data);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [q, loadOptions]);

  const selected = useMemo(() => opts.find(o => o.value === value) ?? null, [opts, value]);

  return (
    <div className="space-y-2">
      <Input
        placeholder={placeholder}
        value={selected ? selected.label : q}
        onChange={(e) => {
          if (selected) onChange({ value: '', label: '' }); 
          setQ(e.target.value);
        }}
        disabled={disabled}
      />
      <div className="rounded-md border p-2 text-sm dark:bg-gray-800 max-h-56 overflow-auto">
        {loading && <div>Searching…</div>}
        {!loading && opts.length === 0 && <div>{emptyText}</div>}
        {!loading && opts.map((o) => (
          <button
            key={o.value}
            type="button"
            className="block w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
            onClick={() => onChange(o)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
