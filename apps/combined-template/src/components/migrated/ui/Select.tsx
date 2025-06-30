/**
 * T305_phase3_cp1: Select Component Migration
 * 
 * Direct mapping from Doctor-Dok ui/select.tsx to Bootstrap Form.Select
 * Following COMPONENT_MAPPING.md LOW complexity direct mapping
 */

import React from 'react';
import { FormSelect } from 'react-bootstrap';
import type { FormSelectProps } from 'react-bootstrap';

export interface SelectProps extends FormSelectProps {
  // Doctor-Dok select API compatibility
  placeholder?: string;
  children: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, ...props }, ref) => {
    return (
      <FormSelect
        className={className}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </FormSelect>
    );
  }
);

Select.displayName = 'Select';

// Additional components for compatibility with Doctor-Dok's compound select pattern
export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, disabled }) => (
  <option value={value} disabled={disabled}>
    {children}
  </option>
);

export { Select };