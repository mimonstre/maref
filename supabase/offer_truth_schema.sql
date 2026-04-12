-- MAREF truth-first schema upgrade for offers
-- Apply this script in Supabase SQL editor before relying on source metadata in production.

alter table if exists offers
  add column if not exists source_url text,
  add column if not exists last_updated timestamptz,
  add column if not exists reliability_score integer;

alter table if exists offers
  alter column product set not null,
  alter column brand set not null,
  alter column category set not null,
  alter column subcategory set not null,
  alter column merchant set not null,
  alter column price set not null;

alter table if exists offers
  drop constraint if exists offers_price_positive,
  add constraint offers_price_positive check (price >= 0),
  drop constraint if exists offers_reliability_score_range,
  add constraint offers_reliability_score_range check (
    reliability_score is null or (reliability_score >= 0 and reliability_score <= 100)
  );

comment on column offers.source_url is 'Canonical source of truth for the current offer data.';
comment on column offers.last_updated is 'Last time the offer facts were verified against the source.';
comment on column offers.reliability_score is 'Confidence score from 0 to 100 for the data completeness and source quality.';
