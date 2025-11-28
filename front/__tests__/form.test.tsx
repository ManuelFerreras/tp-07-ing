import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import EmployeeForm from '../src/components/EmployeeForm';

test('renders and validates required', async () => {
  const onSubmit = jest.fn();
  renderWithProviders(<EmployeeForm onSubmit={onSubmit} />);
  fireEvent.click(screen.getByText('Guardar'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Name is required');
  expect(onSubmit).not.toHaveBeenCalled();
});

test('submit successful', async () => {
  const onSubmit = jest.fn().mockResolvedValue(undefined);
  renderWithProviders(<EmployeeForm onSubmit={onSubmit} submitLabel="Create" />);
  fireEvent.change(screen.getByLabelText('name'), { target: { value: 'Alice' } });
  fireEvent.click(screen.getByText('Create'));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('Alice'));
});

test('shows error feedback', async () => {
  const onSubmit = jest.fn().mockRejectedValue(new Error('Server down'));
  renderWithProviders(<EmployeeForm onSubmit={onSubmit} />);
  fireEvent.change(screen.getByLabelText('name'), { target: { value: 'Bob' } });
  fireEvent.click(screen.getByText('Guardar'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Server down');
});


