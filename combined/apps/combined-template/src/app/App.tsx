'use client';

import React from 'react';
import { Container, Row, Col, Card, Alert, Form } from 'react-bootstrap';
import { ThemeProvider } from '../providers/ThemeProvider';
import { TopNavigationBar } from '../components/migrated/layout/TopNavigationBar';
import { Button } from '../components/migrated/ui/Button';
import '../styles/main.scss';

function AppContent() {
  return (
    <>
      <TopNavigationBar
        brandName="Theme Demo"
        brandLogo={{
          light: '/logo-light.svg',
          dark: '/logo-dark.svg',
        }}
      />
      
      <Container className="mt-5 pt-5">
        <Row>
          <Col>
            <h1 className="mb-4">Theme Switching Demo</h1>
            
            <Alert variant="info">
              This demo showcases the comprehensive theme switching implementation that integrates
              Doctor-Dok's theme preferences with Rasket's Bootstrap 5 theming system.
            </Alert>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={6}>
            <Card>
              <Card.Header>
                <Card.Title>Sample Card Component</Card.Title>
              </Card.Header>
              <Card.Body>
                <p>This card demonstrates how components adapt to theme changes.</p>
                <div className="d-flex gap-2 flex-wrap">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <Card.Header>
                <Card.Title>Form Elements</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Text Input</Form.Label>
                    <Form.Control type="text" placeholder="Enter text" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Select</Form.Label>
                    <Form.Select>
                      <option>Choose...</option>
                      <option>Option 1</option>
                      <option>Option 2</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Check 
                    type="switch"
                    label="Toggle switch"
                    className="mb-3"
                  />
                  
                  <Form.Check 
                    type="checkbox"
                    label="Checkbox"
                  />
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <Card bg="primary" text="white">
              <Card.Body>
                <Card.Title>Colored Card</Card.Title>
                <Card.Text>
                  This card uses Bootstrap's color variants which automatically adapt to themes.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4 mb-5">
          <Col>
            <h3>Theme Features</h3>
            <ul>
              <li>Seamless switching between light, dark, and auto modes</li>
              <li>Custom primary color selection</li>
              <li>Font size scaling</li>
              <li>Persistent theme preferences</li>
              <li>Bootstrap component integration</li>
              <li>Doctor-Dok CSS variable compatibility</li>
              <li>No flash of unstyled content (FOUC)</li>
              <li>Smooth transitions</li>
            </ul>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="auto" enableSystem disableTransitionOnChange>
      <AppContent />
    </ThemeProvider>
  );
}