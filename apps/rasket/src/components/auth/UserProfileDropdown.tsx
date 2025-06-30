/**
 * User Profile Dropdown Component
 * Shows authenticated user info with dropdown menu
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, Image } from 'react-bootstrap';
import { useCurrentUser, useLogout } from '@doctor-dok/shared-auth-react';

interface UserProfileDropdownProps {
  className?: string;
}

export default function UserProfileDropdown({ className = '' }: UserProfileDropdownProps) {
  const { user } = useCurrentUser();
  const { logout, isLoading } = useLogout();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/sign-in';
  };

  // Generate avatar from username
  const getAvatarText = () => {
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <Dropdown className={className}>
      <Dropdown.Toggle
        as="a"
        className="arrow-none nav-link dropdown-toggle d-flex align-items-center"
        role="button"
      >
        <div className="d-none d-lg-block me-2">
          <div className="user-name">{user.username || user.email}</div>
          <span className="user-sub-title text-muted small">
            {user.role || 'User'}
          </span>
        </div>
        <div className="avatar-sm">
          <div className="avatar-title bg-primary text-white rounded-circle">
            {getAvatarText()}
          </div>
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu align="end">
        <h6 className="dropdown-header">Welcome {user.username || 'User'}!</h6>
        
        <Link to="/profile" className="dropdown-item">
          <i className="ri-account-circle-line text-muted me-2"></i>
          My Account
        </Link>
        
        <Link to="/settings" className="dropdown-item">
          <i className="ri-settings-3-line text-muted me-2"></i>
          Settings
        </Link>

        <div className="dropdown-divider"></div>

        <Link to="/help" className="dropdown-item">
          <i className="ri-question-line text-muted me-2"></i>
          Help & Support
        </Link>

        <div className="dropdown-divider"></div>

        <button
          className="dropdown-item text-danger"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <i className="ri-logout-box-r-line text-danger me-2"></i>
          {isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </Dropdown.Menu>
    </Dropdown>
  );
}