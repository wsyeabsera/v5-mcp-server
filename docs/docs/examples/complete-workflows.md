# Complete Workflows

Real-world, end-to-end examples for common waste management scenarios.

## Example 1: New Shipment Processing

A waste shipment arrives at a facility. This workflow tracks it from arrival to completion.

### Scenario

- **Facility**: Central Processing Center (existing)
- **Producer**: Green Manufacturing Co.
- **Shipment**: Municipal solid waste, 60% MSW / 40% commercial
- **Issue**: Battery detected during unloading

### Step-by-Step

#### 1. Create Facility (if new)

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_facility",
      "arguments": {
        "name": "Central Processing Center",
        "shortCode": "CPC-001",
        "location": "123 Industrial Way, New York, NY 10001"
      }
    }
  }'
```

**Response**: Save `_id` as `FACILITY_ID`

#### 2. Create Contract

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "create_contract",
      "arguments": {
        "producerName": "Green Manufacturing Co.",
        "debitorName": "Central Processing Center",
        "wasteCode": "WC-2025-GREEN-001"
      }
    }
  }'
```

**Response**: Save `_id` as `CONTRACT_ID`

#### 3. Record Shipment Arrival

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "create_shipment",
      "arguments": {
        "entry_timestamp": "2025-11-01T08:00:00.000Z",
        "exit_timestamp": "2025-11-01T08:45:00.000Z",
        "source": "Green Manufacturing Co. - Building A",
        "facilityId": "FACILITY_ID",
        "license_plate": "NY-WASTE-1234",
        "contract_reference_id": "WC-2025-GREEN-001",
        "contractId": "CONTRACT_ID"
      }
    }
  }'
```

**Response**: Save `_id` as `SHIPMENT_ID`

#### 4. Perform Inspection

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "create_inspection",
      "arguments": {
        "facilityId": "FACILITY_ID",
        "Is_delivery_accepted": true,
        "does_delivery_meets_conditions": true,
        "selected_wastetypes": [
          {"category": "Municipal Solid Waste", "percentage": "60"},
          {"category": "Commercial Waste", "percentage": "40"}
        ],
        "heating_value_calculation": 12500,
        "waste_producer": "Green Manufacturing Co.",
        "contract_reference_id": "WC-2025-GREEN-001"
      }
    }
  }'
```

#### 5. Report Contaminant

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "create_contaminant",
      "arguments": {
        "wasteItemDetected": "Lithium-ion battery pack from consumer electronics",
        "material": "Lithium-ion battery cells with electrolyte",
        "facilityId": "FACILITY_ID",
        "detection_time": "2025-11-01T08:30:00.000Z",
        "explosive_level": "high",
        "hcl_level": "low",
        "so2_level": "low",
        "estimated_size": 0.5,
        "shipment_id": "SHIPMENT_ID"
      }
    }
  }'
```

### Result

Complete tracking of shipment from arrival to contaminant detection.

---

## Example 2: Daily Operations Report

Generate a comprehensive daily report of all operations.

### JavaScript Implementation

```javascript
async function generateDailyReport() {
  console.log('Generating Daily Report...\n');
  
  // 1. Fetch all data
  const [facilities, contracts, shipments, inspections, contaminants] = 
    await Promise.all([
      callTool('list_facilities', {}),
      callTool('list_contracts', {}),
      callTool('list_shipments', {}),
      callTool('list_inspections', {}),
      callTool('list_contaminants', {})
    ]);
  
  // 2. Filter today's data
  const today = new Date().toISOString().split('T')[0];
  
  const todayShipments = shipments.filter(s => 
    s.entry_timestamp.startsWith(today)
  );
  
  const todayContaminants = contaminants.filter(c => 
    c.detection_time && c.detection_time.startsWith(today)
  );
  
  // 3. Calculate statistics
  const acceptedInspections = inspections.filter(i => i.Is_delivery_accepted);
  const rejectedInspections = inspections.filter(i => !i.Is_delivery_accepted);
  
  const highRiskContaminants = todayContaminants.filter(c => 
    c.explosive_level === 'high' || 
    c.hcl_level === 'high' || 
    c.so2_level === 'high'
  );
  
  // 4. Generate report
  const report = {
    date: today,
    summary: {
      totalFacilities: facilities.length,
      activeContracts: contracts.length,
      shipmentsProcessed: todayShipments.length,
      inspectionsCompleted: inspections.length,
      contaminantsDetected: todayContaminants.length
    },
    performance: {
      acceptanceRate: `${(acceptedInspections.length / inspections.length * 100).toFixed(1)}%`,
      rejectionRate: `${(rejectedInspections.length / inspections.length * 100).toFixed(1)}%`
    },
    alerts: {
      highRiskContaminants: highRiskContaminants.length,
      items: highRiskContaminants.map(c => ({
        item: c.wasteItemDetected,
        facility: c.facilityId,
        time: c.detection_time
      }))
    }
  };
  
  console.log(JSON.stringify(report, null, 2));
  return report;
}
```

### Output Example

```json
{
  "date": "2025-11-01",
  "summary": {
    "totalFacilities": 5,
    "activeContracts": 12,
    "shipmentsProcessed": 8,
    "inspectionsCompleted": 8,
    "contaminantsDetected": 3
  },
  "performance": {
    "acceptanceRate": "87.5%",
    "rejectionRate": "12.5%"
  },
  "alerts": {
    "highRiskContaminants": 1,
    "items": [
      {
        "item": "Lithium-ion battery pack",
        "facility": "67253a1b2e4f5c001d8e9a12",
        "time": "2025-11-01T08:30:00.000Z"
      }
    ]
  }
}
```

---

## Example 3: Compliance Audit

Audit all contracts for compliance with delivery conditions.

### Python Implementation

```python
import requests
import json
from datetime import datetime

def audit_compliance():
    base_url = 'http://localhost:3000/sse'
    
    # Fetch all contracts
    contracts_response = requests.post(
        base_url,
        json={
            'jsonrpc': '2.0',
            'id': 1,
            'method': 'tools/call',
            'params': {
                'name': 'list_contracts',
                'arguments': {}
            }
        }
    )
    
    contracts = json.loads(
        contracts_response.json()['result']['content'][0]['text']
    )
    
    # Fetch all inspections
    inspections_response = requests.post(
        base_url,
        json={
            'jsonrpc': '2.0',
            'id': 2,
            'method': 'tools/call',
            'params': {
                'name': 'list_inspections',
                'arguments': {}
            }
        }
    )
    
    inspections = json.loads(
        inspections_response.json()['result']['content'][0]['text']
    )
    
    # Audit each contract
    audit_results = []
    
    for contract in contracts:
        contract_inspections = [
            i for i in inspections 
            if i['contract_reference_id'] == contract['wasteCode']
        ]
        
        if len(contract_inspections) == 0:
            continue
        
        compliant = sum(
            1 for i in contract_inspections 
            if i['does_delivery_meets_conditions']
        )
        
        total = len(contract_inspections)
        compliance_rate = (compliant / total * 100) if total > 0 else 0
        
        audit_results.append({
            'contract': contract['wasteCode'],
            'producer': contract['producerName'],
            'totalInspections': total,
            'compliantDeliveries': compliant,
            'complianceRate': f"{compliance_rate:.1f}%",
            'status': 'PASS' if compliance_rate >= 95 else 'WARN' if compliance_rate >= 85 else 'FAIL'
        })
    
    # Print audit report
    print("\\n=== COMPLIANCE AUDIT REPORT ===\\n")
    for result in audit_results:
        print(f"Contract: {result['contract']}")
        print(f"Producer: {result['producer']}")
        print(f"Compliance Rate: {result['complianceRate']}")
        print(f"Status: {result['status']}")
        print("-" * 50)
    
    return audit_results

if __name__ == '__main__':
    audit_compliance()
```

---

## Example 4: Hazard Monitoring System

Real-time monitoring for high-risk contaminants.

### Implementation

```javascript
async function monitorHazards() {
  console.log('🚨 Starting Hazard Monitor...\n');
  
  // Fetch all contaminants
  const contaminants = await callTool('list_contaminants', {});
  
  // Classify by risk level
  const hazards = contaminants.map(c => {
    let riskScore = 0;
    if (c.explosive_level === 'high') riskScore += 3;
    else if (c.explosive_level === 'medium') riskScore += 2;
    else riskScore += 1;
    
    if (c.hcl_level === 'high') riskScore += 3;
    else if (c.hcl_level === 'medium') riskScore += 2;
    else riskScore += 1;
    
    if (c.so2_level === 'high') riskScore += 3;
    else if (c.so2_level === 'medium') riskScore += 2;
    else riskScore += 1;
    
    return { ...c, riskScore };
  });
  
  // Sort by risk score
  hazards.sort((a, b) => b.riskScore - a.riskScore);
  
  // Alert on high-risk items
  const highRisk = hazards.filter(h => h.riskScore >= 7);
  
  if (highRisk.length > 0) {
    console.log(`⚠️  ${highRisk.length} HIGH RISK CONTAMINANTS DETECTED\\n`);
    
    for (const item of highRisk) {
      console.log(`🔴 ALERT: ${item.wasteItemDetected}`);
      console.log(`   Material: ${item.material}`);
      console.log(`   Risk Score: ${item.riskScore}/9`);
      console.log(`   Explosive: ${item.explosive_level.toUpperCase()}`);
      console.log(`   HCl: ${item.hcl_level.toUpperCase()}`);
      console.log(`   SO2: ${item.so2_level.toUpperCase()}`);
      console.log(`   Size: ${item.estimated_size} m³`);
      console.log(`   Action: IMMEDIATE ISOLATION REQUIRED\\n`);
    }
  } else {
    console.log('✅ No high-risk contaminants detected');
  }
  
  return highRisk;
}

// Run monitoring every 5 minutes
setInterval(monitorHazards, 5 * 60 * 1000);
```

---

## Example 5: Bulk Data Import

Import facilities from CSV file.

### Implementation

```javascript
import fs from 'fs';
import csv from 'csv-parser';

async function importFacilitiesFromCSV(filename) {
  const facilities = [];
  
  // Read CSV file
  return new Promise((resolve, reject) => {
    fs.createReadStream(filename)
      .pipe(csv())
      .on('data', (row) => {
        facilities.push({
          name: row.name,
          shortCode: row.shortCode,
          location: row.location
        });
      })
      .on('end', async () => {
        console.log(`Importing ${facilities.length} facilities...`);
        
        // Create all facilities
        const results = {
          successful: [],
          failed: []
        };
        
        for (const facility of facilities) {
          try {
            const result = await callTool('create_facility', facility);
            results.successful.push(facility.shortCode);
            console.log(`✓ Created: ${facility.shortCode}`);
          } catch (error) {
            results.failed.push({
              shortCode: facility.shortCode,
              error: error.message
            });
            console.log(`✗ Failed: ${facility.shortCode}`);
          }
        }
        
        console.log(`\\nImport complete:`);
        console.log(`  Successful: ${results.successful.length}`);
        console.log(`  Failed: ${results.failed.length}`);
        
        resolve(results);
      })
      .on('error', reject);
  });
}

// Usage
importFacilitiesFromCSV('facilities.csv');
```

**facilities.csv**:
```csv
name,shortCode,location
Central Processing,CPC-001,"New York, NY"
North Regional,NRC-002,"Seattle, WA"
South Processing,SPC-003,"Miami, FL"
```

---

## More Examples

For additional examples:

- **[API Reference](/api/overview)** - Detailed tool documentation
- **[Guides](/guides/workflows)** - Common patterns
- **[Troubleshooting](/troubleshooting/common-issues)** - Debug examples

---

**Want to contribute an example?** Submit a pull request on GitHub!

