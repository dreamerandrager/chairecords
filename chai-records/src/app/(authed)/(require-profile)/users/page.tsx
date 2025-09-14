"use client";

import { Paginate } from "@/customComponents/paginate/paginate";
import { MinimalUserCard } from "@/customComponents/user/minimalUserCard";
import { useGetAllProfiles } from "@/hooks/useGetAllProfiles";

export default function UsersPage() {
  const { rows, loading, error } = useGetAllProfiles(200);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
        <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
      <Paginate items={rows} pageSize={12} isLoading={loading}>
        {(pageItems) => (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((r) => (
              <MinimalUserCard
                key={r?.id}
                id={r?.id}
                displayName={r?.display_name}
                avatarUrl={r?.avatar_url}
                admin={r?.admin? true : false}
                createdAt={r?.created_at}
              />
            ))}
          </div>
        )}
      </Paginate>
    </div>
  );
}
