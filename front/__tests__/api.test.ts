import { getEmployees, createEmployee, updateEmployee } from '../src/lib/api';

const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetAllMocks();
  process.env = { ...OLD_ENV, NEXT_PUBLIC_API_URL: 'http://api' };
  // @ts-ignore
  global.fetch = jest.fn();
});

afterAll(() => {
  process.env = OLD_ENV;
});

test('getEmployees happy path', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(new Response(JSON.stringify([{ id: 1, name: 'A' }] as any)));
  const res = await getEmployees();
  expect(res).toEqual([{ id: 1, name: 'A' }]);
  expect(global.fetch).toHaveBeenCalledWith('http://api/employees', { cache: 'no-store' });
});

test('createEmployee happy path', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(new Response(JSON.stringify({ id: 2, name: 'B' } as any), { status: 201 }));
  const res = await createEmployee('  B  ');
  expect(res).toEqual({ id: 2, name: 'B' });
  const [, init] = (global.fetch as jest.Mock).mock.calls[0];
  expect(init).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json' } });
});

test('updateEmployee happy path', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(new Response(JSON.stringify({ id: 3, name: 'C2' } as any), { status: 200 }));
  const res = await updateEmployee(3, 'C2');
  expect(res).toEqual({ id: 3, name: 'C2' });
});

test('propagates error from server', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(new Response(JSON.stringify({ error: 'bad' }), { status: 422 }));
  await expect(createEmployee('x')).rejects.toThrow('bad');
});


