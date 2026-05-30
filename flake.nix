{
  description = "firmanlestari — TanStack Start on Cloudflare Workers, Bun runtime";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    {
      devShells = nixpkgs.lib.genAttrs
        [
          "aarch64-darwin"
          "x86_64-darwin"
          "x86_64-linux"
          "aarch64-linux"
        ]
        (system:
          let
            pkgs = import nixpkgs { inherit system; };
          in
          {
            default = pkgs.mkShell {
              name = "firmanlestari-shell";

              packages = with pkgs; [
                nodejs_22
                bun
                git
                jq
              ];

              shellHook = ''
                echo "🚀 Node: $(node -v)"
                echo "⚡ Bun: $(bun --version)"
                echo "📂 Project: firmanlestari (portfolio)"
                echo ""
                echo "Commands:"
                echo "  bun install            install deps"
                echo "  bun dev                start dev server (port 3000)"
                echo "  bun run build          production build"
                echo "  bun run typecheck      tsc --noEmit"
                echo "  bun run sync:medium    pull Medium posts"
              '';
            };
          }
        );
    };
}
