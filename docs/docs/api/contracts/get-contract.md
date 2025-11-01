# get_contract

Retrieve a single contract record by ID.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the contract |

## Example

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_contract",
      "arguments": {
        "id": "67253e5f6h8i9g005hcdde56"
      }
    }
  }'
```

## Related Operations

- **[create_contract](/api/contracts/create-contract)** - Create new contract
- **[list_contracts](/api/contracts/list-contracts)** - List all contracts
- **[update_contract](/api/contracts/update-contract)** - Update contract
- **[delete_contract](/api/contracts/delete-contract)** - Delete contract

