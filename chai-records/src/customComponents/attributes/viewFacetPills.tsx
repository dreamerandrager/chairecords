// customComponents/attributes/viewFacetPills.tsx
'use client';

import { cn } from '@/lib/utils';

export type ViewFacetPillsProps = {
  singleFacet?: { name: string; value: string } | null;
  multiFacet?: { name: string; values: string[] } | null;
  className?: string;
};

export function ViewFacetPills({
  singleFacet,
  multiFacet,
  className,
}: ViewFacetPillsProps) {
  const single = singleFacet?.value?.trim();
  const multis = (multiFacet?.values ?? [])
    .map(v => (v ?? '').trim())
    .filter(Boolean);

  if (!single && multis.length === 0) return null;

  const pillBase =
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap';

  return (
    <div className={cn('relative', className)}>
      {/* single-line row, horizontally scrollable if needed */}
      <div
        className={cn(
          'flex items-center gap-1.5 overflow-x-auto py-1',
          'whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none]',
          '[&::-webkit-scrollbar]:hidden'
        )}
      >
        {/* Emphasized single facet (if present) */}
        {single && (
          <span
            className={cn(
              pillBase,
              'bg-primary/10 text-primary border-primary/30 font-medium'
            )}
            title={singleFacet?.name}
          >
            {singleFacet?.name ? (
              <span className="mr-1 font-semibold">{singleFacet.name}:</span>
            ) : null}
            {single}
          </span>
        )}

        {/* Other attributes (neutral style) */}
        {multis.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className={cn(
              pillBase,
              'bg-transparent text-foreground border-border'
            )}
            title={multiFacet?.name}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
