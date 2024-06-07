FROM node:18.20.3-bookworm-slim
ARG USER=node
ENV HOME=/home/${USER}
WORKDIR ${HOME}/app/
COPY . .
RUN apt-get update && \
    apt-get install -y build-essential && \
	yarn install && yarn build
	# &&  ls -al && \
	# npx hardhat node > ./output/node.log && \
	# echo "MASTER_ACCOUNT=$(grep "Account #0:" ./output/node.log | awk '{print $3}')" && \
	# echo "MASTER_PRIVATE_KEY=$(grep "Private Key:" ./output/node.log | awk '{print $3}')"
ENTRYPOINT npx hardhat generate:local-operator && \
	npx hardhat node


