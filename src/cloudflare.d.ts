declare module "cloudflare:workers" {
  export const env: {
    GITHUB_ACTIVITY_KV?: import("@cloudflare/workers-types").KVNamespace;
    [key: string]: unknown;
  };
}
