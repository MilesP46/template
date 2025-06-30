'use client';

import React, { forwardRef } from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { cn } from '../../../utils/cn';

// Custom button variants that extend Bootstrap
type CustomVariant = 'default' | 'destructive' | 'ghost';
type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info' | 'outline-light' | 'outline-dark';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | CustomVariant;
  size?: 'sm' | 'lg';
  active?: boolean;
  disabled?: boolean;
  href?: string;
  asChild?: boolean;
}

// Map Doctor-Dok variants to Bootstrap variants
const variantMap: Record<CustomVariant, ButtonVariant> = {
  default: 'primary',
  destructive: 'danger',
  ghost: 'light',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size, active, disabled, href, children, asChild, ...props }, ref) => {
    const { effectiveTheme } = useThemeContext();
    
    // Map custom variants to Bootstrap variants
    const mappedVariant = (variantMap[variant as CustomVariant] || variant) as ButtonVariant;
    
    // Add theme-specific classes
    const themeClasses = {
      ghost: effectiveTheme === 'dark' 
        ? 'btn-ghost-dark' 
        : 'btn-ghost-light',
    };
    
    return (
      <BootstrapButton
        ref={ref}
        variant={mappedVariant}
        size={size}
        active={active}
        disabled={disabled}
        href={href}
        className={cn(
          variant === 'ghost' && themeClasses.ghost,
          className
        )}
        {...props}
      >
        {children}
      </BootstrapButton>
    );
  }
);

Button.displayName = 'Button';

// Export variant styles for custom styling
export const buttonVariants = {
  base: 'btn transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none',
  variants: {
    variant: {
      default: 'btn-primary',
      destructive: 'btn-danger',
      outline: 'btn-outline-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      link: 'btn-link text-primary underline-offset-4 hover:underline',
    },
    size: {
      default: '',
      sm: 'btn-sm',
      lg: 'btn-lg',
      icon: 'btn-icon',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
};

// Export theme-aware button styles
export const useButtonStyles = () => {
  const { effectiveTheme } = useThemeContext();
  
  return {
    primary: effectiveTheme === 'dark' 
      ? 'bg-primary-dark hover:bg-primary-dark-hover' 
      : 'bg-primary hover:bg-primary-hover',
    secondary: effectiveTheme === 'dark'
      ? 'bg-secondary-dark hover:bg-secondary-dark-hover'
      : 'bg-secondary hover:bg-secondary-hover',
    ghost: effectiveTheme === 'dark'
      ? 'hover:bg-gray-800 hover:text-gray-100'
      : 'hover:bg-gray-100 hover:text-gray-900',
  };
};