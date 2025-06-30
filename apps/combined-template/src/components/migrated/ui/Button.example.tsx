/**
 * Example migration: Button component
 * From: Doctor-Dok shadcn/ui button with Tailwind
 * To: React Bootstrap Button
 */

import React from 'react';
import { Button as BSButton, ButtonProps as BSButtonProps } from 'react-bootstrap';
import { type VariantProps } from 'class-variance-authority';

// Original Doctor-Dok button variants mapping
const variantMapping = {
  default: 'primary',
  destructive: 'danger',
  outline: 'outline-primary',
  secondary: 'secondary',
  ghost: 'link',
  link: 'link'
} as const;

const sizeMapping = {
  default: undefined,
  sm: 'sm',
  lg: 'lg',
  icon: 'sm' // Special handling needed
} as const;

// Interface matching original Doctor-Dok button props
interface ButtonProps extends 
  Omit<BSButtonProps, 'variant' | 'size'>,
  VariantProps<typeof buttonVariants> {
  variant?: keyof typeof variantMapping;
  size?: keyof typeof sizeMapping;
}

// Dummy buttonVariants for type compatibility
const buttonVariants = {} as any;

/**
 * Migrated Button component maintaining Doctor-Dok API
 * while using Bootstrap 5 under the hood
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    // Map Doctor-Dok variants to Bootstrap variants
    const bsVariant = variantMapping[variant];
    const bsSize = sizeMapping[size];
    
    // Handle icon-only button case
    const isIconButton = size === 'icon';
    const iconClasses = isIconButton ? 'd-inline-flex align-items-center justify-content-center p-2' : '';
    
    return (
      <BSButton
        ref={ref}
        variant={bsVariant}
        size={bsSize as BSButtonProps['size']}
        className={`${iconClasses} ${className || ''}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

/* 
Migration Notes:
1. Maintains same API as Doctor-Dok button
2. Maps Tailwind variants to Bootstrap variants
3. Preserves forwardRef functionality
4. Icon button requires custom classes for proper sizing

Usage remains the same:
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="default">Save</Button>
*/