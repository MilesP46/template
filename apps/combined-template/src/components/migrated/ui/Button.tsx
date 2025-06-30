/**
 * Phase 3a Priority 1: Button Component Migration
 * 
 * Direct mapping from Doctor-Dok ui/button.tsx to Bootstrap Button
 * Following MIGRATION_PLAN.md critical path step 1
 */

import React from 'react';
import { Button as BootstrapButton, Spinner } from 'react-bootstrap';
import type { ButtonProps as BootstrapButtonProps } from 'react-bootstrap';

// Mirror Doctor-Dok's button variant API but map to Bootstrap
export interface ButtonProps extends Omit<BootstrapButtonProps, 'variant'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'lg';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size, loading, disabled, children, className, ...props }, ref) => {
    // Map Doctor-Dok variants to Bootstrap variants
    const mapVariant = (variant: string) => {
      switch (variant) {
        case 'default': return 'primary';
        case 'destructive': return 'danger';
        case 'outline': return 'outline-primary';
        case 'secondary': return 'secondary';
        case 'ghost': return 'outline-light';
        case 'link': return 'link';
        default: return 'primary';
      }
    };

    return (
      <BootstrapButton
        ref={ref}
        variant={mapVariant(variant)}
        size={size}
        disabled={disabled || loading}
        className={className}
        {...props}
      >
        {loading && (
          <Spinner
            as="span"
            animation="border"
            size="sm"
            className="me-2"
            aria-hidden="true"
          />
        )}
        {children}
      </BootstrapButton>
    );
  }
);

Button.displayName = 'Button';

export { Button };