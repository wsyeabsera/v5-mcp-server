# Common Workflows

This guide demonstrates common real-world workflows for the Waste Management MCP Server.

## Workflow 1: Complete Shipment Processing

This workflow tracks a waste shipment from arrival to inspection.

### Steps

1. **Create or Get Facility**
2. **Create or Get Contract**
3. **Record Shipment Arrival**
4. **Perform Inspection**
5. **Record Contaminants (if any)**

### Implementation

```javascript
async function processShipment() {
  // 1. Ensure facility exists
  const facility = await createFacility({
    name: "Central Processing Center",
    shortCode: "CPC-001",
    location: "New York, NY"
  });
  
  // 2. Ensure contract exists
  const contract = await createContract({
    producerName: "Green Manufacturing Co.",
    debitorName: "Central Processing Center",
    wasteCode: "WC-2025-001"
  });
  
  // 3. Record shipment
  const shipment = await createShipment({
    entry_timestamp: new Date().toISOString(),
    exit_timestamp: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    source: "Green Manufacturing - Building A",
    facilityId: facility._id,
    license_plate: "ABC-1234",
    contract_reference_id: contract.wasteCode,
    contractId: contract._id
  });
  
  // 4. Perform inspection
  const inspection = await createInspection({
    facilityId: facility._id,
    Is_delivery_accepted: true,
    does_delivery_meets_conditions: true,
    selected_wastetypes: [
      { category: "Municipal Solid Waste", percentage: "60" },
      { category: "Commercial Waste", percentage: "40" }
    ],
    heating_value_calculation: 12500,
    waste_producer: contract.producerName,
    contract_reference_id: contract.wasteCode
  });
  
  // 5. Record contaminant (if detected)
  const contaminant = await createContaminant({
    wasteItemDetected: "Lithium-ion battery pack",
    material: "Battery cells",
    facilityId: facility._id,
    detection_time: new Date().toISOString(),
    explosive_level: "high",
    hcl_level: "low",
    so2_level: "low",
    estimated_size: 0.3,
    shipment_id: shipment._id
  });
  
  return {
    facility,
    contract,
    shipment,
    inspection,
    contaminant
  };
}
```

## Workflow 2: Daily Operations Report

Generate a daily summary of all operations.

### Steps

1. **Fetch All Shipments**
2. **Fetch All Inspections**
3. **Fetch All Contaminants**
4. **Aggregate and Format**

### Implementation

```javascript
async function generateDailyReport(date = new Date()) {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();
  
  // Fetch all data
  const shipments = await listShipments();
  const inspections = await listInspections();
  const contaminants = await listContaminants();
  
  // Filter by date
  const todayShipments = shipments.filter(s => 
    s.entry_timestamp >= startOfDay && s.entry_timestamp <= endOfDay
  );
  
  const todayInspections = inspections.filter(i =>
    // Assuming inspections have timestamps
    todayShipments.some(s => s.facilityId === i.facilityId)
  );
  
  const todayContaminants = contaminants.filter(c =>
    c.detection_time >= startOfDay && c.detection_time <= endOfDay
  );
  
  // Calculate statistics
  const report = {
    date: date.toISOString().split('T')[0],
    shipments: {
      total: todayShipments.length,
      avgDuration: calculateAverageDuration(todayShipments)
    },
    inspections: {
      total: todayInspections.length,
      accepted: todayInspections.filter(i => i.Is_delivery_accepted).length,
      rejected: todayInspections.filter(i => !i.Is_delivery_accepted).length
    },
    contaminants: {
      total: todayContaminants.length,
      highRisk: todayContaminants.filter(c => 
        c.explosive_level === 'high' || 
        c.hcl_level === 'high' || 
        c.so2_level === 'high'
      ).length
    }
  };
  
  return report;
}

function calculateAverageDuration(shipments) {
  const durations = shipments.map(s => {
    const entry = new Date(s.entry_timestamp);
    const exit = new Date(s.exit_timestamp);
    return (exit - entry) / 60000; // minutes
  });
  
  return durations.reduce((a, b) => a + b, 0) / durations.length;
}
```

## Workflow 3: Compliance Checking

Check if deliveries meet contract conditions.

### Steps

1. **Get Contract Requirements**
2. **Get Recent Inspections**
3. **Validate Compliance**
4. **Generate Report**

### Implementation

```javascript
async function checkCompliance(contractId) {
  // Get contract details
  const contract = await getContract(contractId);
  
  // Get related inspections
  const allInspections = await listInspections();
  const contractInspections = allInspections.filter(i => 
    i.contract_reference_id === contract.wasteCode
  );
  
  // Analyze compliance
  const complianceReport = {
    contract: contract.wasteCode,
    producer: contract.producerName,
    totalInspections: contractInspections.length,
    compliant: contractInspections.filter(i => i.does_delivery_meets_conditions).length,
    nonCompliant: contractInspections.filter(i => !i.does_delivery_meets_conditions).length,
    acceptanceRate: (
      contractInspections.filter(i => i.Is_delivery_accepted).length / 
      contractInspections.length * 100
    ).toFixed(2) + '%',
    issues: contractInspections
      .filter(i => !i.does_delivery_meets_conditions)
      .map(i => ({
        date: i.createdAt || 'Unknown',
        facilityId: i.facilityId,
        accepted: i.Is_delivery_accepted
      }))
  };
  
  return complianceReport;
}
```

## Workflow 4: Hazard Alert System

Monitor and alert on high-risk contaminants.

### Implementation

```javascript
async function monitorHazards() {
  const contaminants = await listContaminants();
  
  // Classify by risk level
  const highRisk = contaminants.filter(c => 
    c.explosive_level === 'high' || 
    c.hcl_level === 'high' || 
    c.so2_level === 'high'
  );
  
  // Get facility details for each
  const alerts = await Promise.all(
    highRisk.map(async (c) => {
      const facility = await getFacility(c.facilityId);
      return {
        alert: 'HIGH RISK CONTAMINANT DETECTED',
        facility: facility.name,
        item: c.wasteItemDetected,
        material: c.material,
        risks: {
          explosive: c.explosive_level,
          hcl: c.hcl_level,
          so2: c.so2_level
        },
        size: c.estimated_size,
        detected: c.detection_time,
        action: 'Immediate isolation and assessment required'
      };
    })
  );
  
  return alerts;
}
```

## Workflow 5: Facility Performance Analysis

Analyze performance metrics for all facilities.

### Implementation

```javascript
async function analyzeFacilityPerformance() {
  const facilities = await listFacilities();
  const inspections = await listInspections();
  const contaminants = await listContaminants();
  const shipments = await listShipments();
  
  const performance = facilities.map(facility => {
    const facilityInspections = inspections.filter(i => 
      i.facilityId === facility._id
    );
    
    const facilityContaminants = contaminants.filter(c => 
      c.facilityId === facility._id
    );
    
    const facilityShipments = shipments.filter(s => 
      s.facilityId === facility._id
    );
    
    return {
      facility: facility.name,
      shortCode: facility.shortCode,
      metrics: {
        totalShipments: facilityShipments.length,
        totalInspections: facilityInspections.length,
        acceptanceRate: (
          facilityInspections.filter(i => i.Is_delivery_accepted).length / 
          facilityInspections.length * 100
        ).toFixed(2) + '%',
        contaminantsDetected: facilityContaminants.length,
        highRiskContaminants: facilityContaminants.filter(c => 
          c.explosive_level === 'high' || 
          c.hcl_level === 'high' || 
          c.so2_level === 'high'
        ).length
      }
    };
  });
  
  return performance;
}
```

## Workflow 6: Data Export

Export data in various formats for reporting.

### CSV Export

```javascript
function exportToCSV(data, filename) {
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(','),
    ...data.map(row => keys.map(key => {
      const value = row[key];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(','))
  ].join('\n');
  
  return csv;
}

// Usage
const facilities = await listFacilities();
const csv = exportToCSV(facilities, 'facilities.csv');
```

### JSON Report

```javascript
async function generateJSONReport() {
  const [facilities, contracts, shipments, inspections, contaminants] = 
    await Promise.all([
      listFacilities(),
      listContracts(),
      listShipments(),
      listInspections(),
      listContaminants()
    ]);
  
  return {
    generated: new Date().toISOString(),
    summary: {
      totalFacilities: facilities.length,
      totalContracts: contracts.length,
      totalShipments: shipments.length,
      totalInspections: inspections.length,
      totalContaminants: contaminants.length
    },
    data: {
      facilities,
      contracts,
      shipments,
      inspections,
      contaminants
    }
  };
}
```

## Best Practices

### 1. Error Handling

Always wrap operations in try-catch:

```javascript
async function safeOperation() {
  try {
    const result = await createFacility({...});
    return { success: true, data: result };
  } catch (error) {
    console.error('Operation failed:', error);
    return { success: false, error: error.message };
  }
}
```

### 2. Validation

Validate before creating related records:

```javascript
async function createRelatedRecords(facilityId, contractId) {
  // Verify both exist
  const [facility, contract] = await Promise.all([
    getFacility(facilityId),
    getContract(contractId)
  ]);
  
  if (!facility || !contract) {
    throw new Error('Parent records not found');
  }
  
  // Proceed with creation
  return await createShipment({...});
}
```

### 3. Batch Operations

Use Promise.all for parallel operations:

```javascript
// Create multiple facilities at once
const facilitiesData = [
  { name: "Facility A", shortCode: "FA-001", location: "City A" },
  { name: "Facility B", shortCode: "FB-002", location: "City B" },
  { name: "Facility C", shortCode: "FC-003", location: "City C" }
];

const facilities = await Promise.all(
  facilitiesData.map(data => createFacility(data))
);
```

## Next Steps

- **[Error Handling Guide](/guides/error-handling)** - Handle errors gracefully
- **[Best Practices](/guides/best-practices)** - Production tips
- **[Examples](/examples/complete-workflows)** - More detailed examples

---

**Need help?** Check [Troubleshooting](/troubleshooting/common-issues).

