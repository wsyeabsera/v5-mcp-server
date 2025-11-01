# Installation

This guide will walk you through setting up the MCP Server on your local machine. The process takes about 5 minutes.

## Prerequisites

Before you begin, make sure you have the following installed:

### Required Software

- **Node.js** (v18 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Check version: `node --version`

- **MongoDB** (v6.0 or higher)
  - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
  - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
  - Check version: `mongod --version`

- **npm** or **yarn** (comes with Node.js)
  - Check version: `npm --version`

### Optional Tools

- **MCP Inspector** - For testing your server
  ```bash
  npx @modelcontextprotocol/inspector
  ```

- **Cursor** - AI editor with MCP support
  - Download from [cursor.sh](https://cursor.sh/)

## Installation Steps

### 1. Clone or Download the Repository

```bash
git clone https://github.com/your-org/mcp-server.git
cd mcp-server
```

### 2. Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

This will install:
- `express` - Web server framework
- `mongoose` - MongoDB ODM
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `typescript` - TypeScript compiler
- `zod` - Schema validation
- And other dependencies...

### 3. Set Up MongoDB

You have two options for MongoDB:

#### Option A: Local MongoDB

1. Start MongoDB on your machine:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux (systemd)
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

2. Verify it's running:
   ```bash
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/waste-management

# Server port
PORT=3000
```

For MongoDB Atlas, use your connection string:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waste-management?retryWrites=true&w=majority
```

:::tip
Replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials.
:::

### 5. Build the Project

Compile TypeScript to JavaScript:

```bash
npm run build
```

This creates a `dist/` folder with compiled JavaScript files.

### 6. Start the Server

Run the server:

```bash
npm start
```

You should see:

```
[INFO] Mongoose connected to MongoDB
[INFO] MongoDB connected successfully
[INFO] MCP Server running on http://localhost:3000
[INFO] MCP endpoint: http://localhost:3000/sse
[INFO] Health check: http://localhost:3000/health
[INFO] Total tools available: 25
```

### 7. Verify Installation

Test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "timestamp": "2025-11-01T10:00:00.000Z"
}
```

## Development Mode

For development with automatic reloading:

```bash
npm run dev
```

This uses `tsx` to run TypeScript directly and watches for file changes.

## Troubleshooting

### MongoDB Connection Failed

**Error**: `MongooseError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**: Make sure MongoDB is running:
```bash
# Check MongoDB status
mongosh
```

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**: Either:
1. Stop the process using port 3000
2. Change `PORT` in `.env` to a different port (e.g., 3001)

### Module Not Found

**Error**: `Cannot find module 'express'`

**Solution**: Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

Now that your server is running:

1. **[Quick Start Guide](/getting-started/quick-start)** - Make your first API call
2. **[First Steps](/getting-started/first-steps)** - Create your first resources
3. **[MCP Inspector Guide](/guides/mcp-inspector)** - Test with the Inspector

## System Requirements

### Minimum Requirements
- **RAM**: 512 MB
- **Disk Space**: 100 MB
- **CPU**: 1 core

### Recommended Requirements
- **RAM**: 2 GB
- **Disk Space**: 1 GB
- **CPU**: 2 cores

### Supported Operating Systems
- macOS 10.15+
- Windows 10+
- Linux (Ubuntu 20.04+, Debian 10+, CentOS 8+)

---

**Need help?** Check the [Troubleshooting Guide](/troubleshooting/common-issues) or [FAQ](/troubleshooting/faq).

