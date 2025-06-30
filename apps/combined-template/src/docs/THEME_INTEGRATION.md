# Theme Switching Implementation

This document provides a comprehensive guide to the theme switching implementation in the Combined Template application.

## Overview

The theme system provides seamless switching between light and dark modes, integrating Doctor-Dok's theme preferences with Rasket's Bootstrap 5 theming system. All components support both themes with smooth transitions.

## Architecture

### Core Components

1. **Theme Hook** (`hooks/useTheme.ts`)
   - Manages theme state (light/dark/auto)
   - Detects system preferences
   - Persists user preference to localStorage
   - Applies theme to document

2. **Theme Provider** (`providers/ThemeProvider.tsx`)
   - React Context for global theme state
   - Wraps application components
   - Provides theme data to all children

3. **CSS Variable Bridge** (`styles/migration/theme-bridge.scss`)
   - Maps Doctor-Dok CSS variables to Bootstrap
   - Ensures compatibility between both systems
   - Provides smooth transitions

4. **Theme Customizer** (`components/migrated/ui/ThemeCustomizer.tsx`)
   - User interface for theme switching
   - Primary color customization
   - Font size adjustments
   - Floating action button design

## Usage

### Basic Theme Usage

```typescript
import { useThemeContext } from '@/providers/ThemeProvider';

function MyComponent() {
  const { theme, effectiveTheme, toggleTheme } = useThemeContext();
  
  return (
    <div>
      <p>Current theme: {effectiveTheme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### Theme-Aware Styling

```scss
// Using CSS variables that automatically adapt
.my-component {
  background-color: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
}

// Dark mode specific overrides
[data-bs-theme="dark"] {
  .my-component {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
}
```

### Conditional Rendering

```typescript
function ThemedImage() {
  const { effectiveTheme } = useThemeContext();
  
  return (
    <img 
      src={effectiveTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
      alt="Logo"
    />
  );
}
```

## CSS Variables Reference

### Core Variables

| Variable | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|--------|
| `--background` | #ffffff | #1a1a1a | Page background |
| `--foreground` | #212529 | #e9ecef | Primary text color |
| `--card` | #ffffff | #212529 | Card backgrounds |
| `--primary` | #0d6efd | #4c9eff | Primary actions |
| `--border` | #dee2e6 | #495057 | Borders |
| `--muted` | #f8f9fa | #343a40 | Muted backgrounds |

### Component Variables

- `--card-foreground`: Text color for card content
- `--popover`: Popover/dropdown background
- `--input`: Input border color
- `--ring`: Focus ring color
- `--destructive`: Error/danger color

## Bootstrap Integration

### Automatic Bootstrap Support

Bootstrap components automatically respect the theme through the `data-bs-theme` attribute:

```html
<!-- Applied automatically by theme system -->
<html data-bs-theme="dark">
```

### Bootstrap Component Overrides

The theme system includes specific overrides for Bootstrap components:

- Forms: Custom background and border colors
- Buttons: Enhanced contrast in dark mode
- Cards: Theme-aware backgrounds
- Modals: Proper dark mode styling
- Tables: Striped rows with theme colors

## Adding Theme Support to New Components

### 1. Use Theme Hook

```typescript
import { useThemeContext } from '@/providers/ThemeProvider';

export function NewComponent() {
  const { effectiveTheme, isDark } = useThemeContext();
  
  return (
    <div className={isDark ? 'dark-variant' : 'light-variant'}>
      {/* Component content */}
    </div>
  );
}
```

### 2. Use CSS Variables

```scss
.new-component {
  // These automatically adapt to theme changes
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  
  &:hover {
    background: var(--muted);
  }
}
```

### 3. Add Dark Mode Overrides

```scss
[data-bs-theme="dark"] {
  .new-component {
    // Dark-specific overrides
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }
}
```

## Theme Customizer Features

The Theme Customizer provides:

1. **Theme Mode Selection**
   - Light: Force light theme
   - Dark: Force dark theme
   - Auto: Follow system preference

2. **Primary Color Customization**
   - 10 preset color options
   - Updates `--primary` CSS variable
   - Affects all primary UI elements

3. **Font Size Adjustment**
   - Small (14px)
   - Default (16px)  
   - Large (18px)

4. **Reset Functionality**
   - Restore default settings
   - Clear customizations

## Performance Optimizations

1. **CSS Variable Usage**
   - No JavaScript recalculation needed
   - Browser handles theme switching
   - Instant updates

2. **LocalStorage Persistence**
   - Theme preference saved
   - Fast restoration on page load
   - No flash of wrong theme

3. **Transition Control**
   - Smooth theme transitions
   - No jarring color changes
   - Configurable transition timing

## Troubleshooting

### Common Issues

1. **Flash of Wrong Theme**
   - Ensure `suppressHydrationWarning` on html/body
   - Check theme restoration in layout

2. **Component Not Themed**
   - Verify CSS variables usage
   - Check for hardcoded colors
   - Add dark mode overrides

3. **Bootstrap Components Look Wrong**
   - Ensure Bootstrap CSS imported after theme
   - Check for CSS specificity issues
   - Verify `data-bs-theme` attribute

### Debug Mode

```typescript
// Enable theme debugging
const { theme, effectiveTheme, systemTheme } = useThemeContext();

console.log({
  userPreference: theme,
  appliedTheme: effectiveTheme,
  systemPreference: systemTheme
});
```

## Migration Guide

### From Doctor-Dok

Doctor-Dok components already use CSS variables, so they work automatically. Just ensure:

1. Replace `useTheme` from next-themes with our hook
2. Update CSS variable names if different
3. Test dark mode appearance

### From Rasket

Rasket components need updates:

1. Replace Bootstrap color classes with CSS variables
2. Add dark mode specific overrides
3. Test component in both themes

## Future Enhancements

1. **Additional Themes**
   - High contrast mode
   - Custom color schemes
   - Seasonal themes

2. **Accessibility**
   - Prefers-reduced-motion support
   - High contrast detection
   - WCAG compliance

3. **Advanced Customization**
   - Custom CSS variable editor
   - Theme import/export
   - Per-component theming