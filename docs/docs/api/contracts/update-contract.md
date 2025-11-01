# update_contract

Update an existing contract record.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the contract to update |
| `producerName` | string | No | New producer name |
| `debitorName` | string | No | New debitor name |
| `wasteCode` | string | No | New waste code |

At least one update field must be provided.

## Example

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "update_contract",
      "arguments": {
        "id": "67253e5f6h8i9g005hcdde56",
        "debitorName": "Regional Waste Management Facility"
      }
    }
  }'
```

## Related Operations

- **[create_contract](/api/contracts/create-contract)** - Create new contract
- **[get_contract](/api/contracts/get-contract)** - Get contract by ID
- **[list_contracts](/api/contracts/list-contracts)** - List all contracts
- **[delete_contract](/api/contracts/delete-contract)** - Delete contract

