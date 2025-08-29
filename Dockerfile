FROM node:24-alpine AS build

LABEL org.opencontainers.image.source=https://github.com/Ionaru/framboos-2025-frontend

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack pnpm install --frozen-lockfile

COPY tsconfig.json tsconfig.app.json angular.json .postcssrc.json ./
COPY src ./src

RUN corepack pnpm run build


FROM nginx:mainline-alpine AS serve

COPY deploy/nginx.conf /etc/nginx/conf.d
RUN mkdir /etc/nginx/conf.d/proxy
COPY deploy/nginx-proxy.conf /etc/nginx/conf.d/proxy
RUN rm /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/byte-brawl/browser /app/browser