import { render, screen } from '@testing-library/react';
import HomePage from '../src/app/page';

describe('HomePage', () => {
  it('renders heading and link to employees', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /employees/i });
    expect(link).toHaveAttribute('href', '/employees');
  });
});


