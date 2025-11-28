"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  Select,
  Stack,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Input,
} from "@chakra-ui/react";
import PayrollForm, { PayrollFormValues } from "../../components/PayrollForm";
import {
  Employee,
  PayrollListResponse,
  PayrollRecord,
  createPayroll,
  getEmployees,
  getPayroll,
} from "../../lib/api";

type PayrollFilters = {
  employeeId: string;
  period: string;
};

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [data, setData] = useState<PayrollListResponse | null>(null);
  const [filters, setFilters] = useState<PayrollFilters>({ employeeId: "", period: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch((err) => setError(err?.message || "No se pudieron cargar empleados"));
  }, []);

  useEffect(() => {
    refreshPayroll(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.employeeId, filters.period]);

  async function refreshPayroll(currentFilters: PayrollFilters) {
    setLoading(true);
    setError(null);
    try {
      const params: { employeeId?: number; period?: string } = {};
      if (currentFilters.employeeId) params.employeeId = Number(currentFilters.employeeId);
      if (currentFilters.period) params.period = currentFilters.period;
      const response = await getPayroll(params);
      setData(response);
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar la nómina");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(values: PayrollFormValues) {
    await createPayroll(values);
    await refreshPayroll(filters);
  }

  const payrollItems: PayrollRecord[] = data?.items ?? [];

  return (
    <Box bg="gray.50" minH="100vh" py={10}>
      <Container maxW="6xl">
        <Stack spacing={6}>
          <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }}>
            <div>
              <Heading size="lg" color="brand.700">
                Módulo de nómina
              </Heading>
              <Text color="gray.600">Calculá netos y totales mensuales de manera consistente.</Text>
            </div>
            <Button as={Link} href="/" variant="ghost" colorScheme="blue">
              ← Volver al inicio
            </Button>
          </Stack>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Registrar liquidación
              </Heading>
              <PayrollForm employees={employees} onSubmit={handleCreate} />
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Filtros
              </Heading>
              <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                <Box flex={1}>
                  <Text fontWeight="semibold" mb={1}>
                    Empleado
                  </Text>
                  <Select
                    value={filters.employeeId}
                    onChange={(e) => setFilters((prev) => ({ ...prev, employeeId: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box flex={1}>
                  <Text fontWeight="semibold" mb={1}>
                    Período (YYYY-MM)
                  </Text>
                  <Input
                    value={filters.period}
                    onChange={(e) => setFilters((prev) => ({ ...prev, period: e.target.value }))}
                  />
                </Box>
                <Button onClick={() => setFilters({ employeeId: "", period: "" })} alignSelf="flex-end">
                  Limpiar
                </Button>
              </Stack>
            </CardBody>
          </Card>

          <Stack spacing={3}>
            <Heading size="md">Totales por período</Heading>
            {data?.aggregates.totalsByPeriod.length ? (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {data.aggregates.totalsByPeriod.map((total) => (
                  <Card key={total.period}>
                    <CardBody>
                      <Stat>
                        <StatLabel>{total.period}</StatLabel>
                        <StatNumber>${total.totalNet.toFixed(2)}</StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                ))}
                <Card borderColor="brand.300" borderWidth="1px">
                  <CardBody>
                    <Stat>
                      <StatLabel>Total acumulado</StatLabel>
                      <StatNumber>${data.aggregates.grandTotalNet.toFixed(2)}</StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>
            ) : (
              <Text color="gray.500">No hay movimientos registrados.</Text>
            )}
          </Stack>

          <Card>
            <CardBody>
              <Stack direction="row" justify="space-between" align="center" mb={4}>
                <Heading size="md">Detalle de liquidaciones</Heading>
                {loading && <Spinner color="brand.500" thickness="4px" />}
              </Stack>
              {payrollItems.length === 0 ? (
                <Text color="gray.500">No se registraron pagos aún.</Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg="gray.100">
                      <Tr>
                        <Th>ID</Th>
                        <Th>Empleado</Th>
                        <Th>Período</Th>
                        <Th>Salario base</Th>
                        <Th>Horas extra</Th>
                        <Th>Bonos</Th>
                        <Th>Deducciones</Th>
                        <Th>Neto</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {payrollItems.map((record) => (
                        <Tr key={record.id}>
                          <Td>{record.id}</Td>
                          <Td>{record.employeeName}</Td>
                          <Td>{record.period}</Td>
                          <Td>${record.baseSalary.toFixed(2)}</Td>
                          <Td>
                            {record.overtimeHours}h @ ${record.overtimeRate.toFixed(2)}
                          </Td>
                          <Td>${record.bonuses.toFixed(2)}</Td>
                          <Td>${record.deductions.toFixed(2)}</Td>
                          <Td>
                            <Badge colorScheme="green">${record.netPay.toFixed(2)}</Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}


