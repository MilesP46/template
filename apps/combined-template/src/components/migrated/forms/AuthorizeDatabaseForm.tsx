/**
 * T303_phase3_cp1: Migrated AuthorizeDatabaseForm Component
 * 
 * Converted from Doctor-Dok's authorize-database-form.tsx
 * Uses Rasket's form components with Bootstrap styling while maintaining react-hook-form integration
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Card, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '@doctor-dok/shared-auth-react';

// Import our migrated UI components
import { Button, Input, Label, Checkbox } from '../ui';

interface AuthorizeDatabaseFormData {
  databaseId: string;
  key: string;
  keepLoggedIn: boolean;
}

interface AuthorizeDatabaseFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  termsUrl?: string;
  privacyUrl?: string;
}

const AuthorizeDatabaseForm: React.FC<AuthorizeDatabaseFormProps> = ({
  onSuccess,
  onError,
  termsUrl = '/content/terms',
  privacyUrl = '/content/privacy'
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthorizeDatabaseFormData>();
  const { login, isLoading } = useAuth();
  
  const [keepLoggedIn, setKeepLoggedIn] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('keepLoggedIn') === 'true';
    }
    return false;
  });
  
  const [operationResult, setOperationResult] = useState<{ success: boolean; message: string } | null>(null);

  // Save keep logged in preference to localStorage
  useEffect(() => {
    localStorage.setItem('keepLoggedIn', keepLoggedIn.toString());
  }, [keepLoggedIn]);

  const handleAuthorizeDatabase = async (data: AuthorizeDatabaseFormData) => {
    try {
      setOperationResult(null);
      
      const result = await login({
        email: data.databaseId,
        password: data.key,
        rememberMe: data.keepLoggedIn
      });

      if (result.success) {
        setOperationResult({ success: true, message: 'Database authorized successfully!' });
        onSuccess?.();
      } else {
        const errorMessage = result.error || 'Authorization failed';
        setOperationResult({ success: false, message: errorMessage });
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setOperationResult({ success: false, message: errorMessage });
      onError?.(errorMessage);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <Card.Title className="mb-0">Authorize Database Access</Card.Title>
      </Card.Header>
      
      <Card.Body>
        <Form onSubmit={handleSubmit(handleAuthorizeDatabase)}>
          {/* Operation Result Alert */}
          {operationResult && (
            <Alert 
              variant={operationResult.success ? 'success' : 'danger'}
              className="mb-3"
            >
              {operationResult.message}
            </Alert>
          )}

          {/* Database ID Field */}
          <Form.Group className="mb-3">
            <Label htmlFor="databaseId">Database ID</Label>
            <Input
              id="databaseId"
              type="text"
              placeholder="Enter your database identifier"
              {...register('databaseId', {
                required: 'Database ID is required',
                minLength: {
                  value: 3,
                  message: 'Database ID must be at least 3 characters'
                }
              })}
              className={errors.databaseId ? 'is-invalid' : ''}
            />
            {errors.databaseId && (
              <Form.Control.Feedback type="invalid">
                {errors.databaseId.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {/* Master Key Field */}
          <Form.Group className="mb-3">
            <Label htmlFor="key">Master Key</Label>
            <Input
              id="key"
              type="password"
              placeholder="Enter your master key"
              {...register('key', {
                required: 'Master key is required',
                minLength: {
                  value: 6,
                  message: 'Master key must be at least 6 characters'
                }
              })}
              className={errors.key ? 'is-invalid' : ''}
            />
            {errors.key && (
              <Form.Control.Feedback type="invalid">
                {errors.key.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {/* Keep Logged In Checkbox */}
          <Form.Group className="mb-3">
            <Checkbox
              id="keepLoggedIn"
              checked={keepLoggedIn}
              onCheckedChange={setKeepLoggedIn}
              {...register('keepLoggedIn')}
            />
            <Label htmlFor="keepLoggedIn" className="ms-2">
              Keep me logged in
            </Label>
            <Form.Text className="text-muted d-block">
              This will remember your login session for faster access
            </Form.Text>
          </Form.Group>

          {/* Terms and Privacy Notice */}
          <div className="mb-3">
            <Form.Text className="text-muted small">
              By continuing, you agree to our{' '}
              <Link to={termsUrl} className="text-decoration-none">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to={privacyUrl} className="text-decoration-none">
                Privacy Policy
              </Link>
            </Form.Text>
          </div>

          {/* Submit Button */}
          <div className="d-grid">
            <Button 
              variant="default"
              type="submit" 
              disabled={isSubmitting || isLoading}
              size="lg"
              loading={isSubmitting || isLoading}
            >
              Authorize Database
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AuthorizeDatabaseForm;