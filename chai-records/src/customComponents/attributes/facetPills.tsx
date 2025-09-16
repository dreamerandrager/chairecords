'use client';
import { useEffect, useState } from 'react';
import { getFacetValuesByName } from '@/api/getFacetValuesByNames';

type Props = {
  facetName: string;
  mode: 'single' | 'multi';
  maxMulti?: number;
  disabled?: boolean;
  valueSingle?: string | null;
  valueMulti?: string[];
  onChangeSingle?: (val: string | null) => void;
  onChangeMulti?: (vals: string[]) => void;
};

export function FacetPills({
  facetName, mode, maxMulti = 3, disabled,
  valueSingle = null, valueMulti = [], onChangeSingle, onChangeMulti
}: Props) {
  const [options, setOptions] = useState<{ id:number; value:string; slug:string | null }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const { values } = await getFacetValuesByName(facetName);
        if (!cancel) setOptions(values as any);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [facetName]);

  if (loading) return <div className="text-sm opacity-70">Loading {facetName}…</div>;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = mode === 'single'
          ? valueSingle?.toLowerCase() === opt.value.toLowerCase()
          : valueMulti?.some(v => v.toLowerCase() === opt.value.toLowerCase());

        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (mode === 'single') {
                onChangeSingle?.(active ? null : opt.value);
              } else {
                const set = new Set((valueMulti ?? []).map(v => v.toLowerCase()));
                if (active) {
                  onChangeMulti?.((valueMulti ?? []).filter(v => v.toLowerCase() !== opt.value.toLowerCase()));
                } else {
                  if ((valueMulti?.length ?? 0) >= maxMulti) return; // enforce max
                  onChangeMulti?.([...(valueMulti ?? []), opt.value]);
                }
              }
            }}
            className={`px-3 py-1 rounded-full border text-sm ${active ? 'bg-primary text-white border-primary' : 'hover:bg-muted'}`}
            title={opt.value}
          >
            {opt.value}
          </button>
        );
      })}
    </div>
  );
}
