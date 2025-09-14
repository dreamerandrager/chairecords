import { getAllProfiles } from "@/api/getAllProfiles";
import { Profile } from "@/types/profile";
import { useEffect, useState } from "react";

export function useGetAllProfiles(batchSize: number) {
  const [rows, setRows] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        let page = 0;
        let total = Number.POSITIVE_INFINITY;
        let acc: Profile[] = [];

        while (!cancelled && acc.length < total) {
          const res = await getAllProfiles(page, batchSize);
          if (cancelled) return;

          acc = acc.concat(res.rows);
          total = res.total ?? acc.length; 
          page += 1;

          if (!res.rows || res.rows.length === 0) break;
        }

        if (!cancelled) setRows(acc);
      } catch (e) {
        if (!cancelled) return;
        const msg =
          e instanceof Error ? e.message : "Failed to load users";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [batchSize]);

  return { rows, loading, error } as const;
}