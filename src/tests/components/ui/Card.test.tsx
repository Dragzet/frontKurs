import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../../../components/ui/Card';

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="Test Title">Content</Card>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('custom-class');
  });

  it('includes default styling', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm');
  });
});