# Using the new quotes API with payloads from the old platform

## Required change: send the quote object, not a `json` string

**Old platform** sent:
```json
[
  {
    "json": "{\"vat\":18,\"customer\":{...}}"
  }
]
```
i.e. an array with one object whose key `"json"` is a **string** of JSON.

**New API** expects the **quote object itself** (or an array with one quote object):
- Either: `{ "vat": 18, "customer": { ... }, ... }`
- Or: `[ { "vat": 18, "customer": { ... }, ... } ]`

So before calling `POST /api/quotes`:
1. Parse the string from `payload[0].json` (if you still receive that shape).
2. Send the **parsed object** as the request body (or wrap it in `[ ... ]`).

No need to rename fields: the new API uses the same camelCase names (`customerID`, `customerName`, `invoiceID`, `projectName`, `Representative`, `repFullName`, `paymentsTerms`, `pictureurl`, `productDesc`, etc.).

## Optional: choose a template (theme)

To use a theme (Red Carpet, Pozitive, Elite Rugs), add one of:

- `"template_key": "redcarpet"`  
- `"template_key": "pozitive"`  
- `"template_key": "elite_rugs"`  

or a template UUID in `"template_id"`. If you omit both, the quote is created without a template (default styling).

## Summary

| What | Old | New |
|------|-----|-----|
| Body shape | `[{ "json": "<string>" }]` | `{ ...quote }` or `[ { ...quote } ]` |
| Field names | (same) | Same camelCase |
| VAT | 18 | 18 (unchanged) |
| Template | N/A | Optional `template_key` or `template_id` |
