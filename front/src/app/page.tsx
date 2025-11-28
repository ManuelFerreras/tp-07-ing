"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";

const modules = [
  {
    title: "Empleados",
    description: "Altas, edición y tabla consolidada del staff.",
    href: "/employees",
  },
  {
    title: "Evaluaciones de desempeño",
    description: "Registro de ratings, comentarios y estados de revisión.",
    href: "/reviews",
  },
  {
    title: "Nómina",
    description: "Carga de liquidaciones, horas extra y totales por período.",
    href: "/payroll",
  },
];

export default function HomePage() {
  return (
    <Box bg="gray.50" minH="100vh" py={10}>
      <Container maxW="6xl">
        <Stack spacing={6}>
          <Heading size="xl" color="brand.700">
            Gestor integral de RR.HH.
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Centralizá empleados, evaluaciones y nómina en un solo lugar. Elegí un módulo
            para comenzar.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {modules.map((module) => (
              <Card key={module.title} bg="white" shadow="md" borderRadius="lg">
                <CardBody>
                  <Heading size="md" mb={3}>
                    {module.title}
                  </Heading>
                  <Text color="gray.600" mb={5}>
                    {module.description}
                  </Text>
                  <Button as={Link} href={module.href} colorScheme="blue">
                    Ingresar
                  </Button>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}


