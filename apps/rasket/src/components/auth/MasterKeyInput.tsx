/**
 * Master Key Input Component
 * Specialized input for master key with strength indicator and security tips
 */

import { useState, useMemo } from 'react';
import { Form, InputGroup, Button, ProgressBar, Alert } from 'react-bootstrap';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

interface MasterKeyInputProps {
  name: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  helpText?: string;
  showStrengthIndicator?: boolean;
  showSecurityTips?: boolean;
  required?: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  variant: 'danger' | 'warning' | 'info' | 'success';
}

export default function MasterKeyInput({
  name,
  register,
  errors,
  disabled = false,
  placeholder = 'Enter master key',
  label = 'Master Key',
  helpText,
  showStrengthIndicator = true,
  showSecurityTips = true,
  required = true,
}: MasterKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [keyValue, setKeyValue] = useState('');
  const [showTips, setShowTips] = useState(false);

  // Calculate password strength
  const strength = useMemo<PasswordStrength>(() => {
    if (!keyValue) return { score: 0, label: 'Enter a key', variant: 'danger' };

    let score = 0;
    
    // Length check
    if (keyValue.length >= 8) score++;
    if (keyValue.length >= 12) score++;
    if (keyValue.length >= 16) score++;
    
    // Character variety
    if (/[a-z]/.test(keyValue)) score++;
    if (/[A-Z]/.test(keyValue)) score++;
    if (/[0-9]/.test(keyValue)) score++;
    if (/[^a-zA-Z0-9]/.test(keyValue)) score++;
    
    // No common patterns
    if (!/(.)\1{2,}/.test(keyValue)) score++; // No repeated characters
    if (!/123|abc|password|master/i.test(keyValue)) score++; // No common patterns

    const totalScore = Math.min(Math.floor((score / 9) * 4), 4);
    
    const labels: Record<number, { label: string; variant: PasswordStrength['variant'] }> = {
      0: { label: 'Very Weak', variant: 'danger' },
      1: { label: 'Weak', variant: 'danger' },
      2: { label: 'Fair', variant: 'warning' },
      3: { label: 'Good', variant: 'info' },
      4: { label: 'Strong', variant: 'success' },
    };

    return {
      score: totalScore,
      ...labels[totalScore],
    };
  }, [keyValue]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyValue(e.target.value);
  };

  const generateSecureKey = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const length = 24;
    let key = '';
    
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      key += charset[array[i] % charset.length];
    }
    
    setKeyValue(key);
    // Trigger form update
    const input = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = key;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <Form.Label>
          {label}
          {required && <span className="text-danger"> *</span>}
        </Form.Label>
        {showSecurityTips && (
          <Button
            variant="link"
            size="sm"
            className="p-0 text-decoration-none"
            onClick={() => setShowTips(!showTips)}
          >
            <i className={`ri-${showTips ? 'close' : 'information'}-line`}></i>
            {showTips ? ' Hide' : ' Security'} Tips
          </Button>
        )}
      </div>

      <InputGroup className="mb-2">
        <Form.Control
          type={showKey ? 'text' : 'password'}
          placeholder={placeholder}
          {...register(name, { onChange: handleKeyChange })}
          isInvalid={!!errors[name]}
          disabled={disabled}
        />
        <Button
          variant="outline-secondary"
          onClick={() => setShowKey(!showKey)}
          disabled={disabled}
        >
          <i className={`ri-eye${showKey ? '-off' : ''}-line`}></i>
        </Button>
        <Button
          variant="outline-primary"
          onClick={generateSecureKey}
          disabled={disabled}
          title="Generate secure key"
        >
          <i className="ri-refresh-line"></i>
        </Button>
      </InputGroup>

      {errors[name] && (
        <Form.Control.Feedback type="invalid" className="d-block">
          {errors[name]?.message}
        </Form.Control.Feedback>
      )}

      {showStrengthIndicator && keyValue && (
        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted">Strength:</small>
            <small className={`text-${strength.variant}`}>{strength.label}</small>
          </div>
          <ProgressBar
            now={(strength.score / 4) * 100}
            variant={strength.variant}
            style={{ height: '4px' }}
          />
        </div>
      )}

      {helpText && (
        <Form.Text className="text-muted">
          {helpText}
        </Form.Text>
      )}

      {showTips && (
        <Alert variant="info" className="mt-2 small">
          <h6 className="alert-heading">Master Key Security Tips:</h6>
          <ul className="mb-0 ps-3">
            <li>Use at least 16 characters for maximum security</li>
            <li>Include uppercase, lowercase, numbers, and symbols</li>
            <li>Avoid dictionary words and personal information</li>
            <li>Store it in a password manager or secure location</li>
            <li className="text-danger fw-bold">This key cannot be recovered if lost!</li>
          </ul>
          <div className="mt-2">
            <strong>Recommended Storage:</strong>
            <ul className="mb-0 ps-3">
              <li>Password manager (1Password, Bitwarden, etc.)</li>
              <li>Encrypted file in secure cloud storage</li>
              <li>Physical secure location (safety deposit box)</li>
            </ul>
          </div>
        </Alert>
      )}
    </div>
  );
}