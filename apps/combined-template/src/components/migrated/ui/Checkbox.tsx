/**
 * Phase 3a Priority 1: Checkbox Component Migration
 * 
 * Direct mapping from Doctor-Dok ui/checkbox.tsx to Bootstrap Form.Check
 * Following MIGRATION_PLAN.md critical path step 3
 */

import React from 'react';
import { FormCheck } from 'react-bootstrap';
import type { FormCheckProps } from 'react-bootstrap';

export interface CheckboxProps extends Omit<FormCheckProps, 'type'> {
  // Doctor-Dok checkbox API compatibility
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.target.checked;
      onChange?.(e);
      onCheckedChange?.(isChecked);
    };

    return (
      <FormCheck
        type="checkbox"
        className={className}
        checked={checked}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };