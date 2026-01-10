# API REFERENCE
## Milan Print Management System - REST API Documentation

**Base URL**: `https://api.milan.com/api`
**Version**: v1
**Authentication**: JWT Bearer Token
**Content-Type**: `application/json`

---

## TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [Clients API](#clients-api)
3. [Suppliers API](#suppliers-api)
4. [Roll Master API](#roll-master-api)
5. [Purchase Orders API](#purchase-orders-api)
6. [GRN API](#grn-api)
7. [Material Issue API](#material-issue-api)
8. [Material Return API](#material-return-api)
9. [Slitting API](#slitting-api)
10. [Stock API](#stock-api)
11. [Estimation API](#estimation-api)
12. [Common Response Codes](#common-response-codes)
13. [Error Handling](#error-handling)

---

## AUTHENTICATION

### Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "admin@company.com",
  "password": "SecurePassword123!",
  "tenantCode": "ABC123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "expiresIn": 86400,
  "user": {
    "userId": 1,
    "email": "admin@company.com",
    "fullName": "Admin User",
    "role": "Admin",
    "tenantId": 1,
    "tenantCode": "ABC123"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Inactive tenant or subscription expired

### Register (Initial Setup)

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "companyName": "ABC Printing Ltd",
  "tenantCode": "ABC123",
  "email": "admin@company.com",
  "password": "SecurePassword123!",
  "fullName": "Admin User"
}
```

**Response** (200 OK):
```json
{
  "tenantId": 1,
  "userId": 1,
  "message": "Registration successful"
}
```

### Refresh Token

**Endpoint**: `POST /auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response** (200 OK):
```json
{
  "token": "new_jwt_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 86400
}
```

---

## CLIENTS API

### Get All Clients

**Endpoint**: `GET /clients`

**Headers**:
```
Authorization: Bearer {token}
X-Tenant-Code: ABC123
```

**Response** (200 OK):
```json
[
  {
    "clientId": 1,
    "clientCode": "CL00001",
    "clientName": "Acme Corporation",
    "contactPerson": "John Doe",
    "email": "john@acme.com",
    "phone": "+91-9876543210",
    "gst": "29ABCDE1234F1Z5",
    "pan": "ABCDE1234F",
    "billingAddress": "123 Main St, City",
    "shippingAddress": "123 Main St, City",
    "paymentTerms": "Net 30",
    "creditLimit": 100000.00,
    "isActive": true,
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-01-01T10:00:00Z"
  }
]
```

### Get Client by ID

**Endpoint**: `GET /clients/{id}`

**Response** (200 OK):
```json
{
  "clientId": 1,
  "clientCode": "CL00001",
  "clientName": "Acme Corporation",
  ...
}
```

**Error Responses**:
- `404 Not Found`: Client not found

### Create Client

**Endpoint**: `POST /clients`

**Request Body**:
```json
{
  "clientCode": "CL00002",
  "clientName": "New Corporation",
  "contactPerson": "Jane Smith",
  "email": "jane@newcorp.com",
  "phone": "+91-9876543210",
  "gst": "29ABCDE1234F1Z6",
  "pan": "ABCDE1234G",
  "billingAddress": "456 Oak Ave, City",
  "shippingAddress": "456 Oak Ave, City",
  "paymentTerms": "Net 45",
  "creditLimit": 150000.00
}
```

**Response** (201 Created):
```json
{
  "clientId": 2,
  "clientCode": "CL00002",
  "clientName": "New Corporation",
  ...
}
```

**Error Responses**:
- `400 Bad Request`: Invalid data or duplicate client code

### Update Client

**Endpoint**: `PUT /clients/{id}`

**Request Body**:
```json
{
  "clientName": "Updated Corporation Name",
  "contactPerson": "Jane Smith",
  "email": "jane@updated.com",
  "phone": "+91-9876543211",
  "gst": "29ABCDE1234F1Z6",
  "pan": "ABCDE1234G",
  "billingAddress": "456 Oak Ave, City",
  "shippingAddress": "456 Oak Ave, City",
  "paymentTerms": "Net 30",
  "creditLimit": 200000.00,
  "isActive": true
}
```

**Response** (200 OK):
```json
{
  "clientId": 2,
  "clientCode": "CL00002",
  "clientName": "Updated Corporation Name",
  ...
}
```

**Error Responses**:
- `404 Not Found`: Client not found

### Delete Client

**Endpoint**: `DELETE /clients/{id}`

**Response** (204 No Content)

**Error Responses**:
- `404 Not Found`: Client not found

---

## SLITTING API

### Get All Slitting Jobs

**Endpoint**: `GET /slitting`

**Query Parameters**:
- `status` (optional): Filter by status (Completed, Draft)
- `fromDate` (optional): Filter from date (ISO 8601)
- `toDate` (optional): Filter to date (ISO 8601)
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 50)

**Response** (200 OK):
```json
{
  "data": [
    {
      "slittingJobId": 1,
      "slittingJobNumber": "SL00001/25-26",
      "slittingDate": "2026-01-07T10:00:00Z",
      "inputRoll": {
        "grnItemId": 123,
        "itemCode": "BOPP-1200",
        "itemName": "BOPP Film 1200mm",
        "batchNo": "GRN00008-P00018-1-01",
        "inputWidth": 1200,
        "inputGSM": 30,
        "inputRM": 1000.00,
        "inputSqMtr": 1200.00,
        "inputKg": 36.00
      },
      "outputRolls": [
        {
          "outputRollId": 1,
          "outputWidth": 400,
          "outputGSM": 30,
          "outputRM": 333.33,
          "outputSqMtr": 133.33,
          "outputKg": 4.00,
          "batchNo": "GRN00008-P00018-1-01-SL01",
          "itemCode": "BOPP-400",
          "itemName": "BOPP Film 400mm",
          "qrCodeData": "{\"type\":\"SLITTING_OUTPUT\",\"slittingJob\":\"SL00001/25-26\",...}",
          "remarks": null
        },
        {
          "outputRollId": 2,
          "outputWidth": 400,
          "outputGSM": 30,
          "outputRM": 333.33,
          "outputSqMtr": 133.33,
          "outputKg": 4.00,
          "batchNo": "GRN00008-P00018-1-01-SL02",
          "itemCode": "BOPP-400",
          "itemName": "BOPP Film 400mm",
          "qrCodeData": "{\"type\":\"SLITTING_OUTPUT\",\"slittingJob\":\"SL00001/25-26\",...}",
          "remarks": null
        }
      ],
      "wastageKg": 2.00,
      "wastageRM": 66.67,
      "wastageSqMtr": 26.67,
      "wastageRemarks": "Edge trimming wastage",
      "operatorName": "Operator 1",
      "machineNo": "SL-01",
      "remarks": null,
      "status": "Completed",
      "createdAt": "2026-01-07T10:00:00Z",
      "updatedAt": "2026-01-07T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

### Get Slitting Job by ID

**Endpoint**: `GET /slitting/{id}`

**Response** (200 OK): Single slitting job object (same structure as above)

### Create Slitting Job

**Endpoint**: `POST /slitting`

**Request Body**:
```json
{
  "slittingDate": "2026-01-07T10:00:00Z",
  "inputRoll": {
    "grnItemId": 123,
    "stockId": null,
    "itemCode": "BOPP-1200",
    "itemName": "BOPP Film 1200mm",
    "batchNo": "GRN00008-P00018-1-01",
    "inputWidth": 1200,
    "inputGSM": 30,
    "faceGSM": 25,
    "releaseGSM": 3,
    "adhesiveGSM": 2,
    "inputRM": 1000.00,
    "inputSqMtr": 1200.00,
    "inputKg": 36.00,
    "itemType": "Film",
    "quality": "Premium",
    "uom": "Kg"
  },
  "outputRolls": [
    {
      "outputWidth": 400,
      "outputGSM": 30,
      "outputRM": 333.33,
      "outputSqMtr": 133.33,
      "outputKg": 4.00,
      "itemCode": "BOPP-400",
      "itemName": "BOPP Film 400mm",
      "itemType": "Film",
      "quality": "Premium",
      "remarks": null
    },
    {
      "outputWidth": 400,
      "outputGSM": 30,
      "outputRM": 333.33,
      "outputSqMtr": 133.33,
      "outputKg": 4.00,
      "itemCode": "BOPP-400",
      "itemName": "BOPP Film 400mm",
      "itemType": "Film",
      "quality": "Premium",
      "remarks": null
    }
  ],
  "wastageKg": 2.00,
  "wastageRM": 66.67,
  "wastageSqMtr": 26.67,
  "wastageRemarks": "Edge trimming wastage",
  "operatorName": "Operator 1",
  "machineNo": "SL-01",
  "remarks": null,
  "status": "Completed"
}
```

**Response** (201 Created):
```json
{
  "slittingJobId": 1,
  "slittingJobNumber": "SL00001/25-26",
  "slittingDate": "2026-01-07T10:00:00Z",
  ...
}
```

**Validation Rules**:
- Total output width must not exceed input width
- At least one output roll required
- All output widths must be > 0
- WastageKg = InputKg - Sum(OutputKg)

**Error Responses**:
- `400 Bad Request`: Validation failed
  ```json
  {
    "message": "Total output width (1300mm) exceeds input width (1200mm)",
    "type": "InvalidOperationException"
  }
  ```

### Delete Slitting Job

**Endpoint**: `DELETE /slitting/{id}`

**Response** (204 No Content)

**Side Effects**:
- Restores input roll stock (adds back consumed quantity)
- Deletes all output stock entries

**Error Responses**:
- `404 Not Found`: Slitting job not found

---

## STOCK API

### Get All Stock

**Endpoint**: `GET /stock`

**Query Parameters**:
- `category` (optional): Filter by category (Roll, Material, Ink, Consumable)
- `status` (optional): Filter by status (In-Stock, Reserved, Consumed, Expired)
- `itemCode` (optional): Filter by item code
- `page` (optional): Page number
- `pageSize` (optional): Items per page

**Response** (200 OK):
```json
{
  "data": [
    {
      "stockId": 1,
      "grnId": 5,
      "poId": 3,
      "itemCode": "BOPP-400",
      "itemName": "BOPP Film 400mm",
      "category": "Roll",
      "quantity": 4.00,
      "uom": "Kg",
      "runningMtr": 333.33,
      "sqMtr": 133.33,
      "weightKg": 4.00,
      "widthMM": 400,
      "gsm": 30,
      "batchNo": "GRN00008-P00018-1-01-SL01",
      "location": "Slitting: SL00001/25-26",
      "status": "In-Stock",
      "receivedDate": "2026-01-07T10:00:00Z",
      "expiryDate": null,
      "qrCodeData": "{\"type\":\"SLITTING_OUTPUT\",...}",
      "createdAt": "2026-01-07T10:00:00Z",
      "updatedAt": "2026-01-07T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalCount": 100,
    "totalPages": 2
  }
}
```

### Get Stock by Batch

**Endpoint**: `GET /stock/batch/{batchNo}`

**Response** (200 OK): Stock item object

### Get Stock Summary

**Endpoint**: `GET /stock/summary`

**Response** (200 OK):
```json
{
  "totalItems": 156,
  "byCategory": {
    "Roll": 89,
    "Material": 45,
    "Ink": 15,
    "Consumable": 7
  },
  "byStatus": {
    "In-Stock": 120,
    "Reserved": 25,
    "Consumed": 10,
    "Expired": 1
  },
  "totalValue": 2500000.00
}
```

---

## COMMON RESPONSE CODES

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful, data returned |
| `201 Created` | Resource created successfully |
| `204 No Content` | Request successful, no data returned (e.g., DELETE) |
| `400 Bad Request` | Invalid request data or validation failed |
| `401 Unauthorized` | Missing or invalid authentication token |
| `403 Forbidden` | Valid token but insufficient permissions or inactive tenant |
| `404 Not Found` | Requested resource not found |
| `409 Conflict` | Resource conflict (e.g., duplicate code) |
| `500 Internal Server Error` | Server error occurred |

---

## ERROR HANDLING

### Standard Error Response Format

All API errors return a consistent JSON format:

```json
{
  "message": "Descriptive error message",
  "type": "InvalidOperationException"
}
```

### Validation Error Response

For validation failures with multiple errors:

```json
{
  "message": "Validation failed",
  "type": "ValidationException",
  "errors": {
    "clientCode": ["Client code is required"],
    "email": ["Invalid email format"]
  }
}
```

### Authentication Error

```json
{
  "message": "Invalid or expired token",
  "type": "UnauthorizedAccessException"
}
```

### Tenant Error

```json
{
  "message": "Invalid or inactive tenant",
  "type": "UnauthorizedAccessException"
}
```

---

## REQUEST HEADERS

All authenticated requests must include:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Code: ABC123
Content-Type: application/json
```

---

## PAGINATION

All list endpoints support pagination with query parameters:

- `page`: Page number (starts from 1)
- `pageSize`: Items per page (default: 50, max: 100)

**Example Request**:
```http
GET /api/clients?page=2&pageSize=25
```

**Response includes pagination metadata**:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "pageSize": 25,
    "totalCount": 150,
    "totalPages": 6
  }
}
```

---

## FILTERING & SORTING

### Filtering

Most list endpoints support filtering via query parameters:

```http
GET /api/clients?isActive=true
GET /api/stock?category=Roll&status=In-Stock
GET /api/slitting?fromDate=2026-01-01&toDate=2026-01-31
```

### Sorting

Use `sortBy` and `sortOrder` query parameters:

```http
GET /api/clients?sortBy=clientName&sortOrder=asc
GET /api/stock?sortBy=createdAt&sortOrder=desc
```

**Valid sort orders**: `asc`, `desc`

---

## RATE LIMITING

- **Rate Limit**: 1000 requests per hour per tenant
- **Burst Limit**: 100 requests per minute

**Response Headers**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1735689600
```

**Rate Limit Exceeded** (429 Too Many Requests):
```json
{
  "message": "Rate limit exceeded. Try again in 45 seconds",
  "type": "RateLimitException"
}
```

---

## DATA TYPES

### Date/Time Format

All dates use **ISO 8601 format** with UTC timezone:

```
2026-01-07T10:00:00Z
```

### Decimal Precision

- **Quantities**: 2 decimal places (e.g., 123.45)
- **Amounts/Prices**: 2 decimal places (e.g., 10000.50)
- **Unit Cost**: 4 decimal places (e.g., 1.2345)
- **Measurements**: 2 decimal places (e.g., 333.33)

### Boolean Values

Use JSON boolean: `true` or `false` (not strings)

---

## TESTING

### Swagger UI

Interactive API documentation available at:
```
https://api.milan.com/swagger
```

### Postman Collection

Download Postman collection: [Milan-PMS-API.postman_collection.json](#)

### Sample cURL Commands

**Login**:
```bash
curl -X POST https://api.milan.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePassword123!",
    "tenantCode": "ABC123"
  }'
```

**Get Clients**:
```bash
curl -X GET https://api.milan.com/api/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Tenant-Code: ABC123"
```

**Create Slitting Job**:
```bash
curl -X POST https://api.milan.com/api/slitting \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Tenant-Code: ABC123" \
  -H "Content-Type: application/json" \
  -d @slitting-job.json
```

---

## CHANGELOG

### Version 1.0 (January 2026)
- Initial API release
- Authentication endpoints
- Client/Supplier management
- Roll Master management
- Purchase Order & GRN
- Material Issue & Return
- Slitting operations
- Stock management
- Estimation module

---

## SUPPORT

**API Documentation**: https://docs.milan.com
**Support Email**: support@milan.com
**Status Page**: https://status.milan.com

---

*API Reference Version: 1.0*
*Last Updated: January 7, 2026*
*Complete REST API Documentation*
