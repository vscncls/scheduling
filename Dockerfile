FROM node:14-alpine

RUN addgroup -S app
RUN adduser -S app -G app

WORKDIR /app
RUN chown -R app:app /app
COPY --chown=app:app package.json /app
COPY --chown=app:app package-lock.json /app

USER app:app

RUN npm ci

COPY --chown=app:app . /app

RUN npx tsc

RUN npm prune --production

EXPOSE 8080/tcp

ENTRYPOINT ["npm", "run", "server:run"]
