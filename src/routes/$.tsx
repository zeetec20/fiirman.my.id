import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/NotFoundPage";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "404 Not Found // Firman Lestari" },
      {
        name: "description",
        content: "You are lost. Return to the Frontispiece.",
      },
    ],
  }),
  component: NotFoundPage,
});
