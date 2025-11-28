"use client";

import { Card, CardBody, Heading, Stack, StackProps } from "@chakra-ui/react";
import { ReactNode } from "react";

type FiltersCardProps = {
  children: ReactNode;
  stackProps?: StackProps;
};

export default function FiltersCard({ children, stackProps }: FiltersCardProps) {
  return (
    <Card>
      <CardBody>
        <Heading size="md" mb={4}>
          Filtros
        </Heading>
        <Stack direction={{ base: "column", md: "row" }} spacing={4} {...stackProps}>
          {children}
        </Stack>
      </CardBody>
    </Card>
  );
}

