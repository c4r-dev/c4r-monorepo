# Migration Plan: Separating Form and Content

## 1. Goal

This document outlines the process for refactoring all activities to separate the shared application "form" (the page layout, header, logo, and other consistent UI elements) from the unique "content" of each individual activity. The goal is to have a single, reusable component for the application frame, ensuring consistency and dramatically simplifying maintenance.

## 2. Problem Statement

Currently, the code for the application frame is duplicated across most, if not all, activities. Each activity has its own implementation of the header, and often its own copy of shared assets. Our analysis revealed this concretely: we found over 27 separate copies of the same logo file scattered throughout the repository.

This duplication leads to:
- **Inconsistency:** Different activities may have slightly different layouts or outdated logos.
- **Maintenance Overhead:** A simple change to the header, such as updating the logo, requires editing dozens of files across the entire project.
- **Bloated Code:** Each activity is larger than it needs to be, containing redundant layout code.

## 3. The Shared Layout Package: `@c4r/ui`

To solve this, we have created a new shared UI package located at `packages/ui`. This package is the **single source of truth** for all common UI components.

### Key Components

- **`<Header>`:** A standardized header component that includes the C4R logo and a help button. Its styles and assets are self-contained within the `@c4r/ui` package.

- **`<AppLayout>`:** The primary layout component. It uses the `<Header>` and provides a consistent page structure with a main content area. It is designed to wrap the unique content of any activity.

### How it Works

The `<AppLayout>` component uses React's `children` prop to render the specific content of an activity inside the common frame.

```javascript
// Simplified example from packages/ui/src/AppLayout.js
import React from 'react';
import { Header } from './Header';
import './layout.css';

export function AppLayout({ title, children }) {
  return (
    <div className="app-container">
      <Header text={title} />
      <main className="app-content">
        {/* The unique activity content will be rendered here */}
        {children}
      </main>
    </div>
  );
}
```

## 4. Careful Migration Process

Each activity must be refactored to use the new `@c4r/ui` package. The following steps should be repeated for every activity in the `apps/` directory.

### Step 1: Add the UI Dependency

If the activity does not have a `package.json`, create one. Then, add `@c4r/ui` as a dependency. The `workspace:*` protocol tells `npm` to link to our local `ui` package.

```json
// in apps/<activity-name>/package.json
"dependencies": {
  // ... other dependencies
  "@c4r/ui": "workspace:*"
}
```

### Step 2: Update the Root Layout (`layout.js`)

Replace the contents of the activity's `app/layout.js` file. The new file will be much simpler. It will import `AppLayout` and wrap the page `children` with it.

```javascript
// in apps/<activity-name>/app/layout.js
import { AppLayout } from '@c4r/ui';
import '@c4r/ui/src/layout.css'; // Import shared styles

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppLayout title="Name of Your Activity">
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
```

### Step 3: Simplify the Page Content (`page.js`)

The activity's main `app/page.js` file should now *only* be concerned with the activity's unique content. Remove any layout-related components like `<Header>` from this file, as they are now handled by `AppLayout`.

**Before:**
```javascript
// Old app/page.js
import Header from './components/Header'; // Local header
import MyActivity from './components/MyActivity';

export default function Page() {
  return (
    <div>
      <Header /> {/* Remove this */}
      <MyActivity />
    </div>
  );
}
```

**After:**
```javascript
// New app/page.js
import MyActivity from './components/MyActivity';

export default function Page() {
  return <MyActivity />;
}
```

### Step 4: Remove Redundant Code

This is a critical step. Delete the local `components/Header` directory and any local asset files (logos, icons) that are now provided by the `@c4r/ui` package. This eliminates the duplicated code.

### Step 5: Install Dependencies and Test

From the root of the monorepo, run `npm install` to link the packages. Then, run the specific activity to test the changes:

```bash
# From the monorepo root
npm install
npx turbo run dev --filter=<activity-name>
```

Open your browser to `http://localhost:3000` (or the specified port) and verify that:
1. The shared header and layout are displayed correctly.
2. The unique content of the activity is rendered correctly inside the layout.

## 5. Benefits

Following this process for all activities will result in a significantly cleaner, more consistent, and more maintainable codebase. Future updates to the application's look and feel will only require changes in one place: the `@c4r/ui` package.
