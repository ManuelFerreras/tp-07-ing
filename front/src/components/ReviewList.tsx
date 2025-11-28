"use client";

import {
  Badge,
  Button,
  HStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from "@chakra-ui/react";
import { PerformanceReview } from "../lib/api";

type Props = {
  reviews: PerformanceReview[];
  onEdit: (review: PerformanceReview) => void;
  onAdvance: (review: PerformanceReview, nextState: string) => void;
  loading?: boolean;
};

const transitionMap: Record<string, { label: string; next: string; color: string }> = {
  draft: { label: "Enviar a revisión", next: "submitted", color: "orange" },
  submitted: { label: "Aprobar", next: "approved", color: "purple" },
};

const stateColors: Record<string, string> = {
  draft: "gray",
  submitted: "orange",
  approved: "green",
};

export default function ReviewList({ reviews, onEdit, onAdvance, loading }: Props) {
  if (!loading && reviews.length === 0) {
    return <Text color="gray.500">No hay evaluaciones registradas.</Text>;
  }

  return (
    <Table variant="simple" size="md">
      <Thead bg="gray.100">
        <Tr>
          <Th>ID</Th>
          <Th>Empleado</Th>
          <Th>Período</Th>
          <Th>Evalúa</Th>
          <Th>Rating</Th>
          <Th>Estado</Th>
          <Th>Acciones</Th>
        </Tr>
      </Thead>
      <Tbody>
        {reviews.map((review) => {
          const transition = transitionMap[review.state];
          return (
            <Tr key={review.id}>
              <Td>{review.id}</Td>
              <Td>{review.employeeName}</Td>
              <Td>{review.period}</Td>
              <Td>{review.reviewer}</Td>
              <Td>{review.rating}</Td>
              <Td>
                <Badge colorScheme={stateColors[review.state] || "gray"} textTransform="capitalize">
                  {review.state}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={3}>
                  <Button size="sm" onClick={() => onEdit(review)}>
                    Editar
                  </Button>
                  {transition ? (
                    <Button
                      size="sm"
                      colorScheme={transition.color}
                      variant="outline"
                      onClick={() => onAdvance(review, transition.next)}
                    >
                      {transition.label}
                    </Button>
                  ) : (
                    <Badge colorScheme="green">Finalizado</Badge>
                  )}
                </HStack>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}


