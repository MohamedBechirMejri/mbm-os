# App Store - Experiment Lab

A beautiful, category-based showcase for your web experiments and interactive projects.

## Adding New Experiments

To add a new experiment to the app store, add a new entry to the `catalogApps` array in `../app-catalog.ts`.

### Example

```typescript
{
  id: "my-cool-experiment",
  title: "My Cool Experiment",
  icon: "icon-name", // Icon filename from /public/assets/icons/apps/ (without .ico extension)
  Component: MyExperimentComponent, // The React component to render
  minSize: { w: 1280, h: 960 },
  floatingActionBar: true,
  // App Store metadata
  tagline: "A short one-liner describing what it does",
  description: "A longer description explaining the experiment, what technologies it uses, and what makes it interesting.",
  category: "webgpu", // Choose from: webgpu, games, ai-tools, productivity, creative, utilities, experiments
  tags: ["webgpu", "particles", "interactive"],
  featured: false, // Set to true to show on the discover page
  available: false, // Set to true when the app is actually implemented
}
```

## Adding New Categories

To add a new category, update the `CATEGORIES` array in `../app-catalog.ts`:

```typescript
{
  id: "new-category",
  name: "New Category",
  description: "Description of what this category includes",
  icon: "icon-name", // Icon from /public/assets/icons/apps/
  color: "#FF6B6B", // Hex color for accent
}
```

## Design Philosophy

- **Rem-based sizing**: All font sizes use rem units for scalability
- **Liquid glass aesthetics**: Subtle gradients, backdrop blur, and transparency
- **Clean structure**: Easy to maintain and extend
- **Category-focused**: Helps visitors discover experiments by interest

## Structure

```
apps/
├── app-catalog.ts      # Unified app catalog with all apps and categories
├── app-registry.ts     # Registers apps with the window manager
└── app-store/
    ├── index.tsx       # Main app store component with all views
    └── readme.md       # This documentation
```

## Key Files

- **`../app-catalog.ts`**: The single source of truth for all apps. Contains:
  - `CatalogApp` type: Unified type combining window manager and App Store metadata
  - `catalogApps`: Array of all apps in the system
  - `CATEGORIES`: All category definitions
  - `preinstalledApps`: Apps that show in dock by default
  - Helper functions: `getFeaturedApps()`, `getAppsByCategory()`, `toAppMeta()`
