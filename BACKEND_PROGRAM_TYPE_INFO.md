# Backend Issue: Program Type "Subvention" (grant) Returns 500 Error

## Problem

When creating a program with `programType: "grant"` (Subvention in French), the backend returns a 500 Internal Server Error.

## Frontend Valid Values

The frontend sends these values for `programType`:

- `"scholarship"` - Bourse d'études ✅ Works
- `"grant"` - Subvention ❌ Returns 500 error
- `"fellowship"` - Fellowship
- `"training"` - Formation (likely the 4th option)

## What's Being Sent to Backend

The frontend sends a POST request to `/Admin/Programs` with this structure:

```json
{
  "title": "Program Title",
  "programType": "grant",
  "Price": 100,
  "scholarshipAmount": 5000,
  "currency": "EUR",
  "paymentFrequency": "monthly",
  "status": "open",
  "isActive": true,
  "isFeatured": false,
  "totalSlots": 9000000,
  "availableSlots": 9000000
  // ... other fields
}
```

## Backend Needs to Fix

### Option 1: Accept "grant" Value

The backend should accept `programType: "grant"` as a valid value.

**Database/Model Update Needed:**

```javascript
// Backend model should allow these values:
programType: {
  type: String,
  enum: ['scholarship', 'grant', 'fellowship', 'training'],  // Add 'grant' here
  required: true
}
```

### Option 2: Map Frontend Value to Backend Value

If the backend uses different values (like "subvention" instead of "grant"), tell me and I'll update the frontend mapping.

**Current frontend mapping:**

```javascript
{
  value: "grant",      // What frontend sends
  label: "Subvention", // What user sees
}
```

## Error Details

**Error Type:** AxiosError  
**Status Code:** 500 Internal Server Error  
**Endpoint:** POST `/Admin/Programs`

**Console Logs Added:**
The frontend now logs complete program data before sending. Check browser console for:

```
=== CREATING PROGRAM - DATA BEING SENT ===
Full programData object: {...}
programType value: "grant"
programType type: "string"
==========================================
```

## Backend Action Items

1. **Check backend validation rules** for `programType` field
2. **Check database enum/constraints** - does it allow "grant"?
3. **Check backend error logs** - what's the actual error message?
4. **Possible causes:**
   - Database enum constraint doesn't include "grant"
   - Backend validation rejects "grant" value
   - Backend expects different value (e.g., "subvention")

## Testing

After backend fix, test with:

1. Create program with `programType: "scholarship"` ✅
2. Create program with `programType: "grant"` ❌ (Currently fails)
3. Create program with `programType: "fellowship"`
4. Create program with `programType: "training"`

## Need Backend Response

Please provide:

1. What values does backend accept for `programType`?
2. What's the exact error message in backend logs?
3. Do you need me to change "grant" to something else on frontend?
