"use client";

import { useInitData } from "@/lib/use-init-data";

/**
 * Invisible component that runs the data initialization hook.
 * Mounted at the root layout level so it runs on every page.
 */
export function DataInitializer() {
  useInitData();
  return null;
}
