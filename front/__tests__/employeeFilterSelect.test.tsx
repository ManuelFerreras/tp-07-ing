import { fireEvent, screen } from '@testing-library/react';
import EmployeeFilterSelect from '../src/components/EmployeeFilterSelect';
import { renderWithProviders } from '../test/test-utils';

const employees = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

describe('EmployeeFilterSelect', () => {
  test('lists employees and emits changes', () => {
    const onChange = jest.fn();
    renderWithProviders(<EmployeeFilterSelect employees={employees} value="" onChange={onChange} label="Persona" />);

    expect(screen.getByText('Persona')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });

    expect(onChange).toHaveBeenCalledWith('2');
  });
});

