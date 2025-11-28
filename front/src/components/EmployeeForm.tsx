"use client";

import { useState, FormEvent, useEffect } from "react";
import { Button, FormControl, FormLabel, Input, Stack, Alert, AlertIcon } from "@chakra-ui/react";

type Props = Readonly<{
  initialName?: string;
  onSubmit: (name: string) => Promise<void> | void;
  submitLabel?: string;
  error?: string | null;
}>;

export default function EmployeeForm({ initialName, onSubmit, submitLabel, error }: Readonly<Props>) {
  const [name, setName] = useState<string>(initialName || "");
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(initialName || "");
  }, [initialName]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError("Name is required");
      return;
    }
    setLocalError(null);
    setLoading(true);
    try {
      await onSubmit(trimmed);
      setName("");
    } catch (err: any) {
      setLocalError(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack as="form" onSubmit={handleSubmit} aria-label="employee-form" spacing={3}>
      <FormControl>
        <FormLabel htmlFor="employee-name">Nombre</FormLabel>
        <Input
          id="employee-name"
          aria-label="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Ana Pérez"
        />
      </FormControl>
      <Button type="submit" colorScheme="blue" isLoading={loading} alignSelf="flex-start">
        {submitLabel || "Guardar"}
      </Button>
      {(localError || error) && (
        <Alert status="error" borderRadius="md" role="alert">
          <AlertIcon />
          {localError || error}
        </Alert>
      )}
    </Stack>
  );
}


