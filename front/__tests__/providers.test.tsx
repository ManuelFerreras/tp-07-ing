import { screen } from '@testing-library/react';
import { Providers } from '../src/app/providers';
import { renderWithProviders } from '../test/test-utils';

describe('Providers wrapper', () => {
  test('renders its children inside Chakra context', () => {
    renderWithProviders(
      <Providers>
        <div>nested content</div>
      </Providers>
    );

    expect(screen.getByText('nested content')).toBeInTheDocument();
  });
});

