FROM node:18.20.3-bookworm-slim
ARG USER=node
ENV HOME=/home/${USER}
WORKDIR ${HOME}/app/
COPY . .
RUN apt-get update && \
    apt-get install -y build-essential && \
	yarn install && yarn build
ENTRYPOINT npx hardhat generate:local-operator && \
	npx hardhat node


