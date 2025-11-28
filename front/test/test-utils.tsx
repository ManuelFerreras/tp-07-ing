"use client";

import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";

const Wrapper = ({ children }: { children: ReactElement }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

export const renderWithProviders = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: Wrapper as React.ComponentType, ...options });

