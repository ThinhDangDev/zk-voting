build:
	npx hardhat compile
.PHONY: build

deploy:
	make build & npx hardhat run scripts/deploy.ts
.PHONY: deploy

test:
	make build & npx hardhat test
.PHONY: test
