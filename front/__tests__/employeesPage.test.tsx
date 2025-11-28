import { fireEvent, screen, waitFor } from '@testing-library/react';
import EmployeesPage from '../src/app/employees/page';
import { renderWithProviders } from '../test/test-utils';
import * as api from '../src/lib/api';

jest.mock('../src/lib/api', () => ({
  getEmployees: jest.fn(),
  createEmployee: jest.fn(),
  updateEmployee: jest.fn(),
  deleteEmployee: jest.fn(),
}));

jest.mock('../src/components/EmployeeForm', () => ({
  __esModule: true,
  default: ({ onSubmit, submitLabel, initialName }: any) => (
    <button onClick={() => onSubmit(initialName ? `${initialName} edit` : 'Nuevo nombre')}>{submitLabel}</button>
  ),
}));

const mockGetEmployees = api.getEmployees as jest.MockedFunction<typeof api.getEmployees>;
const mockCreateEmployee = api.createEmployee as jest.MockedFunction<typeof api.createEmployee>;
const mockUpdateEmployee = api.updateEmployee as jest.MockedFunction<typeof api.updateEmployee>;
const mockDeleteEmployee = api.deleteEmployee as jest.MockedFunction<typeof api.deleteEmployee>;

describe('EmployeesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEmployees.mockResolvedValue([{ id: 1, name: 'Alice' }]);
    mockCreateEmployee.mockResolvedValue({ id: 2, name: 'Nuevo nombre' });
    mockUpdateEmployee.mockResolvedValue({ id: 1, name: 'Alice edit' });
    mockDeleteEmployee.mockResolvedValue(undefined);
  });

  test('loads list and supports create/update/delete flows', async () => {
    renderWithProviders(<EmployeesPage />);

    await waitFor(() => expect(mockGetEmployees).toHaveBeenCalled());
    expect(screen.getByText('Gestión de empleados')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Crear'));
    await waitFor(() => expect(mockCreateEmployee).toHaveBeenCalledWith('Nuevo nombre'));

    fireEvent.click(screen.getAllByText('Editar')[0]);
    await waitFor(() => expect(screen.getByText(/Editando: Alice/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText('Actualizar'));
    await waitFor(() => expect(mockUpdateEmployee).toHaveBeenCalledWith(1, 'Alice edit'));

    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getAllByText('Eliminar')[0]);
    await waitFor(() => expect(mockDeleteEmployee).toHaveBeenCalledWith(1));
    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});

