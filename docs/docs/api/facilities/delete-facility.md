# delete_facility

Delete a facility from the database.

## Description

Permanently removes a facility record from the database. Returns the deleted facility document.

:::danger
**Warning**: This operation is permanent and cannot be undone. Related records (contaminants, inspections, shipments) will NOT be automatically deleted and may reference an invalid `facilityId`.
:::

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the facility to delete |

## Returns

Returns the deleted facility document.

## Example

### Request

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "delete_facility",
      "arguments": {
        "id": "67253a1b2e4f5c001d8e9a12"
      }
    }
  }'
```

### Success Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "{\"_id\":\"67253a1b2e4f5c001d8e9a12\",\"name\":\"Central Waste Management Facility\",\"shortCode\":\"CWM-001\",\"location\":\"New York, NY\",\"__v\":0}"
    }]
  },
  "id": 1
}
```

### Not Found Error

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "Facility not found"
    }],
    "isError": true
  },
  "id": 1
}
```

## Safe Deletion Pattern

```javascript
async function safeFacilityDelete(facilityId) {
  // 1. Check if facility has related records
  const contaminants = await listContaminants();
  const inspections = await listInspections();
  const shipments = await listShipments();
  
  const hasContaminants = contaminants.some(c => c.facilityId === facilityId);
  const hasInspections = inspections.some(i => i.facilityId === facilityId);
  const hasShipments = shipments.some(s => s.facilityId === facilityId);
  
  if (hasContaminants || hasInspections || hasShipments) {
    throw new Error('Cannot delete facility: related records exist');
  }
  
  // 2. Safe to delete
  return await deleteFacility(facilityId);
}
```

## Cascade Deletion Pattern

```javascript
async function cascadeDeleteFacility(facilityId) {
  // 1. Delete all related contaminants
  const contaminants = await listContaminants();
  for (const c of contaminants.filter(c => c.facilityId === facilityId)) {
    await deleteContaminant(c._id);
  }
  
  // 2. Delete all related inspections
  const inspections = await listInspections();
  for (const i of inspections.filter(i => i.facilityId === facilityId)) {
    await deleteInspection(i._id);
  }
  
  // 3. Delete all related shipments
  const shipments = await listShipments();
  for (const s of shipments.filter(s => s.facilityId === facilityId)) {
    await deleteShipment(s._id);
  }
  
  // 4. Finally, delete the facility
  return await deleteFacility(facilityId);
}
```

## Best Practices

1. **Check for Dependencies**: Verify no records reference this facility
2. **Backup First**: Save facility data before deletion
3. **Use Transactions**: For cascade deletions (requires MongoDB 4.0+)
4. **Soft Delete Alternative**: Consider adding `deleted: true` flag instead

## Related Operations

- **[create_facility](/api/facilities/create-facility)** - Create a new facility
- **[get_facility](/api/facilities/get-facility)** - Get facility details
- **[list_facilities](/api/facilities/list-facilities)** - List all facilities
- **[update_facility](/api/facilities/update-facility)** - Update facility

