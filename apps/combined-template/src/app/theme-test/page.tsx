'use client';

import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Button } from '../../components/migrated/ui/Button';
import { Alert } from '../../components/migrated/ui/Alert';
import { ThemeCustomizer } from '../../components/migrated/ui/ThemeCustomizer';
import { TopNavigationBar } from '../../components/migrated/layout';
import { useThemeContext } from '../../providers/ThemeProvider';

export default function ThemeTestPage() {
  const { theme, effectiveTheme, isDark, toggleTheme } = useThemeContext();

  return (
    <>
      <TopNavigationBar appName="Theme Test" />
      
      <Container className="py-5">
        <Row>
          <Col>
            <h1 className="mb-4">Theme System Test Page</h1>
            
            <Card className="mb-4">
              <Card.Header>
                <h3>Current Theme Status</h3>
              </Card.Header>
              <Card.Body>
                <p><strong>User Preference:</strong> {theme}</p>
                <p><strong>Applied Theme:</strong> {effectiveTheme}</p>
                <p><strong>Is Dark:</strong> {isDark ? 'Yes' : 'No'}</p>
                <Button onClick={toggleTheme} className="mt-2">
                  Toggle Theme
                </Button>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h3>Button Variants</h3>
              </Card.Header>
              <Card.Body>
                <div className="d-flex gap-2 flex-wrap">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="d-flex gap-2 flex-wrap mt-3">
                  <Button variant="default" size="sm">Small</Button>
                  <Button variant="default">Normal</Button>
                  <Button variant="default" size="lg">Large</Button>
                  <Button variant="default" loading>Loading</Button>
                  <Button variant="default" disabled>Disabled</Button>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h3>Alert Variants</h3>
              </Card.Header>
              <Card.Body>
                <Alert variant="default" className="mb-2">
                  This is a default alert
                </Alert>
                <Alert variant="info" className="mb-2">
                  This is an info alert
                </Alert>
                <Alert variant="success" className="mb-2">
                  This is a success alert
                </Alert>
                <Alert variant="warning" className="mb-2">
                  This is a warning alert
                </Alert>
                <Alert variant="destructive">
                  This is a destructive alert
                </Alert>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h3>Form Controls</h3>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <label className="form-label">Text Input</label>
                  <input type="text" className="form-control" placeholder="Enter text" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Select</label>
                  <select className="form-select">
                    <option>Choose...</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="check1" />
                    <label className="form-check-label" htmlFor="check1">
                      Checkbox
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="radio" id="radio1" />
                    <label className="form-check-label" htmlFor="radio1">
                      Radio button
                    </label>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h3>Color Variables</h3>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col xs={6} md={4}>
                    <div className="p-3 rounded bg-background text-foreground border">
                      Background
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="p-3 rounded bg-card text-card-foreground border">
                      Card
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="p-3 rounded bg-muted-subtle text-muted-foreground border">
                      Muted
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="p-3 rounded bg-primary text-white">
                      Primary
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="p-3 rounded bg-secondary text-white">
                      Secondary
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="p-3 rounded bg-danger text-white">
                      Destructive
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h3>Theme Utilities</h3>
              </Card.Header>
              <Card.Body>
                <p className="theme-light-only">
                  This text is only visible in light mode
                </p>
                <p className="theme-dark-only">
                  This text is only visible in dark mode
                </p>
                <div className="p-3 bg-light shadow-sm shadow-dark">
                  This box has different shadows in dark mode
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Theme Customizer Floating Button */}
      <ThemeCustomizer />
    </>
  );
}