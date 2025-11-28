import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getReviews,
  createReview,
  updateReview,
  transitionReview,
  getPayroll,
  createPayroll,
} from "../src/lib/api";

const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetAllMocks();
  process.env = { ...OLD_ENV, NEXT_PUBLIC_API_URL: "http://api" };
  // @ts-ignore
  global.fetch = jest.fn();
});

afterAll(() => {
  process.env = OLD_ENV;
});

function mockResponse(
  body: any,
  init?: { status?: number; statusText?: string }
) {
  const status = init?.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init?.statusText ?? "",
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

test("getEmployees happy path", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse([{ id: 1, name: "A" }])
  );
  const res = await getEmployees();
  expect(res).toEqual([{ id: 1, name: "B" }]);
  expect(global.fetch).toHaveBeenCalledWith("http://api/employees", {
    cache: "no-store",
  });
});

test("createEmployee happy path", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse({ id: 2, name: "B" }, { status: 201 })
  );
  const res = await createEmployee("  B  ");
  expect(res).toEqual({ id: 2, name: "B" });
  const [, init] = (global.fetch as jest.Mock).mock.calls[0];
  expect(init).toMatchObject({
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
});

test("updateEmployee happy path", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse({ id: 3, name: "C2" }, { status: 200 })
  );
  const res = await updateEmployee(3, "C2");
  expect(res).toEqual({ id: 3, name: "C2" });
});

test("createEmployee propagates 422 error from server", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse(
      { error: "bad" },
      { status: 422, statusText: "Unprocessable Entity" }
    )
  );
  await expect(createEmployee("x")).rejects.toThrow("bad");
});

test("getEmployees error path propagates message", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse(
      { error: "boom" },
      { status: 500, statusText: "Internal Server Error" }
    )
  );
  await expect(getEmployees()).rejects.toThrow("boom");
});

test("updateEmployee error path propagates message", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse(
      { error: "not found" },
      { status: 404, statusText: "Not Found" }
    )
  );
  await expect(updateEmployee(9, "X")).rejects.toThrow("not found");
});

test("deleteEmployee hits endpoint with delete verb", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    text: async () => "",
  } as Response);
  await deleteEmployee(7);
  expect(global.fetch).toHaveBeenCalledWith("http://api/employees/7", {
    method: "DELETE",
  });
});

test("deleteEmployee propagates API error", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    statusText: "Server Error",
    text: async () => JSON.stringify({ error: "boom" }),
  } as Response);
  await expect(deleteEmployee(8)).rejects.toThrow("boom");
});

test("getReviews sends filter params", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse({ items: [], aggregates: [] })
  );
  await getReviews({ employeeId: 7, state: "draft" });
  expect(global.fetch).toHaveBeenCalledWith(
    "http://api/reviews?employeeId=7&state=draft",
    { cache: "no-store" }
  );
});

test("createReview trims data before sending", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse(
      {
        id: 1,
        employeeId: 2,
        employeeName: "A",
        period: "2024-Q4",
        reviewer: "Lead",
        rating: 5,
        strengths: "",
        opportunities: "",
        state: "draft",
      },
      { status: 201 }
    )
  );
  await createReview({
    employeeId: 2,
    period: " 2024-Q4 ",
    reviewer: " Lead ",
    rating: 5,
    strengths: "  ",
    opportunities: "",
  });
  const [, init] = (global.fetch as jest.Mock).mock.calls[0];
  expect((init as RequestInit).body).toContain('"period":"2024-Q4"');
});

test("updateReview hits endpoint with payload", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse({ id: 3 }, { status: 200 })
  );
  await updateReview(3, { reviewer: "QA", rating: 4 });
  expect(global.fetch).toHaveBeenCalledWith(
    "http://api/reviews/3",
    expect.any(Object)
  );
});

test("transitionReview updates status", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse({ id: 5 }, { status: 200 })
  );
  await transitionReview(5, "submitted");
  expect(global.fetch).toHaveBeenCalledWith(
    "http://api/reviews/5/status",
    expect.objectContaining({ method: "PUT" })
  );
});

test("getPayroll builds query string", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse({
      items: [],
      aggregates: { totalsByPeriod: [], grandTotalNet: 0 },
    })
  );
  await getPayroll({ employeeId: 1, period: "2024-10" });
  expect(global.fetch).toHaveBeenCalledWith(
    "http://api/payroll?employeeId=1&period=2024-10",
    { cache: "no-store" }
  );
});

test("createPayroll normalizes optional numbers", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    mockResponse({ id: 9 }, { status: 201 })
  );
  await createPayroll({ employeeId: 1, period: "2024-11", baseSalary: 1000 });
  const [, init] = (global.fetch as jest.Mock).mock.calls[0];
  expect((init as RequestInit).body).toContain('"overtimeHours":0');
});
