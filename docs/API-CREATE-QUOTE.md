# Create quote – HTTP example

## Endpoint

- **URL:** `POST https://csquotes.vercel.app/api/quotes`  
  (or `POST http://localhost:3000/api/quotes` in development)
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

## Request body

Send a **single quote object** or an **array with one quote object**. Fields map to your reference JSON.

### Minimal example

```json
[
  {
    "vat": 18,
    "customer": {
      "customerID": "1000073582",
      "customerName": "השטיח שלי",
      "customerAddress": ""
    },
    "products": [
      {
        "Qty": 1,
        "SKU": "11345337-166237",
        "color": null,
        "shape": null,
        "material": null,
        "technique": null,
        "unitPrice": 2070.339,
        "unitDiscount": 0,
        "pictureurl": "https://example.com/image.jpg",
        "productDesc": "שטיח קאבול ירוק 237*166",
        "additionalDesc": null
      }
    ],
    "invoiceID": "f097f1d3-fbc8-45d5-ad51-67339b1baf74",
    "projectName": "השטיח שלי",
    "quotationID": "OP24430104",
    "paymentsTerms": [
      "תנאי תשלום: ש + 30",
      "ניתן לשלם באמצעות כרטיס אשראי/העברה בנקאית."
    ],
    "Representative": {
      "repPhone": "052-4648170",
      "repAvatar": "https://example.com/avatar.png",
      "repFullName": "אלון בבג'ני, מנכ''ל ומייסד"
    },
    "specialDiscount": 0,
    "requireSignature": true,
    "invoiceCreationDate": "2026-02-25 17:41",
    "agentCode": null,
    "agentDesc": null
  }
]
```

### cURL

```bash
curl -X POST "https://csquotes.vercel.app/api/quotes" \
  -H "Content-Type: application/json" \
  -d '[
  {
    "vat": 18,
    "customer": {
      "customerID": "1000073582",
      "customerName": "השטיח שלי",
      "customerAddress": ""
    },
    "products": [
      {
        "Qty": 1,
        "SKU": "11345337-166237",
        "color": null,
        "shape": null,
        "material": null,
        "technique": null,
        "unitPrice": 2070.339,
        "unitDiscount": 0,
        "pictureurl": "https://example.com/image.jpg",
        "productDesc": "שטיח קאבול ירוק 237*166",
        "additionalDesc": null
      }
    ],
    "invoiceID": "f097f1d3-fbc8-45d5-ad51-67339b1baf74",
    "projectName": "השטיח שלי",
    "quotationID": "OP24430104",
    "paymentsTerms": ["תנאי תשלום: ש + 30"],
    "Representative": {
      "repPhone": "052-4648170",
      "repAvatar": "",
      "repFullName": "אלון בבג''ני"
    },
    "specialDiscount": 0,
    "requireSignature": true,
    "invoiceCreationDate": "2026-02-25 17:41",
    "agentCode": null,
    "agentDesc": null
  }
]'
```

## Response

**Success (200)**

```json
{
  "public_id": "6970b7436a0c79cc904c19af",
  "quote_id": "uuid-of-created-quote",
  "url": "https://csquotes.vercel.app/6970b7436a0c79cc904c19af"
}
```

**Error (4xx/5xx)**

```json
{
  "error": "Human-readable message"
}
```

- `400` – Invalid JSON or missing/invalid `vat`.
- `500` – Database or server error.

## Notes

- `public_id` is auto-generated (22-char hex) and used in the public quote URL.
- No auth header required for this endpoint; protect it in production (e.g. API key or server-only) if needed.
