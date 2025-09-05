## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>

forge script script/CounterScript.s.sol --slow --multi --broadcast --private-key <YOUR_PRIVATE_KEY> --verify
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

### Notes

```sh
# To load the variables in the .env file
source .env
 
# To deploy and verify our contract
forge script --chain sepolia script/Counter.s.sol:CounterScript --rpc-url $SEPOLIA_RPC_URL --broadcast --verify -vvvv --interactives 1

forge script script/PixelGift.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_URL \
  --private-key $TESTNET_OWNER_PK \
  --broadcast \
  --verify -vvvv \
  --etherscan-api-key $ETHERSCAN_API_KEY

forge script script/PixelGift.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_URL \
  --private-key $TESTNET_OWNER_PK \
  --broadcast \
  --verify -vvvv \
  --etherscan-api-key $ETHERSCAN_API_KEY
```
