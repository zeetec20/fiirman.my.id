import { createFileRoute, redirect } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/NotFoundPage";

export const Route = createFileRoute("/$")({
  beforeLoad: ({ params }) => {
    const splat = params._splat?.replace(/^\/+|\/+$/g, "") ?? "";

    if (splat === "portfolio") {
      throw redirect({
        to: "/projects",
        statusCode: 301,
      });
    }

    if (splat === "article") {
      throw redirect({
        to: "/articles",
        statusCode: 301,
      });
    }

    if (splat.startsWith("article/")) {
      const slug = splat.slice("article/".length);
      throw redirect({
        to: "/articles/$slug",
        params: { slug },
        statusCode: 301,
      });
    }
  },
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "404 Not Found // Firman Lestari" },
      {
        name: "description",
        content: "You are lost. Return to the Frontispiece.",
      },
    ],
  }),
  component: NotFoundPage,
});
