/**
 * Phase 3a Priority 1: Card Component Migration
 * 
 * Direct mapping from Doctor-Dok ui/card.tsx to Bootstrap Card
 * Following MIGRATION_PLAN.md Phase 3a requirements
 */

import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';
import type { CardProps as BootstrapCardProps } from 'react-bootstrap';

// Mirror Doctor-Dok's card API structure
export interface CardProps extends BootstrapCardProps {
  // Doctor-Dok card API compatibility
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <BootstrapCard
        className={className}
        ref={ref as any}
        {...props}
      >
        {children}
      </BootstrapCard>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <BootstrapCard.Header
        className={className}
        ref={ref}
        {...props}
      >
        {children}
      </BootstrapCard.Header>
    );
  }
);

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <BootstrapCard.Body
        className={className}
        ref={ref}
        {...props}
      >
        {children}
      </BootstrapCard.Body>
    );
  }
);

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <BootstrapCard.Text
        className={`text-muted ${className || ''}`}
        ref={ref as any}
        {...props}
      >
        {children}
      </BootstrapCard.Text>
    );
  }
);

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <BootstrapCard.Title
        className={className}
        ref={ref as any}
        {...props}
      >
        {children}
      </BootstrapCard.Title>
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <BootstrapCard.Footer
        className={className}
        ref={ref}
        {...props}
      >
        {children}
      </BootstrapCard.Footer>
    );
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardDescription.displayName = 'CardDescription';
CardTitle.displayName = 'CardTitle';
CardFooter.displayName = 'CardFooter';

export { 
  Card, 
  CardHeader, 
  CardContent, 
  CardDescription, 
  CardTitle, 
  CardFooter 
};