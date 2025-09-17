# Monorepo Refactoring Plan

## 1. Overview

This document outlines a comprehensive plan to refactor the existing `c4r-monorepo` from its current state as a "monolithic monorepo" into a standard, scalable, multi-package monorepo. The primary goal is to improve maintainability, streamline development, and make it easier to build and add new applications (activities).

## 2. Current State Analysis

The repository currently operates as a single, large npm package. While it contains multiple distinct applications, they all share a single, massive `package.json` file in the root. This leads to several significant challenges:

- **Dependency Bloat:** Every application has every dependency, even if it doesn't use them. This increases build times, bundle sizes, and the risk of dependency conflicts.
- **Lack of Isolation:** Changes to one application can unintentionally break another. There is no clear boundary between applications.
- **Cluttered Root Directory:** The root is filled with numerous helper scripts, test artifacts, and configuration files, making it difficult to navigate and understand the project structure.
- **Complex, Manual Tooling:** The presence of many custom scripts (e.g., `synchronize-dependencies.js`, `backup-individual-packages.js`) indicates that the current setup requires brittle, manual processes to manage.

## 3. Proposed Architecture: The Multi-Package Monorepo

We will adopt a standard monorepo structure managed by `npm workspaces` and `Turborepo`. This structure is organized as follows:

- **`apps/`**: This directory will contain all the runnable applications (the "activities"). Each subdirectory within `apps/` will be a self-contained Next.js application with its own `package.json` file, defining only the dependencies it needs.

- **`packages/`**: This directory will contain shared code that is used by multiple applications. Examples include UI component libraries, utility functions, and design systems. Each subdirectory within `packages/` will be its own versioned npm package.

- **`scripts/`**: This directory will house all the repository-level helper scripts.

- **Root `package.json`**: This file will be minimal. It will define the workspaces, list root-level development dependencies (like `turbo`, `typescript`, and `eslint`), and contain `npm` scripts for running tasks across the entire monorepo.

## 4. Detailed Refactoring Phases

### Phase 1: Initial Cleanup and Workspace Setup (Completed)

This foundational phase has already been completed. The following actions were taken:

1.  **Scripts Relocated:** All `.js` helper scripts were moved from the root into the `scripts/` directory.
2.  **`.gitignore` Updated:** The `.gitignore` file was updated to exclude temporary files, logs, and other generated artifacts from the root directory.
3.  **Workspace Configured:** The root `package.json` was modified to:
    -   Define the `workspaces` for `apps/*` and `packages/*`.
    -   Update the `scripts` to point to the new paths in the `scripts/` directory.
4.  **Initial Commit:** All changes, including the deletion of now-obsolete per-activity `package.json` files, were committed to establish a clean baseline for the refactor.

### Phase 2: Activity Migration (Iterative Process)

This is the core of the refactoring effort. Each activity from the old `activities/` directory will be migrated into the `apps/` directory one by one. The following steps should be repeated for each activity:

1.  **Move Activity:** Move the activity's source code to its new home.
    ```bash
    # Example for jhu-flu-dag-v1
    mkdir -p apps/jhu-flu-dag-v1
    mv activities/causality/jhu-flu-dag-v1/* apps/jhu-flu-dag-v1/
    ```

2.  **Create `package.json`:** Create a new `package.json` file inside the new activity directory (`apps/<activity-name>/package.json`). Use the following template as a starting point:

    ```json
    {
      "name": "<activity-name>",
      "version": "0.1.0",
      "private": true,
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },
      "dependencies": {
        "react": "^18",
        "react-dom": "^18",
        "next": "14.2.3"
      },
      "devDependencies": {
        "typescript": "^5",
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "eslint": "^8",
        "eslint-config-next": "14.2.3"
      }
    }
    ```

3.  **Identify and Add Dependencies:** This is a manual, iterative process.
    -   Navigate to the new activity's directory: `cd apps/<activity-name>`.
    -   Run `npm install`.
    -   Attempt to start the development server: `npm run dev`.
    -   The build will likely fail with errors about missing packages. Read the error messages and add the missing dependencies to the activity's `package.json`.
    -   Repeat this process until the application builds and runs successfully.

4.  **Remove Old Directory:** Once the migrated application is working, remove the old directory.
    ```bash
    rm -rf activities/causality/jhu-flu-dag-v1
    ```

5.  **Commit:** Commit the newly migrated activity. This keeps the refactoring process safe and reversible.
    ```bash
    git add apps/<activity-name> activities/
    git commit -m "feat(activities): Migrate <activity-name> to new monorepo structure"
    ```

### Phase 3: Shared Package Extraction

As you migrate activities, you will identify code that is duplicated across multiple applications. This code should be extracted into shared packages.

1.  **Identify Shared Code:** Look for common UI components, utility functions, hooks, and design tokens.
2.  **Create a Package:** Create a new directory in `packages/` (e.g., `packages/ui`, `packages/utils`).
3.  **Add `package.json`:** Give the new package its own `package.json` file.
    ```json
    {
      "name": "@c4r/ui",
      "version": "0.1.0",
      "private": true,
      "main": "./index.js",
      "types": "./index.d.ts",
      "scripts": {
        "lint": "eslint ."
      },
      "dependencies": { ... },
      "devDependencies": { ... }
    }
    ```
4.  **Move Code:** Move the shared code into the new package.
5.  **Refactor Applications:** Update the applications that were using this code to import it from the new package.
6.  **Add Dependency:** Add the new shared package as a dependency in the `package.json` of the applications that use it.
    ```json
    "dependencies": {
      "@c4r/ui": "workspace:*"
    }
    ```

### Phase 4: Final Cleanup and Standardization

Once all activities are migrated and shared code is extracted:

1.  **Remove Old Directories:** Delete the now-empty `activities/` directory.
2.  **Review Root Dependencies:** Analyze the root `package.json` and remove any dependencies that are no longer needed at the global level.
3.  **Standardize Scripts:** Ensure that all applications and packages have a consistent set of `npm` scripts (`dev`, `build`, `test`, `lint`).
4.  **Update `turbo.json`:** Fine-tune the `turbo.json` pipeline to optimize build and test processes for the new structure.

## 5. Benefits of the New Structure

- **Improved Maintainability:** Clear ownership and isolation of code.
- **Faster Builds:** `Turborepo` can cache and parallelize tasks efficiently.
- **Smaller Bundle Sizes:** Each application only includes the code and dependencies it needs.
- **Better Developer Experience:** A clean, organized, and standard structure is easier to work with.
- **Scalability:** Adding new applications and packages is straightforward.
