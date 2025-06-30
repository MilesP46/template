/**
 * Phase 3a Priority 1: Input Component Migration
 * 
 * Direct mapping from Doctor-Dok ui/input.tsx to Bootstrap FormControl
 * Following MIGRATION_PLAN.md critical path step 2
 */

import React from 'react';
import { FormControl } from 'react-bootstrap';
import type { FormControlProps } from 'react-bootstrap';

export interface InputProps extends FormControlProps {
  // Doctor-Dok input API compatibility
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <FormControl
        type={type}
        className={className}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };