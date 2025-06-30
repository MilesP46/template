'use client';

import React, { useState } from 'react';
import { Button, Col, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';
import { useThemeContext } from '../../../providers/ThemeProvider';
import type { Theme } from '../../../hooks/useTheme';

interface ThemeCustomizerProps {
  open: boolean;
  toggle: () => void;
}

const ColorScheme = () => {
  const { theme, setTheme } = useThemeContext();
  const modes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto (System)' },
  ];

  return (
    <div className="mb-4">
      <h5 className="mb-3 font-16 fw-semibold">Color Scheme</h5>
      {modes.map((mode) => (
        <div key={mode.value} className="form-check mb-2">
          <input
            className="form-check-input"
            type="radio"
            name="color-scheme"
            id={`color-scheme-${mode.value}`}
            onChange={() => setTheme(mode.value)}
            checked={theme === mode.value}
          />
          <label className="form-check-label" htmlFor={`color-scheme-${mode.value}`}>
            {mode.label}
          </label>
        </div>
      ))}
    </div>
  );
};

const PrimaryColorPicker = () => {
  const { primaryColor, setPrimaryColor } = useThemeContext();
  const [customColor, setCustomColor] = useState(primaryColor || '#0d6efd');

  const presetColors = [
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

  return (
    <div className="mb-4">
      <h5 className="mb-3 font-16 fw-semibold">Primary Color</h5>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {presetColors.map((color) => (
          <button
            key={color.value}
            className="btn btn-sm position-relative p-0"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: color.value,
              border: primaryColor === color.value ? '2px solid var(--bs-dark)' : '1px solid var(--bs-gray-300)',
            }}
            onClick={() => setPrimaryColor?.(color.value)}
            title={color.name}
          >
            {primaryColor === color.value && (
              <span className="position-absolute top-50 start-50 translate-middle text-white">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="input-group">
        <input
          type="color"
          className="form-control form-control-color"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          title="Choose custom color"
        />
        <input
          type="text"
          className="form-control"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          placeholder="#000000"
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => setPrimaryColor?.(customColor)}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

const FontScale = () => {
  const { fontScale, setFontScale } = useThemeContext();
  const currentScale = fontScale || 1;

  const scales = [
    { label: 'Small', value: 0.875 },
    { label: 'Default', value: 1 },
    { label: 'Large', value: 1.125 },
    { label: 'Extra Large', value: 1.25 },
  ];

  return (
    <div className="mb-4">
      <h5 className="mb-3 font-16 fw-semibold">Font Size</h5>
      <div className="mb-2">
        <input
          type="range"
          className="form-range"
          min="0.75"
          max="1.5"
          step="0.05"
          value={currentScale}
          onChange={(e) => setFontScale?.(parseFloat(e.target.value))}
        />
      </div>
      <div className="d-flex justify-content-between small text-muted">
        <span>75%</span>
        <span>{Math.round(currentScale * 100)}%</span>
        <span>150%</span>
      </div>
      <div className="mt-2">
        {scales.map((scale) => (
          <button
            key={scale.value}
            className={`btn btn-sm me-1 ${
              Math.abs(currentScale - scale.value) < 0.01 ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => setFontScale?.(scale.value)}
          >
            {scale.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const ThemePreview = () => {
  const { effectiveTheme } = useThemeContext();

  return (
    <div className="mb-4">
      <h5 className="mb-3 font-16 fw-semibold">Preview</h5>
      <div className={`card ${effectiveTheme === 'dark' ? 'bg-dark text-white' : ''}`}>
        <div className="card-body">
          <h6 className="card-title">Sample Card</h6>
          <p className="card-text">
            This is how your content will look with the current theme settings.
          </p>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm">Primary</button>
            <button className="btn btn-secondary btn-sm">Secondary</button>
            <button className="btn btn-success btn-sm">Success</button>
            <button className="btn btn-danger btn-sm">Danger</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ open, toggle }) => {
  const { theme, setTheme, setPrimaryColor, setFontScale } = useThemeContext();

  const resetSettings = () => {
    setTheme('auto');
    setPrimaryColor?.('#0d6efd');
    setFontScale?.(1);
  };

  return (
    <Offcanvas placement="end" show={open} onHide={toggle} className="border-0" tabIndex={-1}>
      <OffcanvasHeader 
        {...(theme === 'dark' ? { closeVariant: 'white' } : {})}
        closeButton 
        className="d-flex align-items-center bg-primary p-3"
      >
        <h5 className="text-white m-0">Theme Settings</h5>
      </OffcanvasHeader>
      <OffcanvasBody className="p-0">
        <div className="h-100 overflow-auto">
          <div className="p-3">
            <ColorScheme />
            <hr />
            <PrimaryColorPicker />
            <hr />
            <FontScale />
            <hr />
            <ThemePreview />
          </div>
        </div>
      </OffcanvasBody>
      <div className="offcanvas-footer border-top p-3 text-center">
        <Row>
          <Col>
            <Button variant="danger" onClick={resetSettings} className="w-100">
              Reset to Defaults
            </Button>
          </Col>
        </Row>
      </div>
    </Offcanvas>
  );
};

export default ThemeCustomizer;