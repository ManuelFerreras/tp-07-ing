"use client";

import { useEffect, useMemo, useState } from 'react';
import EmployeeForm from "../../components/EmployeeForm";
import { Employee, getEmployees, createEmployee, updateEmployee } from "../../lib/api";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const editingEmployee = useMemo(() => employees.find(e => e.id === editingId) || null, [employees, editingId]);

  async function refresh() {
    try {
      setError(null);
      const data = await getEmployees();
      setEmployees(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(name: string) {
    const emp = await createEmployee(name);
    setEmployees(prev => [...prev, emp]);
  }

  async function handleUpdate(name: string) {
    if (editingEmployee) {
      const updated = await updateEmployee(editingEmployee.id, name);
      setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
      setEditingId(null);
    }
  }

  return (
    <div>
      {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}

      <h2>Create Employee</h2>
      <EmployeeForm onSubmit={handleCreate} submitLabel="Create" />

      {editingEmployee && (
        <div>
          <h2>Edit Employee</h2>
          <EmployeeForm initialName={editingEmployee.name} onSubmit={handleUpdate} submitLabel="Update" />
        </div>
      )}

      <h2>List</h2>
      <table border={1} cellPadding={4} cellSpacing={0}>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {employees.map(e => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.name}</td>
              <td>
                <button onClick={() => setEditingId(e.id)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


