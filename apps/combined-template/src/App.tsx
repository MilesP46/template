import React from 'react';
import { Container } from 'react-bootstrap';
import TopNavigationBar from './components/migrated/layout/TopNavigationBar';
import { ThemeToggler } from './components/migrated/ui/ThemeCustomizer';

export default function App() {
  return (
    <div className="app">
      <TopNavigationBar />
      <Container className="py-4">
        <h1>Combined Template</h1>
        <p>Unified template with comprehensive theme switching</p>
        <div className="mt-4">
          <h2>Theme Controls</h2>
          <ThemeToggler />
        </div>
      </Container>
    </div>
  );
}