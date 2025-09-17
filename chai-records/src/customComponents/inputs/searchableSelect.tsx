'use client';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

type Option = { value: string; label: string; meta?: any };

export function SearchableSelect({
  value,
  onChange,                // (next: Option) => void
  loadOptions,             // (query: string) => Promise<Option[]>
  placeholder = 'Search…',
  disabled,
  emptyText = 'No results',
  initialQuery = '',
  minChars = 2,            // only search after N chars
  debounceMs = 250,        // debounce typing before fetching
  previewOptions = false,  // NEW: show top results on focus
  previewCount = 5,        // NEW: how many to preview
  onTextChange,  
  selectedOption = null,   
}: {
  value: string | null;
  onChange: (next: Option) => void;
  loadOptions: (q: string) => Promise<Option[]>;
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
  initialQuery?: string;
  minChars?: number;
  debounceMs?: number;
  previewOptions?: boolean;
  previewCount?: number;
  onTextChange?: (text: string) => void;
  selectedOption?: Option | null;
}) {
  // display/input states
  const [q, setQ] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [opts, setOpts] = useState<Option[]>([]);
  const [chosen, setChosen] = useState<Option | null>(null); // keep selected label independent of opts

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

   // sync chosen with parent (programmatic select/clear)
  useEffect(() => {
    setChosen(selectedOption ?? null);
  }, [selectedOption]);

  // close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // debounce the query
  const [debouncedQ, setDebouncedQ] = useState(q.trim());
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [q, debounceMs]);

  // fetch options only when typing (not when selected), after minChars
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (disabled) return;
      if (chosen) return; // don’t search when an option is already chosen
      const term = debouncedQ;

      if (term.length < minChars) {
        // when preview is enabled, keep whatever we previewed; otherwise clear
        if (!previewOptions) setOpts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await loadOptions(term);
        if (!cancel) setOpts(data);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [debouncedQ, chosen, loadOptions, minChars, disabled, previewOptions]);

  async function showPreview() {
    if (!previewOptions || disabled) return;
    setOpen(true);
    setLoading(true);
    try {
      const data = await loadOptions('');           // expect API to return “top” items for empty query
      setOpts((data ?? []).slice(0, previewCount)); // first N
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(opt: Option) {
    setChosen(opt);           // remember the label
    onChange(opt);            // tell parent the id/value
    setOpen(false);           // close dropdown
  }

  function clearSelection() {
    if (chosen) {
      setChosen(null);
      onChange({ value: '', label: '' }); // parent clears value
    }
  }

  const display = chosen ? chosen.label : q;

  return (
    <div className="relative space-y-2">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={display}
        onFocus={async () => {
          if (previewOptions) {
            await showPreview();           // open & preview immediately
          } else if (!chosen) {
            setOpen(true);                 // behave like before
          }
        }}
         onChange={(e) => {
          if (chosen) {
            setChosen(null);
            onChange({ value: '', label: '' });
          }
          const next = e.target.value;
          setQ(next);
          onTextChange?.(next);            // NEW: bubble typed text
          setOpen(true);
        }}
        disabled={disabled}
        autoComplete="off"
      />

      {open && (previewOptions || !chosen) && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-background p-2 text-sm dark:bg-gray-800 max-h-56 overflow-auto shadow"
        >
          {loading && <div>Searching…</div>}
          {!loading && opts.length === 0 && (
            <div className="opacity-70">
              {debouncedQ.length < minChars && !previewOptions
                ? `Type at least ${minChars} characters…`
                : emptyText}
            </div>
          )}
          {!loading &&
            opts.map((o) => (
              <button
                key={o.value}
                type="button"
                className="block w-full text-left px-2 py-1 rounded hover:bg-muted"
                onClick={() => handleSelect(o)}
              >
                {o.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
