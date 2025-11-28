import { fireEvent, screen } from '@testing-library/react';
import ReviewList from '../src/components/ReviewList';
import { renderWithProviders } from '../test/test-utils';

const baseReview = {
  id: 1,
  employeeId: 1,
  employeeName: 'Alice',
  period: '2024-Q4',
  reviewer: 'Boss',
  rating: 4,
  strengths: 'Entrega',
  opportunities: 'Comunicación',
  state: 'draft',
};

describe('ReviewList', () => {
  test('shows empty state when not loading', () => {
    renderWithProviders(<ReviewList reviews={[]} onAdvance={jest.fn()} onEdit={jest.fn()} loading={false} />);
    expect(screen.getByText(/No hay evaluaciones registradas/i)).toBeInTheDocument();
  });

  test('renders reviews and triggers callbacks', () => {
    const onEdit = jest.fn();
    const onAdvance = jest.fn();
    renderWithProviders(<ReviewList reviews={[baseReview]} onAdvance={onAdvance} onEdit={onEdit} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Editar/i));
    expect(onEdit).toHaveBeenCalledWith(baseReview);

    fireEvent.click(screen.getByText(/Enviar a revisión/i));
    expect(onAdvance).toHaveBeenCalledWith(baseReview, 'submitted');
  });
});

