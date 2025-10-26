# @thinhdang1402/zk-voting

A Zero-Knowledge Voting protocol for EVM-compatible blockchains. This package provides cryptographic primitives and utilities for implementing secure, private voting systems using zero-knowledge proofs and Merkle trees.

## Features

- **Zero-Knowledge Voting**: Implement private voting without revealing individual votes
- **Merkle Tree Integration**: Efficient proof generation and verification
- **EVM Compatible**: Works with Ethereum and other EVM-compatible blockchains
- **TypeScript Support**: Full TypeScript definitions included
- **Cryptographic Security**: Built on proven cryptographic primitives

## Installation

```bash
npm install @thinhdang1402/zk-voting
# or
yarn add @thinhdang1402/zk-voting
```

## Usage

```typescript
import { ZKVoting, MerkleDistributor } from '@thinhdang1402/zk-voting'

// Initialize the voting system
const voting = new ZKVoting()

// Create a Merkle tree for voter distribution
const distributor = new MerkleDistributor(voters)

// Generate proofs and cast votes
const proof = distributor.generateProof(voter)
const vote = voting.castVote(proof, choice)
```

## API Documentation

### Core Classes

- `ZKVoting`: Main voting protocol implementation
- `MerkleDistributor`: Merkle tree management for voter distribution
- `Leaf`: Individual voter leaf node
- `Node`: Merkle tree node structure

### Types

- `Vote`: Vote data structure
- `Proof`: Zero-knowledge proof structure
- `MerkleProof`: Merkle tree proof

## Development

```bash
# Install dependencies
yarn install

# Build the package
yarn build

# Run tests
yarn test:lib
yarn test:contract

# Generate documentation
yarn docs
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
