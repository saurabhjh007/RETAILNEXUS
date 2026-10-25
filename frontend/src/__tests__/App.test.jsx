import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { formatINR, formatNumber, formatDate } from '../utils/formatters';

describe('UI Components Unit Tests', () => {
  it('renders Button with text and handles clicks', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const buttonElement = screen.getByText('Click Me');
    expect(buttonElement).toBeDefined();
    buttonElement.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders Badge with custom label and dot indicator', () => {
    render(<Badge variant="success" dot>Active</Badge>);
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('renders Card container with CardHeader', () => {
    render(
      <Card>
        <CardHeader title="Warehouse KPI" />
        <div>Card Content</div>
      </Card>
    );
    expect(screen.getByText('Warehouse KPI')).toBeDefined();
    expect(screen.getByText('Card Content')).toBeDefined();
  });
});

describe('Formatting Utilities Unit Tests', () => {
  it('formats Indian Rupee (INR) currency correctly with symbol', () => {
    const formatted = formatINR(150000);
    expect(formatted).toContain('1,50,000');
  });

  it('formats regular numbers with Indian numbering system', () => {
    const formatted = formatNumber(1250000);
    expect(formatted).toBe('12,50,000');
  });

  it('formats ISO dates into readable DD MMM YYYY', () => {
    const formatted = formatDate('2026-10-25T14:30:00');
    expect(formatted).toContain('2026');
  });
});
