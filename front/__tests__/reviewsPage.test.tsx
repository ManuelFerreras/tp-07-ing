import { fireEvent, screen, waitFor } from '@testing-library/react';
import ReviewsPage from '../src/app/reviews/page';
import { renderWithProviders } from '../test/test-utils';
import * as api from '../src/lib/api';
import type { ReviewListResponse } from '../src/lib/api';

jest.mock('../src/lib/api', () => ({
  getEmployees: jest.fn(),
  getReviews: jest.fn(),
  createReview: jest.fn(),
  updateReview: jest.fn(),
  transitionReview: jest.fn(),
}));

jest.mock('../src/components/PerformanceReviewForm', () => ({
  __esModule: true,
  default: ({ mode, onSubmit, submitLabel }: any) => (
    <button onClick={() => onSubmit({ employeeId: 1, period: '2024-Q4', reviewer: 'Boss', rating: 4 })}>
      {submitLabel ?? (mode === 'create' ? 'Crear review' : 'Actualizar review')}
    </button>
  ),
}));

jest.mock('../src/components/ReviewList', () => ({
  __esModule: true,
  default: ({ reviews, onEdit, onAdvance }: any) => (
    <div>
      <span>Mock list {reviews.length}</span>
      {reviews[0] && (
        <>
          <button onClick={() => onEdit(reviews[0])}>Mock editar</button>
          <button onClick={() => onAdvance(reviews[0], 'submitted')}>Mock avanzar</button>
        </>
      )}
    </div>
  ),
}));

const mockGetEmployees = api.getEmployees as jest.MockedFunction<typeof api.getEmployees>;
const mockGetReviews = api.getReviews as jest.MockedFunction<typeof api.getReviews>;
const mockCreateReview = api.createReview as jest.MockedFunction<typeof api.createReview>;
const mockUpdateReview = api.updateReview as jest.MockedFunction<typeof api.updateReview>;
const mockTransitionReview = api.transitionReview as jest.MockedFunction<typeof api.transitionReview>;

const reviewsResponse: ReviewListResponse = {
  items: [
    {
      id: 1,
      employeeId: 1,
      employeeName: 'Alice',
      period: '2024-Q4',
      reviewer: 'Boss',
      rating: 4,
      strengths: '',
      opportunities: '',
      state: 'draft',
    },
  ],
  aggregates: [
    { employeeId: 1, employeeName: 'Alice', averageRating: 4, latestState: 'draft', count: 1 },
  ],
};

describe('ReviewsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEmployees.mockResolvedValue([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
    mockGetReviews.mockResolvedValue(reviewsResponse as any);
    mockCreateReview.mockResolvedValue(reviewsResponse.items[0] as any);
    mockUpdateReview.mockResolvedValue({ ...reviewsResponse.items[0], rating: 5 });
    mockTransitionReview.mockResolvedValue({ ...reviewsResponse.items[0], state: 'submitted' });
  });

  test('handles create, update, advance and filters', async () => {
    renderWithProviders(<ReviewsPage />);

    await waitFor(() => expect(mockGetEmployees).toHaveBeenCalled());
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/Evaluaciones de desempeño/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Crear review'));
    await waitFor(() => expect(mockCreateReview).toHaveBeenCalled());
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByText('Mock editar'));
    await waitFor(() => expect(screen.getByText(/Editar evaluación #1/)).toBeInTheDocument());

    fireEvent.click(screen.getByText('Actualizar evaluación'));
    await waitFor(() => expect(mockUpdateReview).toHaveBeenCalled());
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(3));

    fireEvent.click(screen.getByText('Mock avanzar'));
    await waitFor(() => expect(mockTransitionReview).toHaveBeenCalled());
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(4));

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(5));

    fireEvent.change(selects[1], { target: { value: 'submitted' } });
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(6));

    fireEvent.click(screen.getByText('Limpiar'));
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalledTimes(7));
  });
});

