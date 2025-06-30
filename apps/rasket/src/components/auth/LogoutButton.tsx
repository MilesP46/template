/**
 * Logout Button Component
 * Handles user logout with loading state
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner } from 'react-bootstrap';
import { useLogout } from '@doctor-dok/shared-auth-react';

interface LogoutButtonProps {
  variant?: string;
  size?: 'sm' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export default function LogoutButton({
  variant = 'outline-danger',
  size,
  className = '',
  showIcon = true,
}: LogoutButtonProps) {
  const navigate = useNavigate();
  const { logout, isLoading } = useLogout();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/sign-in');
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          Logging out...
        </>
      ) : (
        <>
          {showIcon && <i className="ri-logout-box-line me-2"></i>}
          Logout
        </>
      )}
    </Button>
  );
}