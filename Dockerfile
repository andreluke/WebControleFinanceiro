FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-workspace.yaml ./
COPY web/package.json web/pnpm-lock.yaml ./
RUN pnpm install

COPY web/ .
RUN pnpm build

EXPOSE 5173

CMD ["pnpm", "preview", "--", "--host", "0.0.0.0"]
