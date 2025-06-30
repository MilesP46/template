/**
 * T303_phase3_cp1: Migrated AuthorizePopup Component
 * 
 * Converted from Doctor-Dok's full-screen authorize-popup.tsx to Bootstrap Modal
 * Following MIGRATION_PLAN.md critical path step 6 - Convert Dialog to Modal API
 * Uses migrated AuthorizeDatabaseForm and Bootstrap components
 */

import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Tab, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '@doctor-dok/shared-auth-react';
import AuthorizeDatabaseForm from '../../forms/AuthorizeDatabaseForm';

interface AuthorizePopupProps {
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  autoLoginInProgress?: boolean;
  appName?: string;
  logoSrc?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

const AuthorizePopup: React.FC<AuthorizePopupProps> = ({
  show,
  onHide,
  onSuccess,
  onError,
  autoLoginInProgress = false,
  appName = 'Combined Template',
  logoSrc,
  termsUrl = '/content/terms',
  privacyUrl = '/content/privacy'
}) => {
  const { authMode } = useAuth();
  const [activeTab, setActiveTab] = useState('authorize');
  const [applicationLoaded, setApplicationLoaded] = useState(false);

  useEffect(() => {
    setApplicationLoaded(true);
  }, []);

  const handleAuthSuccess = () => {
    onSuccess?.();
    onHide();
  };

  const handleAuthError = (error: string) => {
    onError?.(error);
  };

  // Show loading spinner during auto-login
  if (!applicationLoaded || autoLoginInProgress) {
    return (
      <Modal 
        show={show} 
        onHide={onHide}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Body className="text-center py-5">
          <div className="mb-4">
            {logoSrc && (
              <img 
                src={logoSrc} 
                alt={`${appName} logo`}
                className="mb-3"
                style={{ height: '80px' }}
              />
            )}
          </div>
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted mb-0">
            {autoLoginInProgress ? 'Restoring session...' : 'Loading...'}
          </p>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          {logoSrc && (
            <img 
              src={logoSrc} 
              alt={`${appName} logo`}
              className="me-3"
              style={{ height: '32px' }}
            />
          )}
          {appName} - Database Access
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Auth mode indicator for single-tenant */}
        {authMode === 'single-tenant' && (
          <Alert variant="info" className="mb-3">
            <small>
              <strong>Single Tenant Mode:</strong> Each user has their own encrypted database.
            </small>
          </Alert>
        )}

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'authorize')}
          className="mb-3"
        >
          <Tab eventKey="authorize" title="Open Database">
            <Card className="border-0">
              <Card.Body className="px-0">
                <Card.Text className="text-muted mb-4">
                  Open Database by <strong>Database ID</strong> and <strong>Master Key</strong>
                </Card.Text>
                
                <AuthorizeDatabaseForm
                  onSuccess={handleAuthSuccess}
                  onError={handleAuthError}
                  termsUrl={termsUrl}
                  privacyUrl={privacyUrl}
                />
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="create" title="Create Database" disabled>
            <Card className="border-0">
              <Card.Body className="px-0">
                <Alert variant="warning">
                  <strong>Feature Not Available:</strong> Database creation will be implemented in T305 parallel track.
                </Alert>
                <Card.Text className="text-muted">
                  Create New Encrypted Database. <strong>Please store your Database ID and Key</strong> in a safe place as it <strong>will not be recoverable</strong>.
                </Card.Text>
                
                {/* TODO: T305 - Implement CreateDatabaseForm migration */}
                <div className="text-center py-4">
                  <p className="text-muted">CreateDatabaseForm component pending migration...</p>
                </div>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        {/* Terms and Privacy Notice */}
        <div className="mt-4 pt-3 border-top">
          <small className="text-muted">
            By using this application, you agree to our{' '}
            <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
              Privacy Policy
            </a>.
          </small>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AuthorizePopup;

/**
 * MIGRATION NOTES:
 * 
 * ✅ Converted from full-screen component to Bootstrap Modal
 * ✅ Maintains tab-based interface using Bootstrap Tabs
 * ✅ Integrates with migrated AuthorizeDatabaseForm component
 * ✅ Uses Bootstrap Alert, Card, and Modal components
 * ✅ Preserves original functionality (auth modes, loading states)
 * ✅ Follows modal API pattern: show/onHide props
 * 
 * ⚠️ CreateDatabaseForm integration deferred to T305 parallel track
 * ⚠️ SaaS context and quota logic simplified for template use
 * 
 * TESTING REQUIREMENTS:
 * - [ ] Modal opens and closes correctly
 * - [ ] Tab switching works
 * - [ ] Auth form integration functional
 * - [ ] Loading states display properly
 * - [ ] Responsive design maintained
 * - [ ] Keyboard navigation accessible
 */