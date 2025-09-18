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

# deploy Gift only
forge script script/PixelGift.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_URL \
  --private-key $TESTNET_OWNER_PK \
  --broadcast \
  -vvvv \
  --etherscan-api-key $ETHERSCAN_API_KEY

# deploy gift with new token
forge script script/PixelGiftWithToken.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_URL \
  --private-key $TESTNET_OWNER_PK \
  --broadcast \
  -vvvv \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Verify after deployed

# Token address: 0xAD645091Ac62A9DF5A3a4Fa6046B451c49209C76
# Gift address: 0xb985231d3C7867b5d1330F5d589508FD2e053B60

# 2025/09/18
# Token address: 0x29994B9CfF1BF05b527a206407c29aAE7525D5A0
# Gift address: 0x93f8ab400B201B062eCb794E49d20b643F3D391E

forge verify-contract 0x29994B9CfF1BF05b527a206407c29aAE7525D5A0 src/PixelToken.sol:PixelToken \
  -e $ETHERSCAN_API_KEY \
  -r $BASE_SEPOLIA_URL

forge verify-contract 0x93f8ab400B201B062eCb794E49d20b643F3D391E src/PixelGift.sol:PixelGift \
  -e $ETHERSCAN_API_KEY \
  -r $BASE_SEPOLIA_URL
```

### Test

```sh
forge test PixelGift -vvvv
```

### Subgraph

```sh
graph init --from-contract 0xf875AA3EE0Cc060C5D06813dBD5c78DeC553411A --network base
```
