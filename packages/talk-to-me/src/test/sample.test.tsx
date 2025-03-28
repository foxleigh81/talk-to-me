import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Testing Setup', () => {
  it('should work with React Testing Library', () => {
    render(<div>Test</div>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
