/**
 * T302_phase3_cp1: Migrated TopNavigationBar Component
 * 
 * Complex navigation header migrated from Doctor-Dok's top-header.tsx
 * Integrates with Rasket's TopNavigationBar structure and Bootstrap components
 * Maintains Doctor-Dok's functionality while using Bootstrap styling
 */

import React, { useState } from 'react';
import { 
  Navbar, 
  Container, 
  Nav, 
  NavDropdown, 
  Button, 
  Offcanvas,
  Form,
  InputGroup
} from 'react-bootstrap';
import { 
  Menu, 
  Search, 
  Settings, 
  LogOut, 
  User, 
  Key, 
  Users,
  Moon,
  Sun,
  Maximize,
  Bell
} from 'lucide-react';
import { useAuth } from '@doctor-dok/shared-auth-react';
import { useThemeContext } from '../../../providers/ThemeProvider';

interface TopNavigationBarProps {
  logoSrc?: string;
  appName?: string;
  onMenuToggle?: () => void;
  showSidebar?: boolean;
}

const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  logoSrc,
  appName = 'Combined Template',
  onMenuToggle,
  showSidebar = true
}) => {
  const { user, logout, authMode } = useAuth();
  const { effectiveTheme, toggleTheme } = useThemeContext();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <>
      <Navbar 
        expand="lg" 
        className={`topbar border-bottom ${effectiveTheme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-white'} shadow-sm`}
        style={{ zIndex: 1020 }}
      >
        <Container fluid>
          {/* Left side - Menu toggle and brand */}
          <div className="d-flex align-items-center">
            {showSidebar && onMenuToggle && (
              <Button 
                variant="link"
                className="text-reset border-0 p-2 me-2"
                onClick={onMenuToggle}
                aria-label="Toggle sidebar"
              >
                <Menu size={20} />
              </Button>
            )}
            
            <Navbar.Brand href="/" className="d-flex align-items-center text-decoration-none">
              {logoSrc && (
                <img 
                  src={logoSrc} 
                  alt={`${appName} logo`}
                  height="32"
                  className="me-2"
                />
              )}
              <span className="fw-semibold text-dark fs-5">{appName}</span>
            </Navbar.Brand>
          </div>

          {/* Center - Search */}
          <div className="d-none d-md-flex flex-grow-1 justify-content-center mx-4">
            <div style={{ maxWidth: '400px', width: '100%' }}>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <Search size={16} />
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </div>
          </div>

          {/* Right side - Controls and user menu */}
          <Nav className="align-items-center">
            {/* Mobile search toggle */}
            <Button 
              variant="link"
              className="d-md-none text-reset border-0 p-2"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search size={18} />
            </Button>

            {/* Theme toggle */}
            <Button 
              variant="link"
              className="text-reset border-0 p-2"
              onClick={toggleTheme}
              title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {effectiveTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            {/* Fullscreen toggle */}
            <Button 
              variant="link"
              className="text-reset border-0 p-2"
              onClick={toggleFullscreen}
              title="Toggle fullscreen"
            >
              <Maximize size={18} />
            </Button>

            {/* Notifications */}
            <Button 
              variant="link"
              className="text-reset border-0 p-2 position-relative"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6em' }}>
                3
              </span>
            </Button>

            {/* Auth mode indicator */}
            {authMode && (
              <span className="badge bg-secondary text-light me-2 d-none d-lg-inline">
                {authMode === 'single-tenant' ? 'Single Tenant' : 'Multi Tenant'}
              </span>
            )}

            {/* User menu */}
            <NavDropdown
              title={
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <User size={16} />
                  </div>
                </div>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Header>
                <small className="text-muted">Welcome,</small>
                <br />
                <strong>{user?.email || 'User'}</strong>
              </NavDropdown.Header>

              <NavDropdown.Divider />

              <NavDropdown.Item href="/profile">
                <User size={16} className="me-2" />
                Profile
              </NavDropdown.Item>

              <NavDropdown.Item href="/settings">
                <Settings size={16} className="me-2" />
                Settings
              </NavDropdown.Item>

              {authMode === 'single-tenant' && (
                <NavDropdown.Item href="/change-key">
                  <Key size={16} className="me-2" />
                  Change Master Key
                </NavDropdown.Item>
              )}

              {authMode === 'multi-tenant' && (
                <NavDropdown.Item href="/shared-keys">
                  <Users size={16} className="me-2" />
                  Shared Access
                </NavDropdown.Item>
              )}

              <NavDropdown.Divider />

              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <LogOut size={16} className="me-2" />
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>

      {/* Mobile search offcanvas */}
      <Offcanvas 
        show={showSearch} 
        onHide={() => setShowSearch(false)}
        placement="top"
        className="d-md-none"
        style={{ height: 'auto' }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Search</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <InputGroup>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </InputGroup>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default TopNavigationBar;