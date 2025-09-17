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
import { FacetPills } from "@/customComponents/attributes/facetPills";

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
  const currency = item.currency && item.currency.trim().length > 0 ? item.currency : "ZAR";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const METADATA_KEYS_TO_SKIP = new Set([
  "imageUrl",
  "image_url",
  "photoUrl",
  "photo_url",
  "thumbnail",
  "thumbnailUrl",
  "thumbnail_url",
  "images",
]);

function extractMetadata(metadata: Item["metadata"]): DetailItem[] {
  if (!metadata) return [];

  const entries: DetailItem[] = [];

  for (const [key, rawValue] of Object.entries(metadata)) {
    if (METADATA_KEYS_TO_SKIP.has(key)) continue;
    if (rawValue === undefined || rawValue === null) continue;

    let display: ReactNode | null = null;

    if (typeof rawValue === "string") {
      const trimmed = rawValue.trim();
      if (trimmed.length > 0) display = trimmed;
    } else if (typeof rawValue === "number") {
      display = rawValue;
    } else if (typeof rawValue === "boolean") {
      display = rawValue ? "Yes" : "No";
    } else if (Array.isArray(rawValue)) {
      const values = rawValue.filter((value) => typeof value === "string" && value.trim().length > 0);
      if (values.length > 0) display = values.map((value) => value.trim()).join(", ");
    } else if (isRecord(rawValue)) {
      const simpleValues = Object.entries(rawValue)
        .filter(([, value]) => typeof value === "string")
        .map(([, value]) => (value as string).trim())
        .filter((value) => value.length > 0);
      if (simpleValues.length > 0) display = simpleValues.join(", ");
    }

    if (display) {
      entries.push({
        label: titleCase(key),
        value: display,
      });
    }
  }

  return entries.slice(0, 6);
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

  const metadataDetails = useMemo(() => extractMetadata(item?.metadata ?? null), [item?.metadata]);
  const consensus = item?.consensusFacets ?? null;
  const hasSingleFacet = Boolean(consensus?.singleFacet);
  const hasMultiFacets = (consensus?.multiFacets?.length ?? 0) > 0;

  if (loading) {
    return (
      <Card className="grid min-h-[28rem] place-items-center">
        <Loader variant="inline" message="Loading item details…" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        {error}
      </Card>
    );
  }

  if (!item) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        Item not found.
      </Card>
    );
  }

  const price = formatPrice(item);
  const createdDisplay = formatDate(item.createdAt);
  const updatedDisplay = formatDate(item.updatedAt);

  return (
    <Card className="overflow-hidden">
      <ItemImage imageUrl={item.imageUrl} name={item.name} />

      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase text-muted-foreground">
              <span className="rounded-full bg-secondary/40 px-2 py-1 font-semibold tracking-wide text-secondary-foreground">
                {formatCategory(item.category)}
              </span>
              {item.restaurantName ? <span>Served at {item.restaurantName}</span> : null}
            </div>
            <CardTitle className="text-2xl font-semibold leading-tight">{item.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {item.description ?? "No description has been added for this item yet."}
            </CardDescription>
          </div>
          <StatusBadge active={item.isActive} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <DetailGrid
          items={[
            {
              label: "Price",
              value: price ?? "Price not provided",
            },
            {
              label: "Currency",
              value: item.currency,
            },
            {
              label: "SKU",
              value: item.sku ?? "Not provided",
            },
            {
              label: "Slug",
              value: item.slug ?? "Not provided",
            },
            {
              label: "Restaurant ID",
              value: <code className="rounded bg-muted px-2 py-1 text-xs">{item.restaurantId}</code>,
            },
            {
              label: "Item ID",
              value: <code className="rounded bg-muted px-2 py-1 text-xs">{item.id}</code>,
            },
          ]}
        />

        {metadataDetails.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Additional Details</h3>
            <DetailGrid items={metadataDetails} />
          </div>
        ) : null}

        {(hasSingleFacet || hasMultiFacets) && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Community highlights
            </h3>

            {hasSingleFacet && consensus?.singleFacet ? (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                  {consensus.singleFacet.name}
                </h4>
                <FacetPills
                  facetName={consensus.singleFacet.name}
                  mode="single"
                  valueSingle={consensus.singleFacet.value}
                  readOnly
                />
              </div>
            ) : null}

            {hasMultiFacets
              ? consensus?.multiFacets.map((facet) => (
                  <div key={facet.name} className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                      {facet.name}
                    </h4>
                    <FacetPills facetName={facet.name} mode="multi" valueMulti={facet.values} readOnly />
                  </div>
                ))
              : null}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {createdDisplay ? (
            <span>
              Created <time dateTime={item.createdAt}>{createdDisplay}</time>
            </span>
          ) : null}
          {updatedDisplay ? (
            <span>
              Updated <time dateTime={item.updatedAt}>{updatedDisplay}</time>
            </span>
          ) : null}
        </div>

        <Button asChild size="lg">
          <Link href={`/restaurants/${item.restaurantId}`}>Go to restaurant</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}