# Login Screen Components

This directory contains the refactored login screen components, organized for better maintainability and reusability.

## Structure

```text
components/screens/login/
├── index.tsx                    # Main LoginScreen component
├── components/                  # Reusable UI components
│   ├── index.ts                # Component exports
│   ├── Avatar.tsx              # User avatar with liquid glass effect
│   ├── PasswordInput.tsx       # Password input with animations
│   ├── StatusBar.tsx           # Wi-Fi and battery status
│   ├── SVGFilters.tsx          # SVG filter definitions
│   ├── TimeDisplay.tsx         # Large time and date display
│   └── hooks.ts                # Custom hooks (caps lock detection)
├── constants/
│   └── fonts.ts                # Font family constants
├── styles/
│   └── animations.ts           # CSS animations
└── types/
    └── index.ts                # TypeScript interfaces
```

## Components

### LoginScreen

The main component that orchestrates all sub-components and manages the login state.

### Avatar

Displays the user avatar with liquid glass effects and animations.

### PasswordInput

Handles password input with:

- Masked character display
- Liquid glass visual effects
- Caps Lock detection
- Submit button
- Loading state
- Error animations

### TimeDisplay

Shows the current time and date with:

- Large glassy typography
- SVG-based text effects
- Real-time updates

### StatusBar

Simple status indicators for Wi-Fi and battery.

### SVGFilters

Contains all SVG filter definitions used throughout the components.

## Hooks

### useCapsLockDetection

Custom hook that detects when Caps Lock is enabled.

## Constants

### Fonts

Apple-style font stacks used throughout the login screen.

## Styles

### Animations

CSS keyframe animations (shake effect for wrong password).

## Usage

```tsx
import LoginScreen from "./components/screens/login";

function App() {
  return (
    <LoginScreen
      onSuccess={() => console.log("Login successful!")}
    />
  );
}
```
