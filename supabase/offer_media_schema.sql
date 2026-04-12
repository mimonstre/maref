-- Add real media and price-history support for offers.
-- Apply only when you have verified source data available.

alter table if exists offers
  add column if not exists image_url text,
  add column if not exists price_history jsonb default '[]'::jsonb;

comment on column offers.image_url is
  'Public product image URL from a traceable source (manufacturer, retailer, or licensed CDN).';

comment on column offers.price_history is
  'JSON array of real price observations: [{ "date": "2026-04-12", "price": 899, "source_url": "https://..." }]';
