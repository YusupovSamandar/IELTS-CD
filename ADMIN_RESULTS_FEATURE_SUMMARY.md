# Admin Results Filter & Export Feature Implementation

## Overview

Added user role filtering and Excel export functionality to the admin results page at `/dashboard/admin/results`.

## Features Implemented

### ✅ User Role Filter

- **Location**: Filter dropdown in the results page header
- **Options**:
  - All Roles (default)
  - User
  - Admin
  - Teacher
- **Functionality**:
  - Filters users by their role in real-time
  - Updates URL parameters for shareable filtered views
  - Works in combination with search functionality

### ✅ Excel Export

- **Button**: "Export Users Excel" button in the top-right corner
- **Export Scope**: Only exports users with `USER` role (not admin or teacher)
- **File Format**: `.xlsx` (Excel format)
- **File Name**: `user-results-YYYY-MM-DD.xlsx` (dated filename)
- **Content Includes**:
  - User Name
  - Email
  - Role
  - Assessment Name
  - Assessment Type (READING, LISTENING, WRITING)
  - Score
  - Total Correct Answers
  - Total Questions
  - Time Spent (in minutes)
  - Completed Date
  - Result Type (Assessment or Writing Essay)

## Technical Implementation

### Files Created/Modified

#### 1. **Actions** - `actions/admin/user-results.ts`

- Added `role` parameter to `getUserResults` function
- Created `getUserResultsForExport` function specifically for export
- Enhanced filtering capabilities

#### 2. **API Route** - `app/api/admin/export-user-results/route.ts`

- New API endpoint for Excel export
- Processes user data and formats for Excel
- Uses `xlsx` library for file generation
- Auto-sizes columns for better readability

#### 3. **Page Component** - `app/dashboard/admin/results/page.tsx`

- Added role parameter handling from URL search params
- Passes role filter to data fetching function

#### 4. **Client Component** - `app/dashboard/admin/results/results-client.tsx`

- Added role filter dropdown (Select component)
- Added export button with loading state
- Enhanced UI layout with proper spacing
- Added Role column to the results table
- Updated table column spans for new column

### Dependencies Added

- `xlsx` - For Excel file generation and export

### Data Flow

1. **Filtering**: User selects role → URL updates → Server re-fetches filtered data → Page re-renders
2. **Export**: User clicks export → API call to `/api/admin/export-user-results` → Excel file generated → Download triggered

### Security Considerations

- Export only includes USER role data (admins/teachers excluded)
- Server-side data processing ensures data integrity
- File download happens client-side after server processing

## Usage Instructions

### For Filtering:

1. Navigate to `/dashboard/admin/results`
2. Use the "Filter by role" dropdown to select desired role
3. Optionally combine with search functionality
4. Results update automatically

### For Export:

1. Click "Export Users Excel" button
2. File downloads automatically with current date in filename
3. Open in Excel/LibreOffice to view formatted data

## Data Structure in Export

The Excel file contains one row per assessment result, with the following columns:

| Column                | Description                     |
| --------------------- | ------------------------------- |
| User Name             | Full name of the user           |
| Email                 | User's email address            |
| Role                  | Always "USER" for exported data |
| Assessment Name       | Name of the assessment taken    |
| Assessment Type       | READING, LISTENING, or WRITING  |
| Score                 | Numerical score achieved        |
| Total Correct Answers | Number of correct answers       |
| Total Questions       | Total questions in assessment   |
| Time Spent (minutes)  | Time taken to complete          |
| Completed Date        | Date assessment was completed   |
| Result Type           | "Assessment" or "Writing Essay" |

## Benefits

1. **Enhanced Admin Control**: Admins can quickly filter users by role
2. **Data Export**: Easy export of user data for analysis
3. **Professional Format**: Excel format suitable for reporting
4. **User-Focused Export**: Only exports actual users, not admin accounts
5. **Comprehensive Data**: Includes all relevant assessment information
6. **Date-Stamped Files**: Automatic date naming for file organization
