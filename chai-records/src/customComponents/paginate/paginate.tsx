"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  TotalResults, 
} from "@/components/ui/pagination";

type PaginateProps<T> = {
  items: T[];
  pageSize: number;
  children: (pageItems: T[], meta: { page: number; totalPages: number; total: number }) => React.ReactNode;
  isLoading?: boolean;
  initialPage?: number;
  className?: string;
};

export function Paginate<T>({
  items,
  pageSize,
  children,
  isLoading = false,
  initialPage = 0,
  className,
}: PaginateProps<T>) {
  const [page, setPage] = useState(initialPage); 

  const total = items.length;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / Math.max(1, pageSize))),
    [total, pageSize]
  );

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1));
  }, [totalPages, page]);

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  const prev = () => {
    if (!canPrev || isLoading) return;
    setPage((p) => Math.max(0, p - 1));
  };

  const next = () => {
    if (!canNext || isLoading) return;
    setPage((p) => (p + 1 < totalPages ? p + 1 : p));
  };

  const start = page * pageSize;
  const end = start + pageSize;
  const pageItems = useMemo(() => items.slice(start, end), [items, start, end]);

  return (
    <div className={className}>
      <TotalResults total={total} className="mb-2 text-center" />

      <div className="min-h-0">{children(pageItems, { page, totalPages, total })}</div>

      <div className="mt-6 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={prev}
                aria-disabled={!canPrev || isLoading}
              />
            </PaginationItem>

            <span className="px-2 text-sm">
              Page {page + 1} / {totalPages}
            </span>

            <PaginationItem>
              <PaginationNext
                onClick={next}
                aria-disabled={!canNext || isLoading}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
