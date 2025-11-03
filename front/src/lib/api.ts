export type Employee = { id: number; name: string };

function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return `${base}${path}`;
}

async function handleJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const message = data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data as T;
}

export async function getEmployees(): Promise<Employee[]> {
  const res = await fetch(apiUrl('/employees'), { cache: 'no-store' });
  return handleJson<Employee[]>(res);
}

export async function createEmployee(name: string): Promise<Employee> {
  const res = await fetch(apiUrl('/employees'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim() }),
  });
  return handleJson<Employee>(res);
}

export async function updateEmployee(id: number, name: string): Promise<Employee> {
  const res = await fetch(apiUrl(`/employees/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim() }),
  });
  return handleJson<Employee>(res);
}


