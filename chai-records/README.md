# Chai Records

Chai Records is an internal dashboard for curating South Africa's bubble tea scene. Administrators can browse restaurants, drill into individual menu items, and celebrate the community's tasting notes — all in one tidy Next.js workspace.

## Getting started

```bash
pnpm install
pnpm dev
```

Then visit http://localhost:3000 to explore the dashboard. Supabase credentials are required for live data; without them, stubbed loading states will still preview the interface.

## What's new in v1.2.0

- **Review gallery with deep links.** Browse feedback through a responsive card grid that loads reviews on demand, surfaces star ratings, and opens a detail modal with quick actions to jump straight to the referenced item, restaurant, or reviewer profile.【F:chai-records/src/customComponents/reviews/reviewsSection.tsx†L1-L69】【F:chai-records/src/customComponents/reviews/reviewCard.tsx†L1-L96】【F:chai-records/src/customComponents/reviews/reviewModal.tsx†L1-L146】
- **Richer item spotlight.** The item detail card now fetches live data, highlights consensus attributes, formats pricing automatically, and keeps critical metadata — such as SKU, slug, and timestamps — within easy reach alongside a direct restaurant link.【F:chai-records/src/customComponents/items/itemDetailsCard.tsx†L1-L213】
- **Smarter attributes.** Attribute pills distinguish consensus highlights from supporting tags, collapse when space is tight, and even let administrators add custom descriptors on the fly when curating multi-select facets.【F:chai-records/src/customComponents/attributes/viewFacetPills.tsx†L1-L63】【F:chai-records/src/customComponents/attributes/facetPills.tsx†L1-L160】
- **Restaurant profiles with maps.** Restaurant detail views bundle contact info, address formatting, status badges, and a one-click Google Maps launch so teams can validate locations without leaving the dashboard.【F:chai-records/src/customComponents/restaurants/restaurantDetails.tsx†L1-L143】

## Key areas to explore

- **Item management.** Inspect menu entries, evaluate their activation status, and cross-check the restaurant relationship from the same screen.【F:chai-records/src/customComponents/items/itemDetailsCard.tsx†L123-L213】
- **Community insights.** Capture how guests describe their experience, including optional photos, consensus facets, and timestamps per review.【F:chai-records/src/customComponents/reviews/reviewModal.tsx†L37-L146】
- **Location operations.** Confirm contact details, map links, and brand associations for every storefront at a glance.【F:chai-records/src/customComponents/restaurants/restaurantDetails.tsx†L59-L143】

## Tech stack

- Next.js App Router
- React 19 with server components
- Tailwind CSS v4
- Supabase for authentication and data access

Happy sipping!
