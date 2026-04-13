# UserOptions Management - Professional Dashboard Page

## Quick Start Guide

### Access the Page

1. **URL**: `https://healthpathglobal.com/UserOptions`
2. **Sidebar Menu**: Click on "User Options" → "Manage Options"
3. **Also Available**: "User Options" → "Registration Analytics" (for insights)

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ User Options Management                          [Refresh] │
│ Manage all dropdown data and settings for registration      │
│ Last updated: April 5, 2026 • 2:45 PM                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ [User Origins] [Professional Status] [Programs] [Advanced] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  TAB CONTENT AREA                                            │
│  - List editor for simple arrays (countries, specialties)   │
│  - JSON editor for complex objects                          │
│  - Individual save buttons per field                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab Breakdown

### Tab 1: User Origins

**Field 1**: User Origin Countries

- Add/remove countries where users are FROM
- Example: France, Germany, Algeria, Canada
- Use case: User profile country dropdown

**Field 2**: User Specialties

- Add/remove specialties users can select
- Example: Engineering, Medicine, Business, IT
- Use case: User profile specialty dropdown

### Tab 2: Professional Status

**Field 1**: Professional Status

- Options: Student, Worker, Freelancer, Other
- Use case: Employment status indicator

**Field 2**: Academic Status

- Options: Student, Graduated, Other
- Use case: Academic level indicator

### Tab 3: Program Management

**Field 1**: Program Countries

- Countries that OFFER programs
- Separate from user origin countries
- Use case: Filter by program location

**Field 2**: Country Flags

- JSON mapping: country name → emoji/flag URL
- Example: `{"France": "🇫🇷", "Germany": "🇩🇪"}`
- Use case: Visual flag display in UI

### Tab 4: Advanced Settings

**Field 1**: Program Specialties per Country

- JSON mapping: country → specialty array
- Example: `{"France": ["Engineering", "Medicine"]}`
- Use case: Sequential dropdown filtering

**Field 2**: Program Types per Country::Specialty

- JSON mapping: country::specialty → type array
- Example: `{"France::Engineering": ["Studying Abroad", "Online"]}`
- Use case: Three-level cascading dropdowns

---

## How to Use

### Adding Items to Lists

1. Select a tab with array data (e.g., User Origins)
2. Type in the input field
3. Press Enter or click the "Add" button
4. Item appears in the list below
5. Click "Save" to persist to database

### Removing Items

1. Hover over an item in the list
2. Click the red trash icon
3. Item is immediately removed from local state
4. Click "Save" to persist changes

### Reordering Items

1. Hover over an item
2. Use up/down arrow buttons to move
3. Click "Save" to persist new order

### Editing JSON

1. Go to Advanced Settings tab
2. Edit JSON directly in the text editor
3. Syntax is validated in real-time
4. Red error message appears if invalid JSON
5. Click "Save" when valid

---

## API Endpoints Used

| Method | Endpoint                          | Purpose                |
| ------ | --------------------------------- | ---------------------- |
| GET    | `/Admin/RegisterOptions`          | Fetch all options      |
| PATCH  | `/Admin/RegisterOptions`          | Update single field    |
| GET    | `/Admin/RegisterOptions/insights` | Registration analytics |

---

## Data Structure

### Simple Array Fields

```javascript
userOriginCountries: ["France", "Germany", "Canada", "Algeria"];
```

### Complex Object Fields

```javascript
// programSpecialtiesPerCountry
{
  "France": ["Engineering", "Medicine", "Business"],
  "Germany": ["Engineering", "Physics", "Philosophy"],
  "Canada": ["Business", "Technology"]
}

// countryFlags
{
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Canada": 🇨🇦"
}
```

---

## Features

✅ **Real-time Validation** - JSON syntax checked as you type  
✅ **Individual Save** - Save each field independently  
✅ **Refresh Data** - Reload all options from server  
✅ **Last Updated** - Timestamp shows when data was last modified  
✅ **Toast Notifications** - Success/error messages  
✅ **Responsive Design** - Works on desktop and tablet  
✅ **List Management** - Add, remove, reorder items  
✅ **Professional UI** - Gradient icons and clean layout

---

## Consolidated Routes

| Old Routes                          | New Single Route |
| ----------------------------------- | ---------------- |
| `/HomePageManagement/FilterOptions` | `/UserOptions`   |
| `/RegisterOptions`                  | `/UserOptions`   |

**Note**: `/RegisterOptions/Insights` still available for analytics

---

## Troubleshooting

### Page not loading?

- Check browser console for errors
- Verify backend API is running on port 3000
- Check network tab for failed API calls

### Data not saving?

- Check that API endpoint `/Admin/RegisterOptions` is accessible
- Look for error toast notification
- Check browser console for detailed error message

### JSON validation failing?

- Ensure JSON is valid (use linter tool)
- Common issues: missing quotes, trailing commas, unmatched braces
- Copy valid example and edit from there

---

## Next Steps

1. Test all 4 tabs with sample data
2. Verify save operations show success notifications
3. Refresh page and confirm data persisted
4. Update frontend forms to use these managed options
5. Remove hardcoded dropdown data from frontend files
