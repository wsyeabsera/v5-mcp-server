import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'MCP Server Documentation',
  tagline: 'Waste Management MCP Server - Complete Guide for Developers',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Set the production url of your site here
  url: 'https://wsyeabsera.github.io',
  baseUrl: '/v5-mcp-server/',

  // GitHub pages deployment config
  organizationName: 'wsyeabsera',
  projectName: 'v5-mcp-server',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // Serve docs at the root
          editUrl: undefined, // Remove edit links
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'MCP Server Docs',
      logo: {
        alt: 'MCP Server Logo',
        src: 'img/logo.svg',
        href: '/intro',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'api',
          position: 'left',
          label: 'API Reference',
        },
        {
          type: 'docSidebar',
          sidebarId: 'guides',
          position: 'left',
          label: 'Guides',
        },
        {
          href: 'https://github.com/your-org/mcp-server',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started/installation',
            },
            {
              label: 'Architecture',
              to: '/architecture/overview',
            },
            {
              label: 'API Reference',
              to: '/api/facilities/create-facility',
            },
          ],
        },
        {
          title: 'Guides',
          items: [
            {
              label: 'MCP Inspector',
              to: '/guides/mcp-inspector',
            },
            {
              label: 'Cursor Integration',
              to: '/guides/cursor-integration',
            },
            {
              label: 'Workflows',
              to: '/guides/workflows',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Examples',
              to: '/examples/complete-workflows',
            },
            {
              label: 'Troubleshooting',
              to: '/troubleshooting/common-issues',
            },
            {
              label: 'FAQ',
              to: '/troubleshooting/faq',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} MCP Server Project. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'python', 'javascript'],
    },
    algolia: {
      // Add Algolia search later if needed
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'mcp-server',
      contextualSearch: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    // Add any custom plugins here
  ],
};

export default config;
