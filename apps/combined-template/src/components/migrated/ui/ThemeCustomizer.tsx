'use client';

import React, { useState } from 'react';
import { useThemeContext } from '../../../providers/ThemeProvider';
import type { Theme } from '../../../hooks/useTheme';
import { Button } from './Button';

interface ThemeCustomizerProps {
  className?: string;
}

const primaryColors = [
  { name: 'Blue', value: '#0d6efd' },
  { name: 'Indigo', value: '#6610f2' },
  { name: 'Purple', value: '#6f42c1' },
  { name: 'Pink', value: '#d63384' },
  { name: 'Red', value: '#dc3545' },
  { name: 'Orange', value: '#fd7e14' },
  { name: 'Yellow', value: '#ffc107' },
  { name: 'Green', value: '#198754' },
  { name: 'Teal', value: '#20c997' },
  { name: 'Cyan', value: '#0dcaf0' },
];

const fontSizes = [
  { name: 'Small', value: '14px' },
  { name: 'Default', value: '16px' },
  { name: 'Large', value: '18px' },
];

export function ThemeCustomizer({ className }: ThemeCustomizerProps) {
  const { theme, setTheme, effectiveTheme } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#0d6efd');
  const [fontSize, setFontSize] = useState('16px');

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    // Apply the color to CSS variable
    document.documentElement.style.setProperty('--primary', color);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    // Apply the font size
    document.documentElement.style.fontSize = size;
  };

  const resetCustomizations = () => {
    setPrimaryColor('#0d6efd');
    setFontSize('16px');
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.fontSize = '16px';
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`btn btn-primary rounded-circle position-fixed ${className}`}
        style={{
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          zIndex: 1040,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open theme customizer"
      >
        <i className="bi bi-palette-fill"></i>
      </button>

      {/* Customizer Panel */}
      <div
        className={`offcanvas offcanvas-end ${isOpen ? 'show' : ''}`}
        style={{
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'transform 0.3s ease-in-out',
        }}
        tabIndex={-1}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Theme Customizer</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          ></button>
        </div>
        
        <div className="offcanvas-body">
          {/* Theme Mode Section */}
          <div className="mb-4">
            <h6 className="mb-3">Theme Mode</h6>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="theme"
                id="theme-light"
                autoComplete="off"
                checked={theme === 'light'}
                onChange={() => handleThemeChange('light')}
              />
              <label className="btn btn-outline-primary" htmlFor="theme-light">
                <i className="bi bi-sun-fill me-2"></i>Light
              </label>

              <input
                type="radio"
                className="btn-check"
                name="theme"
                id="theme-dark"
                autoComplete="off"
                checked={theme === 'dark'}
                onChange={() => handleThemeChange('dark')}
              />
              <label className="btn btn-outline-primary" htmlFor="theme-dark">
                <i className="bi bi-moon-fill me-2"></i>Dark
              </label>

              <input
                type="radio"
                className="btn-check"
                name="theme"
                id="theme-auto"
                autoComplete="off"
                checked={theme === 'auto'}
                onChange={() => handleThemeChange('auto')}
              />
              <label className="btn btn-outline-primary" htmlFor="theme-auto">
                <i className="bi bi-circle-half me-2"></i>Auto
              </label>
            </div>
            {theme === 'auto' && (
              <small className="text-muted d-block mt-2">
                Currently using {effectiveTheme} theme based on system preference
              </small>
            )}
          </div>

          <hr />

          {/* Primary Color Section */}
          <div className="mb-4">
            <h6 className="mb-3">Primary Color</h6>
            <div className="row g-2">
              {primaryColors.map((color) => (
                <div key={color.value} className="col-4">
                  <button
                    className={`btn w-100 p-3 border ${
                      primaryColor === color.value ? 'border-primary border-2' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handlePrimaryColorChange(color.value)}
                    title={color.name}
                  >
                    {primaryColor === color.value && (
                      <i className="bi bi-check text-white"></i>
                    )}
                  </button>
                  <small className="d-block text-center mt-1">{color.name}</small>
                </div>
              ))}
            </div>
          </div>

          <hr />

          {/* Font Size Section */}
          <div className="mb-4">
            <h6 className="mb-3">Font Size</h6>
            <div className="btn-group w-100" role="group">
              {fontSizes.map((size) => (
                <React.Fragment key={size.value}>
                  <input
                    type="radio"
                    className="btn-check"
                    name="fontSize"
                    id={`fontSize-${size.value}`}
                    autoComplete="off"
                    checked={fontSize === size.value}
                    onChange={() => handleFontSizeChange(size.value)}
                  />
                  <label
                    className="btn btn-outline-primary"
                    htmlFor={`fontSize-${size.value}`}
                  >
                    {size.name}
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>

          <hr />

          {/* Reset Button */}
          <div className="d-grid">
            <Button
              variant="outline"
              className="btn-outline-secondary"
              onClick={resetCustomizations}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Reset Customizations
            </Button>
          </div>

          {/* Info Section */}
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="mb-2">
              <i className="bi bi-info-circle me-2"></i>About
            </h6>
            <small className="text-muted">
              Customize the appearance of your application. Changes are saved automatically
              and persist across sessions.
            </small>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}

// Toggle Button Component
export interface ThemeTogglerProps {
  className?: string;
}

export function ThemeToggler({ className = '' }: ThemeTogglerProps) {
  const { effectiveTheme, toggleTheme } = useThemeContext();
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