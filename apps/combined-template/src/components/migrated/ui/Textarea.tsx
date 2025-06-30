/**
 * T305_phase3_cp1: Textarea Component Migration
 * 
 * Direct mapping from Doctor-Dok ui/textarea.tsx to Bootstrap FormControl as="textarea"
 * Following COMPONENT_MAPPING.md LOW complexity direct mapping
 */

import React from 'react';
import { FormControl } from 'react-bootstrap';
import type { FormControlProps } from 'react-bootstrap';

export interface TextareaProps extends Omit<FormControlProps, 'as'> {
  // Doctor-Dok textarea API compatibility
  rows?: number;
  cols?: number;
  placeholder?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, ...props }, ref) => {
    return (
      <FormControl
        as="textarea"
        rows={rows}
        className={className}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };