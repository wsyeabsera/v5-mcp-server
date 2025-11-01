# Technology Stack

This page provides a detailed breakdown of all technologies used in the MCP Server, why they were chosen, and how they work together.

## Core Technologies

### TypeScript

**Version**: 5.x  
**Purpose**: Primary programming language  
**Why TypeScript?**

- ✅ Static type checking catches errors at compile time
- ✅ Better IDE support and autocomplete
- ✅ Self-documenting code through types
- ✅ Easier refactoring
- ✅ Improved maintainability

**Example**:
```typescript
interface FacilityArgs {
  name: string;
  shortCode: string;
  location: string;
}

async function createFacility(args: FacilityArgs) {
  // TypeScript ensures args has correct shape
}
```

### Node.js

**Version**: 18.x or higher  
**Purpose**: JavaScript runtime  
**Why Node.js?**

- ✅ JavaScript ecosystem
- ✅ Non-blocking I/O ideal for APIs
- ✅ Large package ecosystem (npm)
- ✅ Wide industry adoption
- ✅ Excellent async/await support

## Web Framework

### Express.js

**Version**: 4.x  
**Purpose**: HTTP server framework  

**Features Used**:
- HTTP request/response handling
- JSON body parsing
- CORS support
- Routing

**Why Express?**

- ✅ Minimal, unopinionated
- ✅ Well-established (14+ years)
- ✅ Excellent middleware ecosystem
- ✅ Simple to understand
- ✅ Great documentation

**Basic Setup**:
```typescript
import express from 'express';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/sse', handleMCPRequest);

app.listen(3000);
```

## Database Layer

### MongoDB

**Version**: 6.0+  
**Purpose**: Primary data store  

**Why MongoDB?**

- ✅ Flexible schema (JSON-like documents)
- ✅ Easy to get started
- ✅ Scales horizontally
- ✅ Rich query language
- ✅ Excellent Node.js support

**Document Structure**:
```json
{
  "_id": "67253a1b2e4f5c001d8e9a12",
  "name": "Central Facility",
  "shortCode": "CF-001",
  "location": "New York"
}
```

### Mongoose

**Version**: 8.x  
**Purpose**: MongoDB object modeling (ODM)  

**Features Used**:
- Schema definition
- Type casting
- Validation
- Middleware (hooks)
- Query building

**Why Mongoose?**

- ✅ Adds structure to MongoDB
- ✅ Built-in validation
- ✅ TypeScript support
- ✅ Excellent documentation
- ✅ Large community

**Schema Example**:
```typescript
const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortCode: { type: String, required: true },
  location: { type: String, required: true }
});

export const Facility = mongoose.model('Facility', facilitySchema);
```

## Validation Layer

### Zod

**Version**: 3.x  
**Purpose**: Runtime schema validation  

**Features Used**:
- Type-safe schema definition
- Runtime validation
- Type inference
- Error messages
- JSON Schema generation

**Why Zod?**

- ✅ TypeScript-first design
- ✅ Runtime + compile-time safety
- ✅ Converts to JSON Schema (needed for MCP)
- ✅ Excellent DX (developer experience)
- ✅ Small bundle size

**Schema Example**:
```typescript
import { z } from 'zod';

const createFacilitySchema = z.object({
  name: z.string().describe('Facility name'),
  shortCode: z.string().describe('Short code'),
  location: z.string().describe('Location'),
});

// Type inference
type CreateFacilityArgs = z.infer<typeof createFacilitySchema>;

// Runtime validation
const validated = createFacilitySchema.parse(args);
```

### zod-to-json-schema

**Version**: 3.x  
**Purpose**: Convert Zod schemas to JSON Schema  

**Why Needed?**

MCP protocol requires JSON Schema format for tool definitions. This library converts Zod schemas (which we use for validation) into JSON Schemas (which MCP clients expect).

**Usage**:
```typescript
import { zodToJsonSchema } from 'zod-to-json-schema';

const jsonSchema = zodToJsonSchema(createFacilitySchema, { 
  $refStrategy: 'none'  // Flat schema without references
});
```

## Protocol Layer

### @modelcontextprotocol/sdk

**Version**: 1.x  
**Purpose**: MCP protocol types and utilities  

**Why MCP?**

- ✅ Standard protocol for AI-tool communication
- ✅ Works with Cursor, Claude, and other AI clients
- ✅ Well-defined specification
- ✅ Growing ecosystem

**Protocol Structure**:
```typescript
// MCP request format
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_facility",
    "arguments": { ... }
  }
}

// MCP response format
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "..."
    }]
  },
  "id": 1
}
```

## Logging

### Winston

**Version**: 3.x  
**Purpose**: Structured logging  

**Features Used**:
- Log levels (error, warn, info, debug)
- Colored console output
- JSON formatting
- Timestamp formatting

**Why Winston?**

- ✅ Flexible configuration
- ✅ Multiple transports (console, file, etc.)
- ✅ Structured logging
- ✅ Industry standard

**Configuration**:
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${level}] ${timestamp} ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});
```

## Development Tools

### tsx

**Version**: 4.x  
**Purpose**: TypeScript execution for development  

**Why tsx?**

- ✅ Run TypeScript directly (no build step)
- ✅ Fast watch mode
- ✅ ESM support
- ✅ Simpler than ts-node

**Usage**:
```bash
tsx watch src/index.ts  # Auto-reload on changes
```

### TypeScript Compiler (tsc)

**Purpose**: Compile TypeScript to JavaScript for production  

**Configuration** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

## Utilities

### dotenv

**Version**: 16.x  
**Purpose**: Load environment variables from `.env` file  

**Why dotenv?**

- ✅ Standard practice for configuration
- ✅ Keep secrets out of code
- ✅ Different configs per environment

**Usage**:
```typescript
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI;
```

### cors

**Version**: 2.x  
**Purpose**: Enable Cross-Origin Resource Sharing  

**Why CORS?**

Allows web-based MCP clients (like MCP Inspector) to connect from different origins.

**Configuration**:
```typescript
import cors from 'cors';

app.use(cors());  // Allow all origins (development)

// Production: restrict origins
app.use(cors({
  origin: ['https://your-client.com']
}));
```

## Type Definitions

### @types/express

**Purpose**: TypeScript types for Express  

### @types/cors

**Purpose**: TypeScript types for CORS  

**Why Needed?**

These packages provide TypeScript definitions for JavaScript libraries, enabling type checking and autocomplete.

## Technology Decision Matrix

| Technology | Alternatives Considered | Why Chosen |
|-----------|------------------------|------------|
| **TypeScript** | JavaScript, Flow | Best type system, industry standard |
| **Express** | Fastify, Koa, Hono | Mature, widely used, stable |
| **MongoDB** | PostgreSQL, MySQL | Flexible schema, easy setup |
| **Mongoose** | Prisma, TypeORM | MongoDB-native, rich features |
| **Zod** | Joi, Yup | TypeScript-first, JSON Schema export |
| **Winston** | Pino, Bunyan | Flexible, well-documented |
| **Node.js** | Deno, Bun | Largest ecosystem, most stable |

## Dependency Graph

```mermaid
graph TD
    APP[MCP Server Application]
    
    APP --> EXPRESS[Express]
    APP --> MONGOOSE[Mongoose]
    APP --> ZOD[Zod]
    APP --> WINSTON[Winston]
    APP --> MCP_SDK[@modelcontextprotocol/sdk]
    
    EXPRESS --> NODE[Node.js]
    MONGOOSE --> MONGODB[MongoDB]
    ZOD --> ZTJ[zod-to-json-schema]
    
    APP --> DOTENV[dotenv]
    APP --> CORS[cors]
    
    style APP fill:#4CAF50
    style NODE fill:#68A063
    style MONGODB fill:#47A248
```

## Version Compatibility

### Minimum Versions

- **Node.js**: 18.0.0
- **MongoDB**: 6.0.0
- **npm**: 9.0.0

### Tested Versions

- **Node.js**: 18.x, 20.x
- **MongoDB**: 6.x, 7.x
- **npm**: 9.x, 10.x

## Package.json Overview

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.1",
    "mongoose": "^8.8.4",
    "winston": "^3.17.0",
    "zod": "^3.23.8",
    "zod-to-json-schema": "^3.24.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
```

## Build Process

### Development Build

```bash
npm run dev  # tsx watch src/index.ts
```

**Process**:
1. `tsx` loads TypeScript files directly
2. Watches for file changes
3. Automatically reloads on save
4. No build artifacts created

### Production Build

```bash
npm run build  # tsc
npm start      # node dist/index.js
```

**Process**:
1. TypeScript compiler (`tsc`) compiles `.ts` → `.js`
2. Output goes to `dist/` folder
3. `node` runs the compiled JavaScript
4. Faster execution (no compilation overhead)

## Performance Characteristics

### Startup Time
- **Development**: ~2-3 seconds (tsx)
- **Production**: ~0.5-1 second (node)

### Memory Usage
- **Idle**: ~50 MB
- **Active**: ~100-200 MB (depends on data volume)

### Request Latency
- **Local MongoDB**: 10-50ms
- **Remote MongoDB**: 50-200ms (depends on network)

## Future Technology Considerations

### Potential Additions

1. **Redis** - Caching layer for performance
2. **Helmet** - Security headers
3. **Rate-limit** - Request throttling
4. **Swagger/OpenAPI** - Additional API documentation
5. **Jest** - Automated testing
6. **Docker** - Containerization

### Potential Replacements

If the project grows significantly:

- **Express → Fastify** - Better performance
- **Winston → Pino** - Faster logging
- **MongoDB → PostgreSQL** - If strict schema becomes important

## Next Steps

- **[Data Models](/architecture/data-models)** - See how data is structured
- **[Request Flow](/architecture/request-flow)** - Understand request processing
- **[API Reference](/api/overview)** - Explore the tools

---

**Questions about technology choices?** See the [FAQ](/troubleshooting/faq).

