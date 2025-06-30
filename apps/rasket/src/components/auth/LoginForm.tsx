/**
 * Login Form Component
 * Updated to use the new unified auth system
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useLogin } from '@doctor-dok/shared-auth-react';
import PasswordInput from '@/components/PasswordInput';

// Validation schema
const loginSchema = yup.object({
  databaseId: yup.string().required('Database ID is required'),
  password: yup.string().required('Password is required'),
  rememberMe: yup.boolean(),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login({
      databaseId: data.databaseId,
      password: data.password,
      keepLoggedIn: data.rememberMe,
    });

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert variant="danger" dismissible onClose={clearError}>
          {error.message}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Database ID</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter your database ID"
          {...register('databaseId')}
          isInvalid={!!errors.databaseId}
          disabled={isLoading}
        />
        <Form.Control.Feedback type="invalid">
          {errors.databaseId?.message}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Your unique database identifier
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <PasswordInput
          name="password"
          placeholder="Enter your password"
          register={register}
          errors={errors}
          show={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          disabled={isLoading}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label="Keep me logged in"
          {...register('rememberMe')}
          disabled={isLoading}
        />
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
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="mb-0">
          Don't have an account?{' '}
          <Link to="/auth/sign-up" className="text-primary">
            Sign Up
          </Link>
        </p>
        <Link to="/auth/forgot-password" className="text-muted small">
          Forgot password?
        </Link>
      </div>
    </Form>
  );
}