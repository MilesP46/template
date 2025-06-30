# Theme Integration Documentation

## Overview

The combined template implements a comprehensive theme switching system that bridges Doctor-Dok's CSS variable approach with Rasket's Bootstrap 5 theming. This unified system provides seamless light/dark mode switching with persistent user preferences.

## Architecture

### Core Components

1. **useTheme Hook** (`src/hooks/useTheme.ts`)
   - Manages theme state (light/dark/auto)
   - Handles system theme detection
   - Persists user preferences to localStorage
   - Applies theme to document

2. **ThemeProvider** (`src/providers/ThemeProvider.tsx`)
   - React Context provider for global theme state
   - Handles SSR/hydration for Next.js
   - Manages theme transition animations

3. **CSS Variable Bridge** (`src/styles/migration/theme-bridge.scss`)
   - Maps Doctor-Dok CSS variables to Bootstrap variables
   - Ensures compatibility between both systems
   - Provides smooth theme transitions

4. **ThemeCustomizer** (`src/components/migrated/ui/ThemeCustomizer.tsx`)
   - UI component for theme configuration
   - Color scheme selection (light/dark/auto)
   - Primary color customization
   - Real-time preview

## Usage

### Basic Setup

#### Next.js Integration
```tsx
// app/layout.tsx
import { ThemeProvider } from '../providers/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          defaultTheme="auto"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### Vite/React Integration
```tsx
// main.tsx
import { ThemeProvider } from './providers/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

### Using the Theme Hook

```tsx
import { useTheme } from '../providers/ThemeProvider';

function MyComponent() {
  const { theme, effectiveTheme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {effectiveTheme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto</option>
      </select>
    </div>
  );
}
```

### Theme-Aware Components

Components automatically adapt to the current theme through CSS variables and Bootstrap's `data-bs-theme` attribute:

```tsx
// Theme-aware logo
const { effectiveTheme } = useTheme();
const logoSrc = effectiveTheme === 'dark' 
  ? '/img/logo-white.svg' 
  : '/img/logo.svg';

// Theme-specific classes
<div className={effectiveTheme === 'dark' ? 'bg-dark' : 'bg-light'}>
  Content
</div>
```

## CSS Variables

### Doctor-Dok Variables (Mapped)
- `--background`: Page background
- `--foreground`: Text color
- `--primary`: Primary brand color
- `--secondary`: Secondary color
- `--muted`: Muted backgrounds
- `--accent`: Accent color
- `--destructive`: Error/danger color
- `--border`: Border color
- `--input`: Input background
- `--ring`: Focus ring color

### Bootstrap Variables (Enhanced)
- `--bs-body-bg`: Body background
- `--bs-body-color`: Body text color
- `--bs-primary`: Primary color
- `--bs-border-color`: Border color
- All standard Bootstrap CSS variables

## Component Integration

### Migrated Components
All components in `/src/components/migrated/` support theme switching:

- **UI Components**: Button, Input, Label, Checkbox, etc.
- **Layout Components**: TopNavigationBar, TopHeaderStatic
- **Auth Components**: AuthorizationGuard (loading states)

### Theme Customizer
```tsx
import { ThemeCustomizer } from '../components/migrated/ui/ThemeCustomizer';

function App() {
  const [showCustomizer, setShowCustomizer] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowCustomizer(true)}>
        Customize Theme
      </button>
      <ThemeCustomizer 
        open={showCustomizer} 
        onClose={() => setShowCustomizer(false)} 
      />
    </>
  );
}
```

## Styling Guide

### SCSS Theme Support
```scss
// Component-specific dark mode styles
.my-component {
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  
  [data-bs-theme="dark"] & {
    // Dark mode specific styles
    border-color: var(--bs-border-color);
  }
}
```

### Utility Classes
```html
<!-- Only visible in light theme -->
<div class="theme-light-only">Light content</div>

<!-- Only visible in dark theme -->
<div class="theme-dark-only">Dark content</div>

<!-- Theme-aware backgrounds -->
<div class="bg-muted">Muted background</div>
<div class="text-muted-foreground">Muted text</div>
```

## Performance Considerations

1. **Transition Control**: Theme changes disable CSS transitions temporarily to prevent flash
2. **localStorage**: Theme preference persists across sessions
3. **SSR Support**: Handles hydration mismatches with `suppressHydrationWarning`
4. **Lazy Loading**: Theme customizer loads on-demand

## Testing

### Unit Tests
```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useTheme } from '../hooks/useTheme';

test('theme toggles between light and dark', () => {
  const { result } = renderHook(() => useTheme());
  
  act(() => {
    result.current.toggleTheme();
  });
  
  expect(result.current.effectiveTheme).toBe('dark');
});
```

### Visual Testing
1. Test theme switching animations
2. Verify component appearance in both themes
3. Check responsive behavior
4. Validate accessibility contrast ratios

## Migration Guide

### From Doctor-Dok Components
```tsx
// Before (next-themes)
import { useTheme } from 'next-themes';
const { theme, setTheme } = useTheme();

// After (combined template)
import { useTheme } from '../providers/ThemeProvider';
const { effectiveTheme, setTheme } = useTheme();
```

### From Rasket Components
```tsx
// Before (custom context)
import { useLayoutContext } from '@/context/useLayoutContext';
const { theme, changeTheme } = useLayoutContext();

// After (combined template)
import { useTheme } from '../providers/ThemeProvider';
const { effectiveTheme, setTheme } = useTheme();
```

## Troubleshooting

### Common Issues

1. **Flash of Unstyled Content (FOUC)**
   - Add `suppressHydrationWarning` to html and body tags
   - Use `disableTransitionOnChange` prop on ThemeProvider

2. **Theme Not Persisting**
   - Check localStorage permissions
   - Verify storage key isn't conflicting

3. **Components Not Updating**
   - Ensure components use CSS variables
   - Check for hardcoded colors

4. **SSR Hydration Errors**
   - Use `useClientTheme` hook for client-only components
   - Add proper hydration suppressions

## Future Enhancements

1. **Additional Themes**: Support for custom theme presets
2. **Contrast Modes**: High contrast accessibility options
3. **Theme Scheduling**: Automatic theme switching by time
4. **Component Variants**: Theme-specific component variations
5. **Export/Import**: Share theme configurations