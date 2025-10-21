# App Store - Experiment Lab

A beautiful, category-based showcase for your web experiments and interactive projects.

## Adding New Experiments

To add a new experiment to the app store, simply add a new entry to the `EXPERIMENT_APPS` array in `data.ts`.

### Example

```typescript
{
  id: "my-cool-experiment",
  name: "My Cool Experiment",
  tagline: "A short one-liner describing what it does",
  description: "A longer description explaining the experiment, what technologies it uses, and what makes it interesting.",
  icon: "icon-name", // Icon filename from /public/assets/icons/apps/ (without .ico extension)
  category: "webgpu", // Choose from: webgpu, games, ai-tools, productivity, creative, utilities, experiments
  tags: ["webgpu", "particles", "interactive"], // Tags for search
  featured: false, // Set to true to show on the discover page
  available: false, // Set to true when the app is actually implemented
}
```

## Adding New Categories

To add a new category:

1. Update the `Category` type in `types.ts`
2. Add a new entry to the `CATEGORIES` array in `data.ts`

Example:

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
app-store/
├── index.tsx       # Main app store component with all views
├── data.ts         # All experiments and categories
├── types.ts        # TypeScript type definitions
└── catalog.ts      # Legacy file (can be removed)
```
