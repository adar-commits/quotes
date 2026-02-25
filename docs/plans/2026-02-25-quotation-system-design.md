# Quotation system – design

## Scope (from your spec)

1. **Database** – Supabase tables to support the quote JSON (approve first).
2. **App + API** – Create-quote API + full HTTP request example.
3. **Redesign** – Modern public quote page; same fields and order, no logic change.

Reference: [quotes.carpetshop.co.il](https://quotes.carpetshop.co.il/6970b7436a0c79cc904c19af) (Hebrew, B2B quote with customer, products table, totals, VAT, payment terms, representative, optional signature).

---

## 1. Database schema (for your approval)

Each quote has a **unique public ID** (e.g. `6970b7436a0c79cc904c19af`) used in the URL: `/:publicId`.

Proposed **normalized** tables (no JSONB blob) so you can query/filter later if needed.

---

### Table: `quotes`

Main row per quotation.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `uuid` | NO | Primary key (default `gen_random_uuid()`). |
| `public_id` | `text` | NO | Unique slug for URL (e.g. `6970b7436a0c79cc904c19af`). Generated on insert if not provided. |
| `vat` | `numeric(5,2)` | NO | VAT % (e.g. 18). |
| `invoice_id` | `text` | YES | Your `invoiceID`. |
| `project_name` | `text` | YES | Your `projectName`. |
| `quotation_id` | `text` | YES | Your `quotationID`. |
| `special_discount` | `numeric(12,2)` | NO | Default 0. |
| `require_signature` | `boolean` | NO | Default `true`. |
| `invoice_creation_date` | `timestamptz` | YES | From `invoiceCreationDate`. |
| `agent_code` | `text` | YES | Your `agentCode`. |
| `agent_desc` | `text` | YES | Your `agentDesc`. |
| `created_at` | `timestamptz` | NO | Server-set. |
| `updated_at` | `timestamptz` | NO | Server-set. |

**Unique:** `public_id`.

---

### Table: `quote_customers`

One row per quote (1:1 with `quotes`).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `uuid` | NO | Primary key. |
| `quote_id` | `uuid` | NO | FK → `quotes.id` ON DELETE CASCADE. |
| `customer_id` | `text` | YES | Your `customerID`. |
| `customer_name` | `text` | YES | Your `customerName`. |
| `customer_address` | `text` | YES | Your `customerAddress`. |

**Unique:** `quote_id`.

---

### Table: `quote_representatives`

One row per quote (1:1 with `quotes`).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `uuid` | NO | Primary key. |
| `quote_id` | `uuid` | NO | FK → `quotes.id` ON DELETE CASCADE. |
| `rep_phone` | `text` | YES | |
| `rep_avatar` | `text` | YES | URL. |
| `rep_full_name` | `text` | YES | |

**Unique:** `quote_id`.

---

### Table: `quote_products`

One row per product line (order preserved).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `uuid` | NO | Primary key. |
| `quote_id` | `uuid` | NO | FK → `quotes.id` ON DELETE CASCADE. |
| `sort_order` | `int` | NO | 0-based; preserves array order. |
| `qty` | `int` | NO | |
| `sku` | `text` | YES | |
| `color` | `text` | YES | |
| `shape` | `text` | YES | |
| `material` | `text` | YES | |
| `technique` | `text` | YES | |
| `unit_price` | `numeric(12,4)` | NO | |
| `unit_discount` | `numeric(12,4)` | NO | Default 0. |
| `picture_url` | `text` | YES | |
| `product_desc` | `text` | YES | |
| `additional_desc` | `text` | YES | |

---

### Table: `quote_payment_terms`

One row per bullet (order preserved).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `uuid` | NO | Primary key. |
| `quote_id` | `uuid` | NO | FK → `quotes.id` ON DELETE CASCADE. |
| `sort_order` | `int` | NO | 0-based. |
| `term` | `text` | NO | Single term string. |

---

## Notes

- **Public ID:** We can generate a short unique slug (e.g. nanoid or first 22 chars of a UUID) when creating a quote if the client doesn’t send one.
- **API input:** Your payload is an array with one object; the API will accept that and create one quote (and related rows) per request. Response can return `public_id` and full URL.
- **RLS:** We can add Row Level Security so unauthenticated users can only read quotes by `public_id`; create/update/delete only with a service role or authenticated admin.

Reply with **approved** or the changes you want (e.g. renames, extra columns, or “store payload as JSONB as well”) and we’ll implement the DB next, then the API and redesign.
