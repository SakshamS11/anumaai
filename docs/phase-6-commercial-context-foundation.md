# Commercial Context Foundation — Product Catalogue

## Objective

Add organization-owned authoritative product context without reinterpreting the transcript or building aggregate intelligence.

## Scope

- CSV product-master import with immutable import provenance and row-level error summary.
- Tenant-scoped catalogue items: SKU, product/category identity, aliases, controlled extensible `specifications` JSON, active/effective dates. Electronics categories are data, not code paths; laptop, phone, TV, and appliance specifications are examples, not core columns.
- Deterministic exact product-mention resolution on interaction detail: `confirmed`, `ambiguous`, or `unresolved`.

## Boundaries

Conversation observations remain `EVIDENCE_EXTRACTED` spoken claims. Catalogue records are authoritative business context. A match never changes the claim, and no match is fabricated. CSV repeat imports are idempotent by checksum; a changed existing SKU is rejected rather than silently overwriting historical source truth.

## Deferred

Inventory, price, promotion, POS/transaction ingestion, product-version update workflow, cross-interaction analytics, report generation, and outcome analytics. A changed existing SKU is deliberately rejected today; a future versioned catalogue-update workflow is required for refreshes.

## Security

Catalogue reads are active-membership scoped. Import provenance reads are admin-only. Writes use the authenticated administrator server action and the service role is never exposed.

## Hosted migration status

The forward migration is committed but remains unapplied until the local `SUPABASE_DB_URL` is replaced with a valid, percent-encoded URI from the Supabase Connect panel. No insecure connection workaround is permitted. Hosted RLS validation is pending that safe connection repair.
