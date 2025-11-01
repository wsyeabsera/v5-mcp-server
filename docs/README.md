# MCP Server Documentation

Comprehensive Docusaurus documentation for the Waste Management MCP Server.

## Quick Start

### Development

Start the development server:

```bash
cd docs
npm start
```

Visit `http://localhost:3000`

### Build

Build static files:

```bash
cd docs
npm run build
```

Output in `build/` directory.

### Serve Built Files

Test the production build locally:

```bash
cd docs
npm run serve
```

## Documentation Structure

```
docs/
├── docs/
│   ├── intro.md                       # Introduction
│   ├── getting-started/               # Setup guides
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   └── first-steps.md
│   ├── architecture/                  # System design
│   │   ├── overview.md
│   │   ├── tech-stack.md
│   │   ├── data-models.md
│   │   └── request-flow.md
│   ├── api/                          # API reference (25 tools)
│   │   ├── overview.md
│   │   ├── facilities/               # 5 CRUD tools
│   │   ├── contaminants/             # 5 CRUD tools
│   │   ├── inspections/              # 5 CRUD tools
│   │   ├── shipments/                # 5 CRUD tools
│   │   └── contracts/                # 5 CRUD tools
│   ├── guides/                       # How-to guides
│   │   ├── mcp-inspector.md
│   │   ├── cursor-integration.md
│   │   ├── workflows.md
│   │   ├── error-handling.md
│   │   └── best-practices.md
│   ├── examples/                     # Real-world examples
│   │   ├── complete-workflows.md
│   │   ├── waste-tracking.md
│   │   └── compliance-reporting.md
│   └── troubleshooting/              # Debug and FAQ
│       ├── common-issues.md
│       ├── faq.md
│       ├── debug-guide.md
│       └── schema-errors.md
├── static/                           # Static assets
├── docusaurus.config.ts              # Site configuration
└── sidebars.ts                       # Navigation structure
```

## Content Overview

### Getting Started (3 pages)
- Installation guide with prerequisites
- Quick start tutorial (5 minutes)
- First steps with each collection

### Architecture (4 pages)
- System overview with diagrams
- Complete technology stack
- Data models with relationships
- Detailed request flow

### API Reference (26 pages)
- Overview of all 25 tools
- 5 pages per collection (create, get, list, update, delete)
- Each tool page includes:
  - Parameters with types
  - Return formats
  - Code examples (curl, JavaScript, Python)
  - Common errors

### Guides (5 pages)
- MCP Inspector usage
- Cursor integration
- Common workflows
- Error handling patterns
- Best practices

### Examples (3 pages)
- Complete workflows with code
- Waste tracking scenario
- Compliance reporting

### Troubleshooting (4 pages)
- Common issues and solutions
- Comprehensive FAQ
- Debug guide
- Schema error reference

## Features

- **Search**: Full-text search across all documentation
- **Dark Mode**: Toggle between light and dark themes
- **Responsive**: Mobile-friendly design
- **Code Highlighting**: Syntax highlighting for all code blocks
- **Mermaid Diagrams**: Interactive diagrams in architecture section
- **Copy Buttons**: One-click code copying
- **Navigation**: Sidebar with auto-collapse
- **Admonitions**: Info, warning, tip, and danger callouts

## Deployment

### GitHub Pages

```bash
npm run deploy
```

### Netlify/Vercel

Point to the `docs/` directory and use:
- Build command: `npm run build`
- Publish directory: `build`

### Custom Server

Build and serve the `build/` directory with any static file server.

## Maintenance

### Adding New Pages

1. Create markdown file in `docs/docs/`
2. Add to `sidebars.ts`
3. Link from related pages

### Updating API Docs

When adding new tools:
1. Create page in appropriate `api/` subdirectory
2. Add to `sidebars.ts` under API Reference
3. Update count in overview

### Fixing Broken Links

Run build to check for broken links:

```bash
npm run build
```

Docusaurus will report all broken links.

## Contributing

When contributing documentation:
1. Follow existing page structure
2. Include code examples
3. Add to sidebar navigation
4. Test build before submitting
5. Check for broken links

## Support

- **Documentation Issues**: File issue on GitHub
- **Server Issues**: See main project README
- **Questions**: Check FAQ first

---

Built with [Docusaurus 3](https://docusaurus.io/)
