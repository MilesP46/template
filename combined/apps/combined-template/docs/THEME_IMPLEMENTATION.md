# Theme Switching Implementation Documentation

## Overview

This document describes the comprehensive theme switching implementation for the combined template, which integrates Doctor-Dok's theme preferences with Rasket's Bootstrap 5 theming system.

## Architecture

### Core Components

1. **Theme Hook (`useTheme.ts`)**
   - Provides theme state management
   - Handles system theme detection
   - Manages localStorage persistence
   - Compatible with both Doctor-Dok and Rasket patterns

2. **Theme Provider (`ThemeProvider.tsx`)**
   - React Context for global theme state
   - Prevents flash of unstyled content (FOUC)
   - Manages theme transitions
   - Handles primary color and font scale customization

3. **Theme Customizer (`ThemeCustomizer.tsx`)**
   - UI component for theme configuration
   - Color scheme selection (light/dark/auto)
   - Primary color picker
   - Font size adjustment
   - Live preview

4. **CSS Variable Bridge (`theme-bridge.scss`)**
   - Maps Doctor-Dok CSS variables to Bootstrap
   - Ensures compatibility between systems
   - Provides utility classes

5. **Bootstrap Theme Configuration (`bootstrap-themes.scss`)**
   - Defines light and dark theme variables
   - Component-specific overrides
   - Custom properties for dark mode

## Usage

### Basic Setup

```tsx
// In your root component (App.tsx or layout.tsx)
import { ThemeProvider } from '../providers/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="auto" enableSystem>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Using Theme in Components

```tsx
import { useThemeContext } from '../providers/ThemeProvider';

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

### Theme-Aware Component Example

```tsx
import { useThemeContext } from '../providers/ThemeProvider';

function Logo() {
  const { effectiveTheme } = useThemeContext();
  
  return (
    <img 
      src={effectiveTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
      alt="Logo"
    />
  );
}
```

## Features

### 1. Theme Modes
- **Light**: Traditional light color scheme
- **Dark**: Eye-friendly dark color scheme
- **Auto**: Follows system preference

### 2. Customization Options
- **Primary Color**: Choose from presets or custom color
- **Font Scale**: Adjust base font size (75% - 150%)
- **Component Styles**: Themed buttons, forms, navigation, modals

### 3. Persistence
- Theme preferences saved to localStorage
- Consistent across page reloads
- No flash of unstyled content

### 4. Performance
- Optimized CSS variable updates
- Throttled theme transitions
- Minimal re-renders

## CSS Variables

### Doctor-Dok Variables (Mapped)
```css
--background: Background color
--foreground: Text color
--primary: Primary brand color
--secondary: Secondary color
--card: Card background
--border: Border color
--muted: Muted backgrounds
--accent: Accent color
--destructive: Danger/error color
```

### Bootstrap Variables (Dark Mode)
```css
--bs-body-bg: Body background
--bs-body-color: Body text color
--bs-primary: Primary color
--bs-border-color: Border color
--bs-card-bg: Card background
```

## Component Integration

### Navigation
- Automatic logo switching
- Theme toggle button
- Adaptive navbar colors

### Forms
- Dark mode input styling
- Custom form controls
- Themed validation states

### Buttons
- Ghost button variant
- Theme-aware hover states
- Loading states

### Modals
- Dark backdrop
- Themed content
- Custom modal variants

## Migration Guide

### From Doctor-Dok
1. Replace `next-themes` ThemeProvider with our ThemeProvider
2. Update `useTheme` imports to use our implementation
3. CSS variables are automatically mapped

### From Rasket
1. Replace `useLayoutContext` theme functions with `useThemeContext`
2. Update theme toggle components to use our ThemeCustomizer
3. Bootstrap classes work automatically

## Best Practices

1. **Always use CSS variables** for colors that should adapt to theme
2. **Test in both themes** during development
3. **Consider contrast** for accessibility
4. **Use semantic colors** (primary, danger) instead of specific colors
5. **Provide theme-specific assets** (logos, images) when needed

## Troubleshooting

### Flash of Unstyled Content
- Ensure ThemeProvider wraps your entire app
- Check that the inline script is rendering

### Theme Not Persisting
- Verify localStorage is not blocked
- Check storage key conflicts

### Components Not Theming
- Ensure component uses Bootstrap classes or CSS variables
- Check for hardcoded colors
- Verify SCSS imports

## Testing

### Unit Tests
```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { ThemeProvider, useThemeContext } from '../providers/ThemeProvider';

test('theme toggles correctly', () => {
  const { result } = renderHook(() => useThemeContext(), {
    wrapper: ThemeProvider,
  });
  
  act(() => {
    result.current.toggleTheme();
  });
  
  expect(result.current.effectiveTheme).toBe('dark');
});
```

### Visual Testing
- Test theme switching animations
- Verify no layout shifts
- Check component appearance in both themes
- Test with system theme changes

## Future Enhancements

1. **Additional Themes**: Support for custom theme presets
2. **Contrast Modes**: High contrast options
3. **Theme Scheduling**: Auto-switch based on time
4. **Per-Component Themes**: Override theme for specific sections
5. **Theme Export/Import**: Share theme configurations