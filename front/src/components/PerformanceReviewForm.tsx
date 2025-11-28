"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Textarea,
  Text,
} from "@chakra-ui/react";
import { Employee } from "../lib/api";

export type ReviewFormValues = {
  employeeId: number;
  period: string;
  reviewer: string;
  rating: number;
  strengths: string;
  opportunities: string;
};

type Props = {
  employees: Employee[];
  mode: "create" | "edit";
  initialValues?: Partial<ReviewFormValues>;
  onSubmit: (values: ReviewFormValues) => Promise<void> | void;
  submitLabel?: string;
};

const ratingOptions = [1, 2, 3, 4, 5];

export default function PerformanceReviewForm({
  employees,
  mode,
  initialValues,
  onSubmit,
  submitLabel,
}: Props) {
  const isCreate = mode === "create";
  const defaults = useMemo<ReviewFormValues>(
    () => ({
      employeeId: initialValues?.employeeId ?? 0,
      period: initialValues?.period ?? "",
      reviewer: initialValues?.reviewer ?? "",
      rating: initialValues?.rating ?? 3,
      strengths: initialValues?.strengths ?? "",
      opportunities: initialValues?.opportunities ?? "",
    }),
    [initialValues]
  );

  const [form, setForm] = useState<ReviewFormValues>(defaults);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(defaults);
  }, [defaults]);

  function handleChange<K extends keyof ReviewFormValues>(key: K, value: ReviewFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (isCreate && form.employeeId <= 0) {
      setError("Seleccione un empleado");
      return;
    }
    if (!form.period.trim()) {
      setError("El período es obligatorio");
      return;
    }
    if (!form.reviewer.trim()) {
      setError("Debe indicar quién evalúa");
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      setError("El rating debe estar entre 1 y 5");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...form,
        period: form.period.trim(),
        reviewer: form.reviewer.trim(),
        strengths: form.strengths.trim(),
        opportunities: form.opportunities.trim(),
      });
      if (isCreate) {
        setForm({
          employeeId: 0,
          period: "",
          reviewer: "",
          rating: 3,
          strengths: "",
          opportunities: "",
        });
      }
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar la evaluación");
    } finally {
      setSubmitting(false);
    }
  }

  const actionLabel = submitLabel ?? (isCreate ? "Crear evaluación" : "Guardar cambios");

  return (
    <Stack
      as="form"
      spacing={4}
      aria-label={isCreate ? "performance-review-create" : "performance-review-edit"}
      onSubmit={handleSubmit}
    >
      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {isCreate ? (
        <FormControl>
          <FormLabel>Empleado</FormLabel>
          <Select
            value={form.employeeId || ""}
            onChange={(e) => handleChange("employeeId", Number(e.target.value))}
            aria-label="review-employee"
            placeholder="Seleccionar..."
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Text fontWeight="semibold">
          Empleado: {employees.find((e) => e.id === form.employeeId)?.name || "Desconocido"}
        </Text>
      )}

      {isCreate && (
        <FormControl>
          <FormLabel>Período (ej. 2024-Q4)</FormLabel>
          <Input
            value={form.period}
            onChange={(e) => handleChange("period", e.target.value)}
            aria-label="review-period"
          />
        </FormControl>
      )}

      <FormControl>
        <FormLabel>Evaluador</FormLabel>
        <Input
          value={form.reviewer}
          onChange={(e) => handleChange("reviewer", e.target.value)}
          aria-label="review-reviewer"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Rating</FormLabel>
        <Select
          value={form.rating}
          onChange={(e) => handleChange("rating", Number(e.target.value))}
          aria-label="review-rating"
        >
          {ratingOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Fortalezas</FormLabel>
        <Textarea
          value={form.strengths}
          onChange={(e) => handleChange("strengths", e.target.value)}
          aria-label="review-strengths"
          rows={3}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Oportunidades</FormLabel>
        <Textarea
          value={form.opportunities}
          onChange={(e) => handleChange("opportunities", e.target.value)}
          aria-label="review-opportunities"
          rows={3}
        />
      </FormControl>

      <Button type="submit" colorScheme="blue" isLoading={submitting} alignSelf="flex-start">
        {actionLabel}
      </Button>
    </Stack>
  );
}

