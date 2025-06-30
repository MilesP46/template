/**
 * Master Key Display Component
 * Shows master key after account creation with copy and download options
 */

import React, { useState } from 'react';
import { Alert, Button, Card, InputGroup, Form } from 'react-bootstrap';

interface MasterKeyDisplayProps {
  masterKey: string;
  databaseId: string;
  onContinue: () => void;
  className?: string;
}

export default function MasterKeyDisplay({
  masterKey,
  databaseId,
  onContinue,
  className = '',
}: MasterKeyDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(masterKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const content = `Doctor-Dok Master Key Backup
================================
Created: ${new Date().toISOString()}
Database ID: ${databaseId}
Master Key: ${masterKey}

IMPORTANT SECURITY INFORMATION:
- This key encrypts all your data
- Store it in a secure location
- Never share it with anyone
- It cannot be recovered if lost

Recommended storage:
- Password manager
- Encrypted file
- Physical secure location
================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master-key-${databaseId}-backup.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={`border-warning ${className}`}>
      <Card.Header className="bg-warning text-dark">
        <h5 className="mb-0">
          <i className="ri-key-2-line me-2"></i>
          Save Your Master Key
        </h5>
      </Card.Header>
      <Card.Body>
        <Alert variant="danger" className="mb-3">
          <i className="ri-error-warning-line me-2"></i>
          <strong>Critical:</strong> This is the only time you'll see your master key. 
          It cannot be recovered if lost!
        </Alert>

        <div className="mb-3">
          <label className="form-label">Your Database ID:</label>
          <InputGroup>
            <Form.Control
              type="text"
              value={databaseId}
              readOnly
              className="font-monospace"
            />
          </InputGroup>
        </div>

        <div className="mb-3">
          <label className="form-label">Your Master Key:</label>
          <InputGroup>
            <Form.Control
              type={showKey ? 'text' : 'password'}
              value={masterKey}
              readOnly
              className="font-monospace"
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowKey(!showKey)}
            >
              <i className={`ri-eye${showKey ? '-off' : ''}-line`}></i>
            </Button>
            <Button
              variant="outline-primary"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <i className="ri-check-line me-1"></i>
                  Copied!
                </>
              ) : (
                <>
                  <i className="ri-clipboard-line me-1"></i>
                  Copy
                </>
              )}
            </Button>
          </InputGroup>
        </div>

        <div className="d-grid gap-2 mb-3">
          <Button
            variant="success"
            onClick={handleDownload}
          >
            <i className="ri-download-2-line me-2"></i>
            Download Backup File
          </Button>
        </div>

        <Card className="border-info mb-3">
          <Card.Body className="small">
            <h6 className="text-info">
              <i className="ri-shield-check-line me-2"></i>
              Storage Recommendations:
            </h6>
            <ul className="mb-0">
              <li>Save in a password manager (1Password, Bitwarden, etc.)</li>
              <li>Store encrypted backup in secure cloud storage</li>
              <li>Keep physical copy in a safe or safety deposit box</li>
              <li>Never store in plain text on your computer</li>
            </ul>
          </Card.Body>
        </Card>

        <Form.Check
          type="checkbox"
          id="acknowledge-key-saved"
          label="I have safely stored my master key and understand it cannot be recovered"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mb-3"
        />

        <div className="d-grid">
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
            disabled={!acknowledged}
          >
            Continue to Dashboard
            <i className="ri-arrow-right-line ms-2"></i>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}