'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import TopNavigationBar from '../components/migrated/layout/TopNavigationBar';
import { ThemeCustomizer, ThemeToggler } from '../components/migrated/ui/ThemeCustomizer';
import { Button } from '../components/migrated/ui/Button';
import { Input } from '../components/migrated/ui/Input';
import { Label } from '../components/migrated/ui/Label';
import { Checkbox } from '../components/migrated/ui/Checkbox';
import { Alert } from '../components/migrated/ui/Alert';

export default function HomePage() {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <>
      <TopNavigationBar />
      
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h1 className="display-4">Combined Template Theme Demo</h1>
            <p className="lead">
              Experience seamless theme switching with Doctor-Dok and Rasket integration
            </p>
          </Col>
        </Row>

        {showAlert && (
          <Alert 
            variant="info" 
            dismissible 
            onClose={() => setShowAlert(false)}
          >
            <strong>Welcome!</strong> This page demonstrates the unified theme system.
            Try switching between light and dark modes using the toggle in the navigation bar.
          </Alert>
        )}

        <Row className="g-4">
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Theme Controls</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex gap-3 align-items-center mb-3">
                  <Label>Quick Theme Toggle:</Label>
                  <ThemeToggler />
                </div>
                
                <Button 
                  variant="default" 
                  onClick={() => setShowCustomizer(true)}
                  className="w-100"
                >
                  Open Theme Customizer
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Component Examples</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <Label htmlFor="example-input">Sample Input</Label>
                  <Input 
                    id="example-input" 
                    placeholder="Type something..." 
                  />
                </div>

                <div className="mb-3">
                  <Checkbox id="example-checkbox">
                    Enable notifications
                  </Checkbox>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  <Button variant="default" size="sm">Default</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="outline" size="sm">Outline</Button>
                  <Button variant="destructive" size="sm">Destructive</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                  <Button variant="link" size="sm">Link</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Theme Features</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <h6>🌓 Auto Theme Detection</h6>
                    <p className="text-muted small">
                      Automatically matches your system theme preference
                    </p>
                  </Col>
                  <Col md={4}>
                    <h6>💾 Persistent Settings</h6>
                    <p className="text-muted small">
                      Your theme choice is saved and restored on return visits
                    </p>
                  </Col>
                  <Col md={4}>
                    <h6>🎨 Custom Colors</h6>
                    <p className="text-muted small">
                      Customize primary colors to match your brand
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col md={12}>
            <Card className="bg-light" data-bs-theme="light">
              <Card.Body>
                <h6>Light Theme Preview</h6>
                <p className="mb-0">This card always shows in light theme</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={12}>
            <Card className="bg-dark text-white" data-bs-theme="dark">
              <Card.Body>
                <h6>Dark Theme Preview</h6>
                <p className="mb-0">This card always shows in dark theme</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <ThemeCustomizer 
        open={showCustomizer} 
        onClose={() => setShowCustomizer(false)} 
      />
    </>
  );
}