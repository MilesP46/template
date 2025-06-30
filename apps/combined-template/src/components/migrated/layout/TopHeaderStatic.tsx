/**
 * T302_phase3_cp1: Migrated TopHeaderStatic Component
 * 
 * Simplified static header migrated from Doctor-Dok's top-header-static.tsx
 * Using Bootstrap classes instead of Tailwind, integrating with Rasket patterns
 */

import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface TopHeaderStaticProps {
  logoSrc?: string;
  appName?: string;
  showBackLink?: boolean;
  backLinkText?: string;
  backLinkTo?: string;
  theme?: 'light' | 'dark';
}

const TopHeaderStatic: React.FC<TopHeaderStaticProps> = ({
  logoSrc,
  appName = 'Combined Template',
  showBackLink = true,
  backLinkText = 'Go back to app',
  backLinkTo = '/',
  theme = 'light'
}) => {
  // Determine logo source based on theme (mimicking Doctor-Dok pattern)
  const defaultLogoSrc = theme === 'dark' 
    ? '/img/combined-template-logo-white.svg' 
    : '/img/combined-template-logo.svg';
  
  const finalLogoSrc = logoSrc || defaultLogoSrc;

  return (
    <Navbar 
      expand="lg" 
      className={`border-bottom ${theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}
      style={{ zIndex: 1000 }}
    >
      <Container fluid>
        {/* Brand section */}
        <Navbar.Brand className="d-flex align-items-center">
          <img 
            src={finalLogoSrc}
            alt={`${appName} logo`}
            width="56"
            height="56"
            className="me-3"
          />
          <div className="d-flex flex-column">
            <span className="fw-medium fs-5">{appName}</span>
            {showBackLink && (
              <Link 
                to={backLinkTo}
                className="text-decoration-underline small text-primary"
              >
                {backLinkText}
              </Link>
            )}
          </div>
        </Navbar.Brand>

        {/* Right side actions (empty for static header, can be extended) */}
        <Nav className="ms-auto">
          {/* Future: Add static action buttons here if needed */}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default TopHeaderStatic;