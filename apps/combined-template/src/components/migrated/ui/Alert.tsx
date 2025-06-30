/**
 * T305_phase3_cp1: Alert Component Migration
 * 
 * Direct mapping from Doctor-Dok ui/alert.tsx to Bootstrap Alert
 * Following COMPONENT_MAPPING.md LOW complexity direct mapping
 */

import React from 'react';
import { Alert as BootstrapAlert } from 'react-bootstrap';
import type { AlertProps as BootstrapAlertProps } from 'react-bootstrap';

// Mirror Doctor-Dok's alert variant API but map to Bootstrap
export interface AlertProps extends Omit<BootstrapAlertProps, 'variant'> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'default', children, className, ...props }, ref) => {
    // Map Doctor-Dok variants to Bootstrap variants
    const mapVariant = (variant: string) => {
      switch (variant) {
        case 'default': return 'primary';
        case 'destructive': return 'danger';
        case 'success': return 'success';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'primary';
      }
    };

    return (
      <BootstrapAlert
        ref={ref}
        variant={mapVariant(variant)}
        className={className}
        {...props}
      >
        {children}
      </BootstrapAlert>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert };