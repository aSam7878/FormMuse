# Preflight Base UI installations

Every Template Page will show a compact Installation Preflight before CLI and Manual Installation. The supported target is a React and TypeScript project using Tailwind CSS 4 with shadcn configured for Base UI. If shadcn has not been initialized, FormMuse will show package-manager-specific commands using `shadcn@latest init --base base`, after which the adopter runs the separate FormMuse registry-item installation command.

If the target project already uses Radix, FormMuse will clearly state that Radix is unsupported in V1 and will not automatically migrate, replace, or reconfigure the project's component foundation. `shadcn info` is recommended for coding agents and troubleshooting because it exposes project configuration, but it is not a mandatory step for every human installation.
