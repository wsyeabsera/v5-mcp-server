import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/first-steps',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      items: [
        'architecture/overview',
        'architecture/tech-stack',
        'architecture/data-models',
        'architecture/request-flow',
      ],
    },
    {
      type: 'category',
      label: 'MCP Features',
      collapsed: false,
      items: [
        'mcp-features/overview',
        'mcp-features/prompts',
        'mcp-features/resources',
        'mcp-features/sampling',
      ],
    },
  ],

  api: [
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api/overview',
        {
          type: 'category',
          label: 'Facilities',
          items: [
            'api/facilities/create-facility',
            'api/facilities/get-facility',
            'api/facilities/list-facilities',
            'api/facilities/update-facility',
            'api/facilities/delete-facility',
          ],
        },
        {
          type: 'category',
          label: 'Contaminants',
          items: [
            'api/contaminants/create-contaminant',
            'api/contaminants/get-contaminant',
            'api/contaminants/list-contaminants',
            'api/contaminants/update-contaminant',
            'api/contaminants/delete-contaminant',
          ],
        },
        {
          type: 'category',
          label: 'Inspections',
          items: [
            'api/inspections/create-inspection',
            'api/inspections/get-inspection',
            'api/inspections/list-inspections',
            'api/inspections/update-inspection',
            'api/inspections/delete-inspection',
          ],
        },
        {
          type: 'category',
          label: 'Shipments',
          items: [
            'api/shipments/create-shipment',
            'api/shipments/get-shipment',
            'api/shipments/list-shipments',
            'api/shipments/update-shipment',
            'api/shipments/delete-shipment',
          ],
        },
        {
          type: 'category',
          label: 'Contracts',
          items: [
            'api/contracts/create-contract',
            'api/contracts/get-contract',
            'api/contracts/list-contracts',
            'api/contracts/update-contract',
            'api/contracts/delete-contract',
          ],
        },
        {
          type: 'category',
          label: 'AI-Powered Tools',
          items: [
            'api/sampling-tools/overview',
            'api/sampling-tools/generate-facility-report',
            'api/sampling-tools/analyze-shipment-risk',
            'api/sampling-tools/suggest-inspection-questions',
          ],
        },
      ],
    },
  ],

  guides: [
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'guides/client-execution-flow',
        'guides/sampling-guide',
        'guides/elicitation-patterns',
        'guides/mcp-inspector',
        'guides/cursor-integration',
        'guides/workflows',
        'guides/error-handling',
        'guides/best-practices',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/complete-workflows',
        'examples/waste-tracking',
        'examples/compliance-reporting',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/faq',
        'troubleshooting/debug-guide',
        'troubleshooting/schema-errors',
      ],
    },
  ],
};

export default sidebars;
