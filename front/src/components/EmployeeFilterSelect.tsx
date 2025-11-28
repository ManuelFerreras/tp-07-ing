"use client";

import { Box, Select, Text } from "@chakra-ui/react";
import { Employee } from "../lib/api";

type Props = {
  employees: Employee[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export default function EmployeeFilterSelect({ employees, value, onChange, label = "Empleado" }: Props) {
  return (
    <Box flex={1}>
      <Text fontWeight="semibold" mb={1}>
        {label}
      </Text>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Todos</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name}
          </option>
        ))}
      </Select>
    </Box>
  );
}

