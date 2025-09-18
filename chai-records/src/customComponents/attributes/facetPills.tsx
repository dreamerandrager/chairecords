'use client';
import { useEffect, useMemo, useState } from 'react';
import { getFacetValuesByName } from '@/api/getFacetValuesByNames';
import { InputModal } from '../inputs/inputModal';

type BaseOption = { id: number | null; value: string; slug: string | null; _custom?: boolean };

type Props = {
  facetName: string;
  mode: 'single' | 'multi';
  maxMulti?: number;
  disabled?: boolean;
  valueSingle?: string | null;
  valueMulti?: string[];
  onChangeSingle?: (val: string | null) => void;
  onChangeMulti?: (vals: string[]) => void;
  readOnly?: boolean;
  collapsible?: boolean;         // multi only
  allowUserCreate?: boolean;     // multi only
  onUserAddedChange?: (vals: string[]) => void; // reports newly added (case-insensitive unique)
};

export function FacetPills({
  facetName,
  mode,
  maxMulti = 3,
  disabled,
  valueSingle = null,
  valueMulti = [],
  onChangeSingle,
  onChangeMulti,
  readOnly = false,
  collapsible = true,
  allowUserCreate = true,
  onUserAddedChange,
}: Props) {
  const [options, setOptions] = useState<BaseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(mode === 'single' ? true : !collapsible);
  const [userAdded, setUserAdded] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false); // ⬅️ modal open state

  // Fetch facet values
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const { values } = await getFacetValuesByName(facetName);
        if (!cancel) {
          const mapped = (values ?? []).map((v: any) => ({
            id: v.id as number,
            value: String(v.value),
            slug: (v.slug ?? null) as string | null,
          }));
          setOptions(mapped);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [facetName]);

  // Bubble user-added values up
  useEffect(() => {
    onUserAddedChange?.(userAdded);
  }, [userAdded, onUserAddedChange]);

  const norm = (s: string) => s.trim().toLowerCase();
  const hasSelected = mode === 'single' ? !!valueSingle : (valueMulti?.length ?? 0) > 0;

  const visibleOptions: BaseOption[] = useMemo(() => {
    if (mode === 'multi' && !expanded) {
      const selectedSet = new Set((valueMulti ?? []).map(norm));
      return options.filter(o => selectedSet.has(norm(o.value)));
    }
    return options;
  }, [mode, expanded, options, valueMulti]);

  if (loading) return <div className="text-sm opacity-70">Loading {facetName}…</div>;

  const Toggle = (mode === 'multi' && collapsible) ? (
    <button
      type="button"
      className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
      onClick={() => setExpanded(e => !e)}
      disabled={disabled || readOnly}
    >
      {expanded ? 'Hide attributes' : 'Select attributes'} <span aria-hidden>▾</span>
      {hasSelected && !expanded ? (
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
          {(valueMulti ?? []).length} selected
        </span>
      ) : null}
    </button>
  ) : null;

  // “Add your own” confirm handler
  const confirmAdd = (raw: string) => {
    const val = raw.trim();
    if (!val) { setAddOpen(false); return; }

    // enforce max
    if (mode === 'multi' && (valueMulti?.length ?? 0) >= maxMulti) {
      setAddOpen(false);
      return;
    }

    const exists = options.some(o => norm(o.value) === norm(val));
    const alreadySelected = (valueMulti ?? []).some(v => norm(v) === norm(val));

    if (!exists) {
      setOptions(prev => [{ id: null, value: val, slug: null, _custom: true }, ...prev]);
    }
    if (!alreadySelected) {
      onChangeMulti?.([...(valueMulti ?? []), val]);
    }
    setUserAdded(prev => {
      const set = new Set(prev.map(norm));
      set.add(norm(val));
      return Array.from(set);
    });

    setAddOpen(false);
  };

  return (
    <div>
      {Toggle}
      <div className="flex flex-wrap gap-2">
        {mode === 'multi' && expanded && allowUserCreate && !readOnly && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setAddOpen(true)}
            className="px-3 py-1 rounded-full border text-sm
                       bg-transparent text-foreground border-dashed hover:bg-muted"
            title="Add your own"
          >
            + Add your own
          </button>
        )}

        {visibleOptions.map(opt => {
          const active = mode === 'single'
            ? valueSingle?.toLowerCase() === opt.value.toLowerCase()
            : valueMulti?.some(v => v.toLowerCase() === opt.value.toLowerCase());

          const classes =
            `px-3 py-1 rounded-full border text-sm transition
             ${readOnly ? 'cursor-default' : 'cursor-pointer'}
             ${active
               ? 'bg-primary text-primary-foreground border-primary'
               : 'bg-transparent text-foreground border-border hover:bg-muted'
             }`;

          return (
            <button
              key={`${opt.id ?? 'custom'}:${opt.value}`}
              type="button"
              disabled={disabled}
              aria-disabled={disabled || readOnly}
              tabIndex={readOnly ? -1 : undefined}
              onClick={() => {
                if (readOnly) return;
                if (mode === 'single') {
                  onChangeSingle?.(active ? null : opt.value);
                } else {
                  if (active) {
                    onChangeMulti?.((valueMulti ?? []).filter(v => v.toLowerCase() !== opt.value.toLowerCase()));
                  } else {
                    if ((valueMulti?.length ?? 0) >= maxMulti) return;
                    onChangeMulti?.([...(valueMulti ?? []), opt.value]);
                  }
                }
              }}
              className={classes}
              title={opt.value}
            >
              {opt.value.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Input modal for "Add your own" */}
      <InputModal
        open={addOpen}
        title={`Add ${facetName}`}
        description={`Suggest a new ${facetName.toLowerCase()} to help describe the item.`}
        placeholder={`Enter ${facetName.toLowerCase()}…`}
        confirmLabel="Add"
        cancelLabel="Cancel"
        onConfirm={confirmAdd}
        onCancel={() => setAddOpen(false)}
      />
    </div>
  );
}
