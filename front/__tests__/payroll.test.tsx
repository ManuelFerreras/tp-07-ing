import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import PayrollForm from '../src/components/PayrollForm';

const employees = [{ id: 1, name: 'Alice' }];

describe('PayrollForm', () => {
  test('requires employee and period', async () => {
    const onSubmit = jest.fn();
    renderWithProviders(<PayrollForm employees={employees} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByText(/Registrar nómina/i));
    expect(await screen.findByRole('alert')).toHaveTextContent('Seleccione un empleado');
  });

  test('submits numeric values and shows preview', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderWithProviders(<PayrollForm employees={employees} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Empleado/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Período/i), { target: { value: '2024-11' } });
    fireEvent.change(screen.getByLabelText(/Salario base/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Horas extra/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Tarifa hora extra/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Bonos/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/Deducciones/i), { target: { value: '100' } });

    expect(screen.getByText(/Neto estimado/)).toHaveTextContent('1600.00');

    fireEvent.click(screen.getByText(/Registrar nómina/i));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        employeeId: 1,
        period: '2024-11',
        baseSalary: 1000,
        overtimeHours: 10,
        overtimeRate: 50,
        bonuses: 200,
        deductions: 100,
      })
    );
  });
});

