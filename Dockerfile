FROM node:alpine AS development
WORKDIR /usr/src/app
COPY . .
RUN npm i -g pnpm
RUN pnpm install
RUN pnpm run build
## stage 2
FROM node:alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm
RUN pnpm install --prod
COPY --from=development /usr/src/app/dist ./dist
CMD ["node", "dist/main"]