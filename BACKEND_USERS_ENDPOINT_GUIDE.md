# Backend Users Endpoint Implementation Guide

## Required Endpoint

You need to create the following endpoint on your backend:

**Endpoint:** `GET /Admin/users`

## Query Parameters

The frontend sends these optional query parameters:

- `page` (number) - Current page number (default: 1)
- `limit` (number) - Number of users per page (default: 20)
- `search` (string) - Search term to filter by name or email
- `status` (string) - Filter by status: "active" or "blocked"
- `sortBy` (string) - Field to sort by (default: "createdAt")
- `sortOrder` (string) - Sort order: "asc" or "desc" (default: "desc")

> Note: Users do not have a `role` field. Admins are a separate entity/table.

## Expected Response Format

```json
{
    "users": [
        {
            "id": "user_id_1",
            "_id": "user_id_1", // MongoDB ID (optional if using MongoDB)
            "firstName": "John",
            "lastName": "Doe",
            "name": "John Doe", // Alternative to firstName + lastName
            "email": "john@example.com",
            "status": "active", // or "blocked"
            "createdAt": "2024-01-01T00:00:00.000Z"
        },
        {
            "id": "user_id_2",
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jane@example.com",
            "status": "active",
            "createdAt": "2024-01-15T00:00:00.000Z"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalUsers": 100
    }
}
```

## Example Backend Implementation (Node.js/Express)

```javascript
// routes/admin.js
router.get("/Admin/users", async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = "",
            status = "",
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        // Build query
        const query = {};

        // Search filter
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        // Get total count for pagination
        const totalUsers = await User.countDocuments(query);

        // Get users
        const users = await User.find(query)
            .select("firstName lastName email status createdAt")
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Calculate total pages
        const totalPages = Math.ceil(totalUsers / parseInt(limit));

        // Send response
        res.json({
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalUsers,
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Error fetching users" });
    }
});
```

## Additional Endpoints Needed

### 1. Get User by ID

**Endpoint:** `GET /Admin/users/:userId`

**Response:**

```json
{
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Update User

**Endpoint:** `PUT /Admin/users/:userId`

**Request Body:**

```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
}
```

### 3. Delete User

**Endpoint:** `DELETE /Admin/users/:userId`

**Response:**

```json
{
    "message": "User deleted successfully"
}
```

### 4. Toggle User Status (Block/Unblock)

**Endpoint:** `PATCH /Admin/users/:userId/toggle-status`

**Response:**

```json
{
    "message": "User status updated",
    "status": "blocked"
}
```

## Database Schema Example (MongoDB/Mongoose)

```javascript
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ["active", "blocked"],
        default: "active",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", userSchema);
```

## Testing the Endpoint

You can test the endpoint using curl:

```bash
# Get all users
curl http://localhost:3000/Admin/users

# Get users with pagination
curl "http://localhost:3000/Admin/users?page=1&limit=10"

# Search users
curl "http://localhost:3000/Admin/users?search=john"

# Filter by status
curl "http://localhost:3000/Admin/users?status=active"

# Combined filters
curl "http://localhost:3000/Admin/users?page=1&limit=20&status=active&search=john"
```

## Authentication & Authorization

Make sure to add authentication middleware to protect these endpoints:

```javascript
const authenticateAdmin = require("../middleware/auth");

router.get("/Admin/users", authenticateAdmin, async (req, res) => {
    // ... endpoint logic
});
```

## Notes

- The frontend is already set up and ready to work with these endpoints
- Make sure your backend returns data in the exact format specified above
- Add proper error handling and validation
- Consider adding rate limiting for security
- Log all admin actions for audit purposes
