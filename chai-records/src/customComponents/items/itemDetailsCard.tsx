"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/customComponents/loader/loader";
import { getItemById } from "@/api/getItemById";
import type { Item } from "@/types/item";
import { cn } from "@/lib/utils";
import { ViewFacetPills } from "@/customComponents/attributes/viewFacetPills";

type ItemDetailsCardProps = {
  itemId: string;
  initialItem?: Item | null;
};

type DetailItem = {
  label: string;
  value: ReactNode;
};

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
          : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100"
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function DetailGrid({ items }: { items: DetailItem[] }) {
  if (items.length === 0) return null;
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
            {item.label}
          </dt>
          <dd className="text-sm text-foreground/90">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatCategory(value: string | null): string {
  if (!value) return "Uncategorized";
  return value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPrice(item: Item): string | null {
  if (item.priceCents === null) return null;
  const amount = item.priceCents / 100;
  const currency =
    item.currency && item.currency.trim().length > 0 ? item.currency : "ZAR";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function ItemImage({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-muted via-background to-muted-foreground/20">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${name} photo`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 600px"
          priority={false}
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
          No image available
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/90 to-transparent" />
    </div>
  );
}

export function ItemDetailsCard({ itemId, initialItem = null }: ItemDetailsCardProps) {
  const [item, setItem] = useState<Item | null>(initialItem ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialItem);

  useEffect(() => {
    let alive = true;

    if (initialItem && initialItem.id === itemId) {
      setItem(initialItem);
      setError(null);
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getItemById(itemId);
        if (!alive) return;

        if (!result) {
          setItem(null);
          setError("This item could not be found.");
        } else {
          setItem(result);
        }
      } catch (err: unknown) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Unable to load item details.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [itemId, initialItem]);

  // pull consensus facets (already computed by the API/RPC)
  const singleFacet = item?.consensusFacets?.singleFacet ?? null;
  const multiFacet =
    item?.consensusFacets?.multiFacets && item.consensusFacets.multiFacets.length > 0
      ? {
          name: item.consensusFacets.multiFacets[0].name,
          values: item.consensusFacets.multiFacets[0].values,
        }
      : null;
  const hasAnyFacets = Boolean(singleFacet) || Boolean(multiFacet?.values?.length);

  if (loading) {
    return (
      <Card className="grid min-h-[28rem] place-items-center">
        <Loader variant="inline" message="Loading item details…" />
      </Card>
    );
  }

  if (error) {
    return <Card className="p-6 text-sm text-muted-foreground">{error}</Card>;
  }

  if (!item) {
    return <Card className="p-6 text-sm text-muted-foreground">Item not found.</Card>;
  }

  const price = formatPrice(item);
  const createdDisplay = formatDate(item.createdAt);
  const updatedDisplay = formatDate(item.updatedAt);

  return (
    <Card className="overflow-hidden">
      <ItemImage imageUrl={item.imageUrl} name={item.name} />

      {/* Tight header/content spacing */}
      <CardHeader className="p-6 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: title/meta */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase text-muted-foreground">
              <span className="rounded-full bg-secondary/40 px-2 py-1 font-semibold tracking-wide text-secondary-foreground">
                {formatCategory(item.category)}
              </span>
              {item.restaurantName ? <span className="truncate">Served at {item.restaurantName}</span> : null}
            </div>
            <CardTitle className="text-2xl font-semibold leading-tight break-words">{item.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {item.description ?? "No description has been added for this item yet."}
            </CardDescription>
          </div>

          {/* Right: status (won’t stretch) */}
          <div className="shrink-0 self-start sm:ml-4">
            <StatusBadge active={item.isActive} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 space-y-4">
        {/* Compact facets row */}
        {hasAnyFacets && (
          <ViewFacetPills singleFacet={singleFacet} multiFacet={multiFacet} className="mt-2" />
        )}

        <DetailGrid
          items={[
            { label: "Price", value: price ?? "Price not provided" },
            { label: "Currency", value: item.currency },
            { label: "SKU", value: item.sku ?? "Not provided" },
            { label: "Slug", value: item.slug ?? "Not provided" },
            {
              label: "Restaurant ID",
              value: <code className="rounded bg-muted px-2 py-1 text-xs break-all">{item.restaurantId}</code>,
            },
            { label: "Item ID", value: <code className="rounded bg-muted px-2 py-1 text-xs break-all">{item.id}</code> },
          ]}
        />
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {createdDisplay && (
            <span>
              Created <time dateTime={item.createdAt}>{createdDisplay}</time>
            </span>
          )}
          {updatedDisplay && (
            <span>
              Updated <time dateTime={item.updatedAt}>{updatedDisplay}</time>
            </span>
          )}
        </div>

        <Button asChild size="lg" className="self-stretch sm:self-auto sm:w-auto">
          <Link href={`/restaurants/${item.restaurantId}`}>Go to restaurant</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
