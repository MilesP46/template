/**
 * Phase 3a Priority 1: Label Component Migration
 * 
 * Direct mapping from Doctor-Dok ui/label.tsx to Bootstrap Form.Label
 * Following MIGRATION_PLAN.md critical path step 2
 */

import React from 'react';
import { FormLabel } from 'react-bootstrap';
import type { FormLabelProps } from 'react-bootstrap';

export interface LabelProps extends FormLabelProps {
  // Doctor-Dok label API compatibility
  htmlFor?: string;
  children?: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, htmlFor, ...props }, ref) => {
    return (
      <FormLabel
        htmlFor={htmlFor}
        className={className}
        ref={ref}
        {...props}
      >
        {children}
      </FormLabel>
    );
  }
);

Label.displayName = 'Label';

export { Label };