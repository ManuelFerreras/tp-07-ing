"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Select,
} from "@chakra-ui/react";
import PerformanceReviewForm, { ReviewFormValues } from "../../components/PerformanceReviewForm";
import ReviewList from "../../components/ReviewList";
import {
  Employee,
  PerformanceReview,
  ReviewAggregate,
  createReview,
  getEmployees,
  getReviews,
  transitionReview,
  updateReview,
} from "../../lib/api";

type FilterState = {
  employeeId: string;
  state: string;
};

export default function ReviewsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [aggregates, setAggregates] = useState<ReviewAggregate[]>([]);
  const [filters, setFilters] = useState<FilterState>({ employeeId: "", state: "" });
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch((err) => setError(err?.message || "No se pudieron cargar empleados"));
  }, []);

  useEffect(() => {
    refreshReviews(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.employeeId, filters.state]);

  async function refreshReviews(currentFilters: FilterState) {
    setLoading(true);
    setError(null);
    try {
      const params: { employeeId?: number; state?: string } = {};
      if (currentFilters.employeeId) {
        params.employeeId = Number(currentFilters.employeeId);
      }
      if (currentFilters.state) {
        params.state = currentFilters.state;
      }
      const response = await getReviews(params);
      setReviews(response.items);
      setAggregates(response.aggregates);
      if (selectedReview && !response.items.find((r) => r.id === selectedReview.id)) {
        setSelectedReview(null);
      }
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar las evaluaciones");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(values: ReviewFormValues) {
    await createReview(values);
    await refreshReviews(filters);
  }

  async function handleUpdate(values: Parameters<typeof updateReview>[1]) {
    if (!selectedReview) return;
    await updateReview(selectedReview.id, values);
    setSelectedReview(null);
    await refreshReviews(filters);
  }

  async function handleAdvance(review: PerformanceReview, nextState: string) {
    await transitionReview(review.id, nextState);
    await refreshReviews(filters);
  }

  return (
    <Box bg="gray.50" minH="100vh" py={10}>
      <Container maxW="6xl">
        <Stack spacing={6}>
          <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }}>
            <div>
              <Heading size="lg" color="brand.700">
                Evaluaciones de desempeño
              </Heading>
              <Text color="gray.600">Controlá ratings trimestrales, comentarios y estados.</Text>
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
                Nueva evaluación
              </Heading>
              <PerformanceReviewForm employees={employees} mode="create" onSubmit={handleCreate} />
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
                    Estado
                  </Text>
                  <Select
                    value={filters.state}
                    onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="draft">Borrador</option>
                    <option value="submitted">En revisión</option>
                    <option value="approved">Aprobado</option>
                  </Select>
                </Box>
                <Button onClick={() => setFilters({ employeeId: "", state: "" })} alignSelf="flex-end">
                  Limpiar
                </Button>
              </Stack>
            </CardBody>
          </Card>

          <Stack spacing={3} data-cy="reviews-summary">
            <Heading size="md">Resumen por empleado</Heading>
            {aggregates.length === 0 ? (
              <Text color="gray.500">No hay promedios disponibles.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {aggregates.map((agg) => (
                  <Card key={agg.employeeId} data-cy="review-summary-card">
                    <CardBody>
                      <Heading size="sm" mb={2}>
                        {agg.employeeName}
                      </Heading>
                      <Text>Promedio: {agg.averageRating.toFixed(1)} ⭐</Text>
                      <Text>Último estado: {agg.latestState}</Text>
                      <Badge mt={2} colorScheme="blue">
                        {agg.count} evaluaciones
                      </Badge>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Stack>

          <Card>
            <CardBody>
              <Stack direction="row" justify="space-between" align="center" mb={4}>
                <Heading size="md">Evaluaciones registradas</Heading>
                {loading && <Spinner thickness="4px" color="brand.500" />}
              </Stack>
              <Box overflowX="auto">
                <ReviewList
                  reviews={reviews}
                  onEdit={setSelectedReview}
                  onAdvance={handleAdvance}
                  loading={loading}
                />
              </Box>
            </CardBody>
          </Card>

          {selectedReview && (
            <Card borderColor="brand.200" borderWidth="1px">
              <CardBody>
                <Heading size="md" mb={4}>
                  Editar evaluación #{selectedReview.id}
                </Heading>
                <PerformanceReviewForm
                  employees={employees}
                  mode="edit"
                  initialValues={selectedReview}
                  onSubmit={(values) =>
                    handleUpdate({
                      reviewer: values.reviewer,
                      rating: values.rating,
                      strengths: values.strengths,
                      opportunities: values.opportunities,
                    })
                  }
                  submitLabel="Actualizar evaluación"
                />
                <Button mt={4} variant="ghost" onClick={() => setSelectedReview(null)}>
                  Cancelar edición
                </Button>
              </CardBody>
            </Card>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

