/**
 * EXAMPLE: Button Component Migration Pattern
 * 
 * This demonstrates how to migrate Doctor-Dok components to Bootstrap equivalents
 * while maintaining API compatibility and improving functionality.
 */

import React from 'react';
import { Button as BootstrapButton, Spinner } from 'react-bootstrap';

// Original Doctor-Dok Button interface (for reference)
interface OriginalButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'lg';
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

// Enhanced Bootstrap Button with Doctor-Dok compatibility
interface MigratedButtonProps extends OriginalButtonProps {
  loading?: boolean; // New feature: loading state
  icon?: React.ReactNode; // New feature: icon support
}

/**
 * MIGRATION PATTERN EXAMPLE
 * 
 * 1. Keep original API intact for compatibility
 * 2. Map variants to Bootstrap equivalents  
 * 3. Add new features that Bootstrap enables
 * 4. Use Bootstrap classes while maintaining behavior
 */
const ButtonExample = React.forwardRef<HTMLButtonElement, MigratedButtonProps>(
  ({ 
    variant = 'default', 
    size, 
    loading, 
    disabled,
    icon,
    children, 
    className = '',
    ...props 
  }, ref) => {
    
    // MAPPING PATTERN: Doctor-Dok variants → Bootstrap variants
    const mapVariant = (variant: string) => {
      const variantMap = {
        'default': 'primary',
        'destructive': 'danger',
        'outline': 'outline-primary',
        'secondary': 'secondary',
        'ghost': 'outline-light',
        'link': 'link'
      };
      return variantMap[variant] || 'primary';
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
        {/* NEW FEATURE: Loading spinner */}
        {loading && (
          <Spinner
            as="span"
            animation="border"
            size="sm"
            className="me-2"
            aria-hidden="true"
          />
        )}
        
        {/* NEW FEATURE: Icon support */}
        {icon && !loading && (
          <span className="me-2">{icon}</span>
        )}
        
        {children}
      </BootstrapButton>
    );
  }
);

ButtonExample.displayName = 'ButtonExample';

export default ButtonExample;

/**
 * USAGE EXAMPLES:
 * 
 * // Original Doctor-Dok usage (still works)
 * <Button variant="destructive">Delete</Button>
 * 
 * // Enhanced with new features
 * <Button variant="destructive" loading>Deleting...</Button>
 * <Button variant="default" icon={<PlusIcon />}>Add Item</Button>
 * 
 * TESTING CHECKLIST:
 * - [ ] All original variants work
 * - [ ] All original sizes work  
 * - [ ] All original props are respected
 * - [ ] New features work correctly
 * - [ ] Bootstrap styling applied
 * - [ ] Accessibility maintained
 * - [ ] Performance is equal or better
 */