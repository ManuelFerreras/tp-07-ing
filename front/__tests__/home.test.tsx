import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import HomePage from '../src/app/page';

describe('HomePage', () => {
  it('shows cards for each module', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole('heading', { name: /gestor integral de rr\.hh\./i })).toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: /Ingresar/i });
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/employees', '/reviews', '/payroll']);
  });
});


