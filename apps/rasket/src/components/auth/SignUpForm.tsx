/**
 * Sign Up Form Component
 * Updated to use the new unified auth system
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useRegister, useAuthMode } from '@doctor-dok/shared-auth-react';
import { InputSanitizer } from '@doctor-dok/shared-auth';
import PasswordInput from '@/components/PasswordInput';
import MasterKeyInput from './MasterKeyInput';

// Validation schema
const signUpSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  masterKey: yup.string().when('$requiresMasterKey', {
    is: true,
    then: (schema) => schema.required('Master key is required for encrypted database'),
    otherwise: (schema) => schema.notRequired(),
  }),
  agreeTerms: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

type SignUpFormData = yup.InferType<typeof signUpSchema>;

export default function SignUpForm() {
  const navigate = useNavigate();
  const { register: signUp, isLoading, error, clearError } = useRegister();
  const { authMode, requiresMasterKey } = useAuthMode();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    context: { requiresMasterKey },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      // Sanitize inputs to prevent XSS attacks (T215_phase2.6_cp1)
      const sanitizedData = InputSanitizer.sanitizeRegistrationData({
        email: data.email,
        password: data.password,
        masterKey: data.masterKey,
      });

      const result = await signUp({
        email: sanitizedData.email,
        username: data.username ? InputSanitizer.sanitizeForDatabase(data.username, 50) : undefined,
        password: sanitizedData.password,
        masterKey: sanitizedData.masterKey,
      });

      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      // Input sanitization errors will be caught here
      console.error('Registration form validation error:', error);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert variant="danger" dismissible onClose={clearError}>
          {error.message}
        </Alert>
      )}

      {authMode === 'single-tenant' && (
        <Alert variant="info" className="mb-3">
          <Alert.Heading className="h6">Single-Tenant Mode</Alert.Heading>
          <p className="mb-0 small">
            You'll get your own encrypted database. Please save your master key securely!
          </p>
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter your email"
          {...register('email')}
          isInvalid={!!errors.email}
          disabled={isLoading}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Choose a username"
          {...register('username')}
          isInvalid={!!errors.username}
          disabled={isLoading}
        />
        <Form.Control.Feedback type="invalid">
          {errors.username?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <PasswordInput
          name="password"
          placeholder="Create a password"
          register={register}
          errors={errors}
          show={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          disabled={isLoading}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Confirm Password</Form.Label>
        <PasswordInput
          name="confirmPassword"
          placeholder="Confirm your password"
          register={register}
          errors={errors}
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          disabled={isLoading}
        />
      </Form.Group>

      {requiresMasterKey && (
        <MasterKeyInput
          name="masterKey"
          register={register}
          errors={errors}
          disabled={isLoading}
          placeholder="Create a secure master key"
          helpText="This key encrypts your entire database. Choose a strong key and store it safely!"
          showStrengthIndicator={true}
          showSecurityTips={true}
        />
      )}

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label={
            <>
              I agree to the{' '}
              <Link to="/terms" target="_blank">
                Terms and Conditions
              </Link>
            </>
          }
          {...register('agreeTerms')}
          isInvalid={!!errors.agreeTerms}
          disabled={isLoading}
        />
        <Form.Control.Feedback type="invalid">
          {errors.agreeTerms?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-grid mb-3">
        <Button
          variant="primary"
          type="submit"
          disabled={isLoading}
          className="btn-lg"
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
              Creating account...
            </>
          ) : (
            'Sign Up'
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="mb-0">
          Already have an account?{' '}
          <Link to="/auth/sign-in" className="text-primary">
            Sign In
          </Link>
        </p>
      </div>
    </Form>
  );
}