import { Facility, Contaminant, Inspection, Shipment, Contract } from '../models/index.js';

// Define available static resources
export const resources = {
  'facility://list': {
    uri: 'facility://list',
    name: 'All Facilities',
    description: 'List of all waste management facilities',
    mimeType: 'application/json'
  },
  
  'stats://overview': {
    uri: 'stats://overview',
    name: 'System Overview Statistics',
    description: 'Overall statistics for facilities, contaminants, inspections, and shipments',
    mimeType: 'application/json'
  },

  'activity://recent': {
    uri: 'activity://recent',
    name: 'Recent Activity',
    description: 'Recent inspections, shipments, and contamination detections (last 10 of each)',
    mimeType: 'application/json'
  },

  'contaminant://summary': {
    uri: 'contaminant://summary',
    name: 'Contamination Summary',
    description: 'Summary of contamination levels across all facilities',
    mimeType: 'application/json'
  }
};

// Handler to read resource content
export async function readResource(uri: string) {
  // Static resource: All facilities
  if (uri === 'facility://list') {
    const facilities = await Facility.find().select('name shortCode location createdAt').lean();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            total: facilities.length,
            facilities: facilities
          }, null, 2)
        }
      ]
    };
  }

  // Static resource: System statistics
  if (uri === 'stats://overview') {
    const [facilityCount, contaminantCount, inspectionCount, shipmentCount, contractCount] = 
      await Promise.all([
        Facility.countDocuments(),
        Contaminant.countDocuments(),
        Inspection.countDocuments(),
        Shipment.countDocuments(),
        Contract.countDocuments()
      ]);

    // Get additional statistics
    const recentInspections = await Inspection.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const acceptedInspections = await Inspection.countDocuments({
      is_delivery_accepted: true
    });

    const acceptanceRate = inspectionCount > 0 
      ? ((acceptedInspections / inspectionCount) * 100).toFixed(2)
      : '0.00';

    const stats = {
      overview: {
        facilities: facilityCount,
        contaminants: contaminantCount,
        inspections: inspectionCount,
        shipments: shipmentCount,
        contracts: contractCount
      },
      metrics: {
        inspectionsLast30Days: recentInspections,
        overallAcceptanceRate: `${acceptanceRate}%`
      },
      timestamp: new Date().toISOString()
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(stats, null, 2)
        }
      ]
    };
  }

  // Static resource: Recent activity
  if (uri === 'activity://recent') {
    const [recentInspections, recentShipments, recentContaminants] = await Promise.all([
      Inspection.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('facility_id', 'name shortCode')
        .lean(),
      Shipment.find()
        .sort({ entry_timestamp: -1 })
        .limit(10)
        .populate('facilityId', 'name shortCode')
        .lean(),
      Contaminant.find()
        .sort({ detection_time: -1 })
        .limit(10)
        .populate('facilityId', 'name shortCode')
        .lean()
    ]);

    const activity = {
      recentInspections,
      recentShipments,
      recentContaminants,
      timestamp: new Date().toISOString()
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(activity, null, 2)
        }
      ]
    };
  }

  // Static resource: Contamination summary
  if (uri === 'contaminant://summary') {
    const contaminants = await Contaminant.find().lean();
    
    const summary = {
      total: contaminants.length,
      byLevel: {
        explosive: {
          low: contaminants.filter(c => c.explosive_level === 'low').length,
          medium: contaminants.filter(c => c.explosive_level === 'medium').length,
          high: contaminants.filter(c => c.explosive_level === 'high').length
        },
        hcl: {
          low: contaminants.filter(c => c.hcl_level === 'low').length,
          medium: contaminants.filter(c => c.hcl_level === 'medium').length,
          high: contaminants.filter(c => c.hcl_level === 'high').length
        },
        so2: {
          low: contaminants.filter(c => c.so2_level === 'low').length,
          medium: contaminants.filter(c => c.so2_level === 'medium').length,
          high: contaminants.filter(c => c.so2_level === 'high').length
        }
      },
      byMaterial: contaminants.reduce((acc, c) => {
        acc[c.material] = (acc[c.material] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      timestamp: new Date().toISOString()
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(summary, null, 2)
        }
      ]
    };
  }

  // Dynamic resource: Individual facility by ID
  const facilityMatch = uri.match(/^facility:\/\/([a-f0-9]{24})$/);
  if (facilityMatch) {
    const facilityId = facilityMatch[1];
    const facility = await Facility.findById(facilityId).lean();
    
    if (!facility) {
      throw new Error('Facility not found');
    }
    
    // Get related data for the facility
    const [contaminants, inspections, shipments] = await Promise.all([
      Contaminant.find({ facilityId }).sort({ detection_time: -1 }).limit(20).lean(),
      Inspection.find({ facility_id: facilityId }).sort({ createdAt: -1 }).limit(20).lean(),
      Shipment.find({ facilityId }).sort({ entry_timestamp: -1 }).limit(20).lean()
    ]);

    // Calculate facility-specific metrics
    const acceptedInspections = inspections.filter(i => i.is_delivery_accepted).length;
    const acceptanceRate = inspections.length > 0
      ? ((acceptedInspections / inspections.length) * 100).toFixed(2)
      : '0.00';

    const facilityData = {
      facility,
      metrics: {
        totalInspections: inspections.length,
        acceptanceRate: `${acceptanceRate}%`,
        totalContaminants: contaminants.length,
        totalShipments: shipments.length
      },
      recentActivity: {
        contaminants: contaminants.slice(0, 5),
        inspections: inspections.slice(0, 5),
        shipments: shipments.slice(0, 5)
      },
      timestamp: new Date().toISOString()
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(facilityData, null, 2)
        }
      ]
    };
  }

  // Dynamic resource: Individual contract by ID
  const contractMatch = uri.match(/^contract:\/\/([a-f0-9]{24})$/);
  if (contractMatch) {
    const contractId = contractMatch[1];
    const contract = await Contract.findById(contractId).lean();
    
    if (!contract) {
      throw new Error('Contract not found');
    }

    // Find related shipments and inspections
    const shipments = await Shipment.find({ contractId }).sort({ entry_timestamp: -1 }).lean();
    const inspections = await Inspection.find({ contract_reference_id: contractId }).lean();

    const contractData = {
      contract,
      metrics: {
        totalShipments: shipments.length,
        totalInspections: inspections.length
      },
      recentShipments: shipments.slice(0, 10),
      timestamp: new Date().toISOString()
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(contractData, null, 2)
        }
      ]
    };
  }

  // Unknown resource
  throw new Error(`Unknown resource URI: ${uri}`);
}

// Handler to list all available resources
export async function listResources() {
  // Start with static resources
  const staticResources = Object.values(resources);

  // Add dynamic facility resources
  const facilities = await Facility.find().select('_id name shortCode').lean();
  const facilityResources = facilities.map(facility => ({
    uri: `facility://${facility._id}`,
    name: `Facility: ${facility.name} (${facility.shortCode})`,
    description: `Complete data for facility ${facility.name} including metrics and recent activity`,
    mimeType: 'application/json'
  }));

  // Add dynamic contract resources
  const contracts = await Contract.find().select('_id producerName debitorName').lean();
  const contractResources = contracts.map(contract => ({
    uri: `contract://${contract._id}`,
    name: `Contract: ${contract.producerName} → ${contract.debitorName}`,
    description: `Contract details with related shipments and inspections`,
    mimeType: 'application/json'
  }));

  return {
    resources: [...staticResources, ...facilityResources, ...contractResources]
  };
}

