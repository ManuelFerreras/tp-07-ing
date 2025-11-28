import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import PerformanceReviewForm from '../src/components/PerformanceReviewForm';

const employees = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

describe('PerformanceReviewForm', () => {
  test('validates required fields in create mode', async () => {
    const onSubmit = jest.fn();
    renderWithProviders(<PerformanceReviewForm employees={employees} mode="create" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByText(/Crear evaluación/i));
    expect(await screen.findByRole('alert')).toHaveTextContent('Seleccione un empleado');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('submits sanitized values', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderWithProviders(<PerformanceReviewForm employees={employees} mode="create" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Empleado/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Período/i), { target: { value: ' 2024-Q4 ' } });
    fireEvent.change(screen.getByLabelText(/Evaluador/i), { target: { value: ' Manager ' } });
    fireEvent.change(screen.getByLabelText(/Rating/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Fortalezas/i), { target: { value: 'Entrega' } });
    fireEvent.change(screen.getByLabelText(/Oportunidades/i), { target: { value: 'Planificación' } });

    fireEvent.click(screen.getByText(/Crear evaluación/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        employeeId: 1,
        period: '2024-Q4',
        reviewer: 'Manager',
        rating: 5,
        strengths: 'Entrega',
        opportunities: 'Planificación',
      })
    );
  });

  test('supports edit mode without employee selector', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderWithProviders(
      <PerformanceReviewForm
        employees={employees}
        mode="edit"
        initialValues={{
          employeeId: 2,
          period: '2024-Q4',
          reviewer: 'Lead',
          rating: 4,
          strengths: 'Entrega',
          opportunities: 'Planificación',
        }}
        onSubmit={onSubmit}
        submitLabel="Guardar cambios"
      />
    );

    expect(screen.getByText(/Empleado: Bob/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Evaluador/i), { target: { value: 'Lead 2' } });
    fireEvent.click(screen.getByText(/Guardar cambios/i));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ reviewer: 'Lead 2' })));
  });
});


