import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Card from '../../../components/ui/Card';

describe('Card', () => {
  // Clean up after each test
  afterEach(() => {
    cleanup();
  });

  it('renders children content', () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="Test Title">Content</Card>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Custom Content</Card>);
    // Get the card element directly instead of navigating through parent elements
    const card = screen.getByText('Custom Content').closest('div.custom-class');
    expect(card).toHaveClass('custom-class');
  });

  it('includes default styling', () => {
    render(<Card data-testid="card-container">Default Styling Content</Card>);
    // Find the outermost card container directly using a test ID
    const card = screen.getByTestId('card-container');
    // Check that it has the default classes
    expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm');
  });
});