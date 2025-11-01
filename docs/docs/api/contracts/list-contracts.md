# list_contracts

Retrieve all contract records.

## Description

Returns an array of all contract records in the database.

## Parameters

No parameters required.

## Example

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_contracts",
      "arguments": {}
    }
  }'
```

## Use Cases

### Find Contracts by Producer

```javascript
const contracts = await listContracts();
const producerContracts = contracts.filter(c => 
  c.producerName === 'Green Manufacturing Co.'
);
```

### Find Contract by Waste Code

```javascript
const contracts = await listContracts();
const contract = contracts.find(c => c.wasteCode === 'WC-2025-001');
```

### List All Producers

```javascript
const contracts = await listContracts();
const producers = [...new Set(contracts.map(c => c.producerName))];
```

## Related Operations

- **[create_contract](/api/contracts/create-contract)** - Create new contract
- **[get_contract](/api/contracts/get-contract)** - Get specific contract
- **[update_contract](/api/contracts/update-contract)** - Update contract
- **[delete_contract](/api/contracts/delete-contract)** - Delete contract

