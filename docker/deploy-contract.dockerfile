FROM node:18.20.3-bookworm-slim
ARG USER=node
ENV HOME=/home/${USER}
WORKDIR ${HOME}/app/
COPY . .
RUN apt-get update && \
    apt-get install -y build-essential && \
	yarn install && yarn build
ENTRYPOINT sleep 15 && npx hardhat transfer:local-token --network local && sleep 5 && \
	npx hardhat deploy:orochi --network local


