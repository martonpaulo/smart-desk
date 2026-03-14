import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders a button element with label text', () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-slot', 'button');
  });
});
