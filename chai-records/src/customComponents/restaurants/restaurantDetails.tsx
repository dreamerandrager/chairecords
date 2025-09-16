import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@/types/restaurant";

function formatAddress(restaurant: Restaurant): string | null {
  const lines: string[] = [];

  const street = [restaurant.addressLine1, restaurant.addressLine2].filter(Boolean).join("\n");
  if (street) lines.push(street);

  const cityLine = [restaurant.city, restaurant.region, restaurant.postalCode].filter(Boolean).join(", ");
  if (cityLine) lines.push(cityLine);

  const country = restaurant.countryCode ? restaurant.countryCode.toUpperCase() : null;
  if (country) lines.push(country);

  if (lines.length === 0) return null;

  return lines.join("\n");
}

function formatCoordinate(value: number | null): string | null {
  if (value === null || Number.isNaN(value)) return null;
  return value.toFixed(6);
}

function formatDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

type InfoItem = {
  label: string;
  value: React.ReactNode;
};

function InfoGroup({ title, items }: { title: string; items: InfoItem[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <dl className="space-y-3 text-sm">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <dt className="text-xs font-medium uppercase text-muted-foreground/80">{item.label}</dt>
            <dd className="text-sm text-foreground/90">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

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

export function RestaurantDetails({ restaurant }: { restaurant: Restaurant }) {
  const address = formatAddress(restaurant);
  const latitude = formatCoordinate(restaurant.latitude);
  const longitude = formatCoordinate(restaurant.longitude);
  const mapUrl = latitude && longitude ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}` : null;
  const createdDisplay = formatDate(restaurant.createdAt);
  const updatedDisplay = formatDate(restaurant.updatedAt);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-semibold leading-tight">{restaurant.name}</CardTitle>
          <div className="space-y-1 text-sm text-muted-foreground">
            {restaurant.brandName ? <p>Part of {restaurant.brandName}</p> : null}
            {restaurant.slug ? <p>Slug: {restaurant.slug}</p> : null}
          </div>
          <CardDescription className="max-w-2xl whitespace-pre-line">
            {restaurant.description ?? "No description available for this restaurant yet."}
          </CardDescription>
        </div>
        <StatusBadge active={restaurant.isActive} />
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <InfoGroup
            title="Contact"
            items={[
              {
                label: "Phone",
                value: restaurant.phone ? (
                  <a href={`tel:${restaurant.phone}`} className="hover:underline">
                    {restaurant.phone}
                  </a>
                ) : (
                  "Not provided"
                ),
              },
              {
                label: "Email",
                value: restaurant.email ? (
                  <a href={`mailto:${restaurant.email}`} className="hover:underline">
                    {restaurant.email}
                  </a>
                ) : (
                  "Not provided"
                ),
              },
              {
                label: "Website",
                value: restaurant.websiteUrl ? (
                  <a href={restaurant.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline">
                    {restaurant.websiteUrl}
                  </a>
                ) : (
                  "Not provided"
                ),
              },
            ]}
          />

          <InfoGroup
            title="Location"
            items={[
              {
                label: "Address",
                value: address ? <span className="whitespace-pre-line">{address}</span> : "Not provided",
              },
              {
                label: "Coordinates",
                value:
                  latitude && longitude ? (
                    <span>
                      {latitude}, {longitude}
                    </span>
                  ) : (
                    "Not provided"
                  ),
              },
            ]}
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {createdDisplay ? (
            <span>
              Created <time dateTime={restaurant.createdAt}>{createdDisplay}</time>
            </span>
          ) : null}
          {updatedDisplay ? (
            <span>
              Updated <time dateTime={restaurant.updatedAt}>{updatedDisplay}</time>
            </span>
          ) : null}
          {restaurant.brandId ? <span>Brand ID: {restaurant.brandId}</span> : null}
        </div>

        {mapUrl ? (
          <Button asChild>
            <a href={mapUrl} target="_blank" rel="noreferrer">
              View on Google Maps
            </a>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
