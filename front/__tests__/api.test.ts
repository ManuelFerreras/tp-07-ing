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

function mockResponse(body: any, init?: { status?: number; statusText?: string }) {
  const status = init?.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init?.statusText ?? '',
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

test('getEmployees happy path', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse([{ id: 1, name: 'A' }]));
  const res = await getEmployees();
  expect(res).toEqual([{ id: 1, name: 'A' }]);
  expect(global.fetch).toHaveBeenCalledWith('http://api/employees', { cache: 'no-store' });
});

test('createEmployee happy path', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse({ id: 2, name: 'B' }, { status: 201 }));
  const res = await createEmployee('  B  ');
  expect(res).toEqual({ id: 2, name: 'B' });
  const [, init] = (global.fetch as jest.Mock).mock.calls[0];
  expect(init).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json' } });
});

test('updateEmployee happy path', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse({ id: 3, name: 'C2' }, { status: 200 }));
  const res = await updateEmployee(3, 'C2');
  expect(res).toEqual({ id: 3, name: 'C2' });
});

test('createEmployee propagates 422 error from server', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse({ error: 'bad' }, { status: 422, statusText: 'Unprocessable Entity' }));
  await expect(createEmployee('x')).rejects.toThrow('bad');
});

test('getEmployees error path propagates message', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse({ error: 'boom' }, { status: 500, statusText: 'Internal Server Error' }));
  await expect(getEmployees()).rejects.toThrow('boom');
});

test('updateEmployee error path propagates message', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse({ error: 'not found' }, { status: 404, statusText: 'Not Found' }));
  await expect(updateEmployee(9, 'X')).rejects.toThrow('not found');
});


