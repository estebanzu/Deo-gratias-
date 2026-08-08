# Deo Gratias Catalog — API Reference

Base URL: `http://localhost:3015` (default)

---

## Images

### `GET /api/images`

List all images with metadata. Cached for 30 seconds.

**Response**
```json
{
  "images": [
    {
      "filename": "aurora-pendant.jpg",
      "name": "Aurora Pendant",
      "description": "18k gold pendant with sapphire",
      "price": "2400",
      "category": "Pendants",
      "collection": "Aurora",
      "material": "18k Gold",
      "gemstone": "Sapphire",
      "order": 1,
      "url": "/images/aurora-pendant.jpg",
      "thumbUrl": "/images/thumbs/aurora-pendant.webp",
      "ext": ".jpg"
    }
  ],
  "total": 17
}
```

### `POST /api/images`

Upload a new image. Supports `multipart/form-data`.

**Form Fields**
| Field    | Type   | Required | Description                      |
|----------|--------|----------|----------------------------------|
| `image`  | file   | Yes      | Image file (jpg, jpeg, png, webp)|
| `name`   | string | No       | Product name                     |
| `category`| string| No       | Product category                 |
| `collection`| string| No    | Collection name                  |

**Max file size:** 10 MB

**Response**
```json
{
  "success": true,
  "image": {
    "filename": "aurora-pendant.jpg",
    "name": "Aurora Pendant",
    "url": "/images/aurora-pendant.jpg",
    "thumbUrl": "/images/thumbs/aurora-pendant.webp",
    "ext": ".jpg"
  }
}
```

### `DELETE /api/images/:filename`

Delete an image and its thumbnail.

**Response**
```json
{ "success": true }
```

---

## Products (Metadata)

### `GET /api/products/:filename`

Get metadata for a single product.

**Response**
```json
{
  "name": "Aurora Pendant",
  "description": "18k gold pendant with sapphire",
  "price": "2400",
  "category": "Pendants",
  "collection": "Aurora",
  "material": "18k Gold",
  "gemstone": "Sapphire",
  "order": 1
}
```

### `PUT /api/products/:filename`

Update product metadata. Only provided fields are updated.

**Request Body**
```json
{
  "name": "Aurora Pendant II",
  "price": "2800",
  "collection": "Aurora 2026"
}
```

**Allowed fields:** `name`, `description`, `price`, `category`, `collection`, `material`, `gemstone`, `order`

**Response**
```json
{
  "name": "Aurora Pendant II",
  "description": "18k gold pendant with sapphire",
  "price": "2800",
  "category": "Pendants",
  "collection": "Aurora 2026",
  "material": "18k Gold",
  "gemstone": "Sapphire",
  "order": 1
}
```

### `DELETE /api/products/:filename`

Remove metadata for a product (image file is NOT deleted).

**Response**
```json
{ "success": true }
```

---

## Reordering

### `POST /api/reorder`

Batch update product sort order.

**Request Body**
```json
{
  "orders": [
    { "filename": "aurora-pendant.jpg", "order": 1 },
    { "filename": "celestial-ring.jpg", "order": 2 }
  ]
}
```

**Response**
```json
{ "success": true }
```

---

## PDF Generation

### `POST /api/generate-pdf`

Generate a PDF catalog. Returns a download URL.

**Request Body** (all fields optional)
```json
{
  "template": "catalog",
  "columns": 2,
  "perPage": 4,
  "format": "A4",
  "margins": { "top": 20, "right": 18, "bottom": 25, "left": 18 },
  "filenames": ["aurora-pendant.jpg", "celestial-ring.jpg"]
}
```

| Field         | Type     | Default | Options                          |
|---------------|----------|---------|----------------------------------|
| `template`    | string   | `catalog` | `catalog`, `line-sheet`, `lookbook` |
| `columns`     | number   | `2`     | 1–4                              |
| `perPage`     | number   | `4`     | 2, 4, 6, 8, 12                  |
| `format`      | string   | `A4`    | `A4`, `Letter`, `Legal`          |
| `margins`     | object   | `{top:20, right:18, bottom:25, left:18}` | mm values (5–50) |
| `filenames`   | string[] | all     | Array of filenames to include    |

**Response**
```json
{
  "success": true,
  "downloadUrl": "/output/deo-gratias-catalog.pdf",
  "cached": false,
  "count": 17
}
```

**Output files:**
- `catalog` template → `deo-gratias-catalog.pdf`
- `line-sheet` → `deo-gratias-catalog-line-sheet.pdf`
- `lookbook` → `deo-gratias-catalog-lookbook.pdf`

---

## Static File Serving

| Path        | Directory       | Cache   |
|-------------|-----------------|---------|
| `/`         | `public/`       | 1 hour  |
| `/images/`  | `images/`       | 7 days  |
| `/output/`  | `output/`       | 1 hour  |

---

## Error Responses

All error responses follow:
```json
{ "error": "Error message" }
```

| Status | Meaning                        |
|--------|--------------------------------|
| 400    | Bad request / validation error |
| 404    | Product or image not found     |
| 500    | Server error                   |
