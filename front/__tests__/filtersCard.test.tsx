import { screen } from '@testing-library/react';
import FiltersCard from '../src/components/FiltersCard';
import { renderWithProviders } from '../test/test-utils';

describe('FiltersCard', () => {
  test('renders heading and children content', () => {
    renderWithProviders(
      <FiltersCard stackProps={{ align: 'flex-start' }}>
        <div>Custom content</div>
      </FiltersCard>
    );

    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });
});

