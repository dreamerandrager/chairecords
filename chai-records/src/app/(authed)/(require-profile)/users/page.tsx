'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase/supabase';
import { MinimalUserCard } from '@/customComponents/user/minimalUserCard';
import { Button } from '@/components/ui/button';

//TODO REFACTOR AND COMPONENTIZE THIS BETTER (PAGINATION ETC)

type Row = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pageFrom = page * PAGE_SIZE;
  const pageTo = pageFrom + PAGE_SIZE - 1;
  const totalPages = useMemo(
    () => (total !== null ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : null),
    [total]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);

      const { data, error, count } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, created_at', { count: 'exact' })
        .order('created_at', { ascending: false, nullsFirst: false })
        .range(pageFrom, pageTo); 

      if (cancelled) return;
      setLoading(false);

      if (error) {
        setErr(error.message);
        setRows([]);
        setTotal(null);
        return;
      }

      setRows(data ?? []);
      setTotal(count ?? 0);
    })();

    return () => { cancelled = true; };
  }, [pageFrom, pageTo]);

  const canPrev = page > 0;
  const canNext = total !== null ? (page + 1) * PAGE_SIZE < total : false;

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        {total !== null && (
          <div className="text-sm text-muted-foreground">
            Page {page + 1}{totalPages ? ` / ${totalPages}` : ''}{' '}
            · {total} total
          </div>
        )}
      </div>

      {err && (
        <div className="mb-4 rounded border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {/* Grid of user cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {!loading && rows.map((r) => (
          <MinimalUserCard
            key={r.id}
            displayName={r.display_name}
            avatarUrl={r.avatar_url}
          />
        ))}

        {/* simple skeletons while loading */}
        {loading &&
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="h-[76px] animate-pulse rounded border" />
          ))}
      </div>

      {/* Pagination controls */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={!canPrev || loading}
        >
          Prev
        </Button>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={!canNext || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
