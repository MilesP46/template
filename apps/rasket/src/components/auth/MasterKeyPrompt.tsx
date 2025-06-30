/**
 * Master Key Prompt Component
 * Modal dialog for entering master key when accessing encrypted data
 */

import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MasterKeyInput from './MasterKeyInput';

const masterKeySchema = yup.object({
  masterKey: yup.string().required('Master key is required to decrypt your data'),
});

type MasterKeyFormData = yup.InferType<typeof masterKeySchema>;

interface MasterKeyPromptProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (masterKey: string) => Promise<void>;
  title?: string;
  message?: string;
  databaseId?: string;
}

export default function MasterKeyPrompt({
  show,
  onClose,
  onSubmit,
  title = 'Master Key Required',
  message = 'Please enter your master key to decrypt your database.',
  databaseId,
}: MasterKeyPromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MasterKeyFormData>({
    resolver: yupResolver(masterKeySchema),
  });

  const handleFormSubmit = async (data: MasterKeyFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(data.masterKey);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid master key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setError(null);
      onClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="ri-key-2-line me-2 text-primary"></i>
          {title}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(handleFormSubmit)}>
        <Modal.Body>
          <p className="text-muted">{message}</p>

          {databaseId && (
            <Alert variant="info" className="small">
              <strong>Database:</strong> {databaseId}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <i className="ri-error-warning-line me-2"></i>
              {error}
            </Alert>
          )}

          <MasterKeyInput
            name="masterKey"
            register={register}
            errors={errors}
            disabled={isLoading}
            placeholder="Enter your master key"
            showStrengthIndicator={false}
            showSecurityTips={false}
            helpText="This is the key you created when setting up your encrypted database."
          />

          <Alert variant="warning" className="small mt-3 mb-0">
            <i className="ri-information-line me-1"></i>
            <strong>Remember:</strong> Your master key is never stored on our servers. 
            If you've lost it, your encrypted data cannot be recovered.
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
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
                Decrypting...
              </>
            ) : (
              <>
                <i className="ri-lock-unlock-line me-2"></i>
                Decrypt
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}