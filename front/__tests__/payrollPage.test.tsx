import { fireEvent, screen, waitFor } from '@testing-library/react';
import PayrollPage from '../src/app/payroll/page';
import { renderWithProviders } from '../test/test-utils';
import * as api from '../src/lib/api';
import type { PayrollListResponse } from '../src/lib/api';

jest.mock('../src/lib/api', () => ({
  getEmployees: jest.fn(),
  getPayroll: jest.fn(),
  createPayroll: jest.fn(),
}));

jest.mock('../src/components/PayrollForm', () => ({
  __esModule: true,
  default: ({ onSubmit }: any) => (
    <button
      onClick={() =>
        onSubmit({
          employeeId: 1,
          period: '2024-11',
          baseSalary: 1000,
          overtimeHours: 0,
          overtimeRate: 0,
          bonuses: 0,
          deductions: 0,
        })
      }
    >
      Registrar mock payroll
    </button>
  ),
}));

const mockGetEmployees = api.getEmployees as jest.MockedFunction<typeof api.getEmployees>;
const mockGetPayroll = api.getPayroll as jest.MockedFunction<typeof api.getPayroll>;
const mockCreatePayroll = api.createPayroll as jest.MockedFunction<typeof api.createPayroll>;

const payrollResponse: PayrollListResponse = {
  items: [
    {
      id: 10,
      employeeId: 1,
      employeeName: 'Alice',
      period: '2024-11',
      baseSalary: 1000,
      overtimeHours: 5,
      overtimeRate: 50,
      bonuses: 100,
      deductions: 20,
      netPay: 1330,
    },
  ],
  aggregates: {
    totalsByPeriod: [{ period: '2024-11', totalNet: 1330 }],
    grandTotalNet: 1330,
  },
};

describe('PayrollPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEmployees.mockResolvedValue([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
    mockGetPayroll.mockResolvedValue(payrollResponse);
    mockCreatePayroll.mockResolvedValue({
      id: 11,
      employeeId: 1,
      employeeName: 'Alice',
      period: '2024-12',
      baseSalary: 1200,
      overtimeHours: 0,
      overtimeRate: 0,
      bonuses: 0,
      deductions: 0,
      netPay: 1200,
    });
  });

  test('filters and creates payroll records', async () => {
    renderWithProviders(<PayrollPage />);

    await waitFor(() => expect(mockGetEmployees).toHaveBeenCalled());
    await waitFor(() => expect(mockGetPayroll).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/Módulo de nómina/i)).toBeInTheDocument();
    expect(screen.getByText(/Total acumulado/)).toBeInTheDocument();

    const employeeSelect = screen.getByRole('combobox');
    fireEvent.change(employeeSelect, { target: { value: '1' } });
    await waitFor(() => expect(mockGetPayroll).toHaveBeenCalledTimes(2));

    const periodInput = screen.getByRole('textbox');
    fireEvent.change(periodInput, { target: { value: '2024-12' } });
    await waitFor(() => expect(mockGetPayroll).toHaveBeenCalledTimes(3));

    fireEvent.click(screen.getByText('Limpiar'));
    await waitFor(() => expect(mockGetPayroll).toHaveBeenCalledTimes(4));

    fireEvent.click(screen.getByText('Registrar mock payroll'));
    await waitFor(() => expect(mockCreatePayroll).toHaveBeenCalled());
    await waitFor(() => expect(mockGetPayroll).toHaveBeenCalledTimes(5));
  });
});

