import React, { useState } from 'react';
import { Button } from './Button';
import { Label } from './Label';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { useTheme } from '../../../providers/ThemeProvider';
import type { Theme } from '../../../hooks/useTheme';

export interface ThemeCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState('#0d6efd');

  const handleThemeChange = (value: string) => {
    setTheme(value as Theme);
  };

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    // Apply custom primary color
    document.documentElement.style.setProperty('--bs-primary', color);
    document.documentElement.style.setProperty('--primary', color);
  };

  const resetSettings = () => {
    setTheme('auto');
    setPrimaryColor('#0d6efd');
    document.documentElement.style.removeProperty('--bs-primary');
    document.documentElement.style.removeProperty('--primary');
  };

  return (
    <div
      className={`offcanvas offcanvas-end ${open ? 'show' : ''}`}
      style={{ visibility: open ? 'visible' : 'hidden' }}
      tabIndex={-1}
    >
      <div className="offcanvas-header bg-primary text-white">
        <h5 className="offcanvas-title">Theme Settings</h5>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onClose}
          aria-label="Close"
        />
      </div>
      
      <div className="offcanvas-body">
        <div className="mb-4">
          <h6 className="mb-3">Color Scheme</h6>
          <RadioGroup value={theme} onValueChange={handleThemeChange}>
            <div className="mb-2">
              <div className="form-check">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light" className="form-check-label ms-2">
                  Light
                </Label>
              </div>
            </div>
            <div className="mb-2">
              <div className="form-check">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark" className="form-check-label ms-2">
                  Dark
                </Label>
              </div>
            </div>
            <div className="mb-2">
              <div className="form-check">
                <RadioGroupItem value="auto" id="theme-auto" />
                <Label htmlFor="theme-auto" className="form-check-label ms-2">
                  Auto (System)
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="mb-4">
          <h6 className="mb-3">Primary Color</h6>
          <div className="d-flex gap-2 flex-wrap">
            {[
              { color: '#0d6efd', name: 'Blue' },
              { color: '#6610f2', name: 'Indigo' },
              { color: '#6f42c1', name: 'Purple' },
              { color: '#d63384', name: 'Pink' },
              { color: '#dc3545', name: 'Red' },
              { color: '#fd7e14', name: 'Orange' },
              { color: '#ffc107', name: 'Yellow' },
              { color: '#198754', name: 'Green' },
              { color: '#20c997', name: 'Teal' },
              { color: '#0dcaf0', name: 'Cyan' },
            ].map(({ color, name }) => (
              <button
                key={color}
                type="button"
                className={`btn btn-sm position-relative ${
                  primaryColor === color ? 'border-primary border-2' : 'border'
                }`}
                style={{
                  backgroundColor: color,
                  width: '40px',
                  height: '40px',
                }}
                onClick={() => handlePrimaryColorChange(color)}
                title={name}
              >
                {primaryColor === color && (
                  <span className="position-absolute top-50 start-50 translate-middle">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="white"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h6 className="mb-3">Preview</h6>
          <div className="card">
            <div className="card-body">
              <p className="text-muted mb-2">Current theme: {effectiveTheme}</p>
                             <div className="d-flex gap-2">
                 <Button variant="default" size="sm">Default</Button>
                 <Button variant="secondary" size="sm">Secondary</Button>
                 <Button variant="outline" size="sm">Outline</Button>
                 <Button variant="destructive" size="sm">Destructive</Button>
               </div>
            </div>
          </div>
        </div>

        <div className="d-grid">
          <Button variant="destructive" onClick={resetSettings}>
            Reset Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

// Toggle Button Component
export interface ThemeTogglerProps {
  className?: string;
}

export function ThemeToggler({ className = '' }: ThemeTogglerProps) {
  const { effectiveTheme, toggleTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <button
      type="button"
      className={`btn btn-ghost-secondary btn-icon ${className}`}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 2.5V5M10 15V17.5M17.5 10H15M5 10H2.5M15.3033 4.69669L13.5355 6.46446M6.46446 13.5355L4.69669 15.3033M15.3033 15.3033L13.5355 13.5355M6.46446 6.46446L4.69669 4.69669M13.75 10C13.75 12.0711 12.0711 13.75 10 13.75C7.92893 13.75 6.25 12.0711 6.25 10C6.25 7.92893 7.92893 6.25 10 6.25C12.0711 6.25 13.75 7.92893 13.75 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.5 10.8333C17.0482 11.8777 16.3281 12.783 15.4143 13.4588C14.5005 14.1346 13.4262 14.5575 12.2977 14.6857C11.1692 14.8139 10.0275 14.6428 8.98547 14.1891C7.94343 13.7353 7.03876 13.0149 6.36298 12.101C5.68719 11.1871 5.26418 10.1128 5.13596 8.98433C5.00774 7.85582 5.17886 6.71412 5.63263 5.67208C6.0864 4.63004 6.80678 3.72537 7.72064 3.04959C8.6345 2.3738 9.70881 2.00862 10.8333 2C10.0781 2.93176 9.62465 4.06567 9.53058 5.25212C9.43651 6.43858 9.70598 7.62294 10.3034 8.6469C10.9008 9.67086 11.7978 10.4858 12.8721 10.9806C13.9464 11.4755 15.1477 11.6261 16.3167 11.4125C16.5 11.3833 16.6833 11.3458 16.8667 11.3C17.0833 11.2458 17.2958 11.1833 17.5 11.1042V10.8333Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}