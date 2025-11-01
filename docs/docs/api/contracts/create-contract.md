# create_contract

Create a new contract agreement.

## Description

Creates a contract record defining an agreement between a waste producer and a facility/debtor, including a unique waste code identifier.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `producerName` | string | Yes | Name of the company producing the waste |
| `debitorName` | string | Yes | Name of the facility or company responsible for payment |
| `wasteCode` | string | Yes | Unique waste type/contract identifier code |

## Example Request

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_contract",
      "arguments": {
        "producerName": "Green Manufacturing Co.",
        "debitorName": "Central Waste Management Facility",
        "wasteCode": "WC-2025-001"
      }
    }
  }'
```

## Example Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "{\"_id\":\"67253e5f6h8i9g005hcdde56\",\"producerName\":\"Green Manufacturing Co.\",\"debitorName\":\"Central Waste Management Facility\",\"wasteCode\":\"WC-2025-001\",\"__v\":0}"
    }]
  },
  "id": 1
}
```

## Waste Code Format

The `wasteCode` is a unique identifier for the contract. Common formats:

- `WC-YYYY-NNN` (e.g., `WC-2025-001`)
- `CONTRACT-YYYY-PRODUCER-NNN` (e.g., `CONTRACT-2025-GREEN-001`)
- `WASTE-CODE-NNN` (e.g., `WASTE-CODE-042`)

:::tip
Use a consistent naming convention across your organization for easier tracking and reference.
:::

## Best Practices

### 1. Unique Waste Codes

```javascript
async function createContractWithUniqueCode(contractData) {
  const contracts = await listContracts();
  const exists = contracts.some(c => c.wasteCode === contractData.wasteCode);
  
  if (exists) {
    throw new Error(`Contract with wasteCode ${contractData.wasteCode} already exists`);
  }
  
  return await createContract(contractData);
}
```

### 2. Full Company Names

```javascript
// Good
producerName: "Green Manufacturing Corporation"
debitorName: "Central Waste Management Facility LLC"

// Less useful
producerName: "Green Co."
debitorName: "Central"
```

### 3. Save Contract ID for References

```javascript
const contract = await createContract({
  producerName: "Green Manufacturing Co.",
  debitorName: "Central Waste Facility",
  wasteCode: "WC-2025-001"
});

// Use this ID in shipments and inspections
const contractId = contract._id;
const contractRef = contract.wasteCode;
```

## Related Operations

- **[get_contract](/api/contracts/get-contract)** - Get contract by ID
- **[list_contracts](/api/contracts/list-contracts)** - List all contracts
- **[update_contract](/api/contracts/update-contract)** - Update contract
- **[delete_contract](/api/contracts/delete-contract)** - Delete contract

## Related Records

Once you've created a contract, you can:

- Create **inspections** referencing this contract
- Create **shipments** linked to this contract

