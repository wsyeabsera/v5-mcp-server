# delete_contract

Delete a contract record from the database.

## Description

Permanently removes a contract record. This operation cannot be undone.

:::warning
Inspections and shipments that reference this contract will have invalid `contractId` or `contract_reference_id` values after deletion.
:::

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the contract to delete |

## Example

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "delete_contract",
      "arguments": {
        "id": "67253e5f6h8i9g005hcdde56"
      }
    }
  }'
```

## Returns

Returns the deleted contract document.

## Safe Deletion

```javascript
async function safeContractDelete(contractId) {
  const inspections = await listInspections();
  const shipments = await listShipments();
  
  const hasInspections = inspections.some(i => i.contract_reference_id === contractId);
  const hasShipments = shipments.some(s => s.contractId === contractId);
  
  if (hasInspections || hasShipments) {
    throw new Error('Cannot delete contract: related records exist');
  }
  
  return await deleteContract(contractId);
}
```

## Related Operations

- **[create_contract](/api/contracts/create-contract)** - Create new contract
- **[get_contract](/api/contracts/get-contract)** - Get contract by ID
- **[list_contracts](/api/contracts/list-contracts)** - List all contracts
- **[update_contract](/api/contracts/update-contract)** - Update contract

