# How to Connect Cursor to Your MCP Server

## ✅ Your Server is Running!

- **URL**: `http://localhost:3000`
- **SSE Endpoint**: `http://localhost:3000/sse`
- **Status**: Healthy and connected to MongoDB
- **Available Tools**: 25 CRUD operations across 5 collections

---

## 🔧 Configure Cursor

### Option 1: Using Cursor Settings UI

1. Open **Cursor Settings** (Cmd+, or Ctrl+,)
2. Go to **Features** → **Model Context Protocol**
3. Click **Add Server**
4. Enter:
   - **Name**: `waste-management`
   - **URL**: `http://localhost:3000/sse`
5. Click **Save**
6. Restart Cursor

### Option 2: Manual Configuration
 
Edit your Cursor MCP config file:

**macOS/Linux**: `~/.cursor/mcp.json`  
**Windows**: `%APPDATA%\Cursor\mcp.json`

Add this configuration:

```json
{
  "mcpServers": {
    "waste-management": {
      "url": "http://localhost:3000/sse"
    }
  }
}
```

Then restart Cursor.

---

## 🎯 Test in Cursor

Once connected, try these commands in Cursor's chat:

### Create a Facility
```
Create a new facility with name "North Processing Center", shortCode "NPC-002", and location "Boston, MA"
```

### List All Facilities
```
Show me all facilities in the database
```

### Create an Inspection
```
Create an inspection for facility ID [FACILITY_ID] with:
- delivery accepted: true
- meets conditions: true
- waste types: plastic 50%, metal 30%, paper 20%
- heating value: 4800
- producer: "Green Waste Solutions"
- contract reference: "CNT-2025-002"
```

### Query Contaminants
```
List all contaminants detected with high explosive levels
```

### Create a Shipment
```
Create a shipment for facility [FACILITY_ID] with license plate "XYZ-789", entry time today at 8am, exit time today at 2pm, source "Industrial Park B", and contract ID "12345"
```

---

## 📋 Available Tools (25 Total)

### Facilities
- `create_facility` - Create new facility
- `get_facility` - Get by ID
- `list_facilities` - List all with filters
- `update_facility` - Update by ID
- `delete_facility` - Delete by ID

### Contaminants
- `create_contaminant` - Create new contaminant
- `get_contaminant` - Get by ID
- `list_contaminants` - List all with filters
- `update_contaminant` - Update by ID
- `delete_contaminant` - Delete by ID

### Inspections
- `create_inspection` - Create new inspection
- `get_inspection` - Get by ID
- `list_inspections` - List all with filters
- `update_inspection` - Update by ID
- `delete_inspection` - Delete by ID

### Shipments
- `create_shipment` - Create new shipment
- `get_shipment` - Get by ID
- `list_shipments` - List all with filters
- `update_shipment` - Update by ID
- `delete_shipment` - Delete by ID

### Contracts
- `create_contract` - Create new contract
- `get_contract` - Get by ID
- `list_contracts` - List all with filters
- `update_contract` - Update by ID
- `delete_contract` - Delete by ID

---

## 🚀 Deployment (For Remote Access)

### Quick Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up

# Add environment variables in Railway dashboard:
# - MONGODB_URI (use MongoDB Atlas)
# - NODE_ENV=production
```

### Update Cursor Config for Production

```json
{
  "mcpServers": {
    "waste-management": {
      "url": "https://your-app.railway.app/sse"
    }
  }
}
```

---

## 🐛 Troubleshooting

### Cursor Can't Connect

1. **Verify server is running**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Check SSE endpoint**:
   ```bash
   curl http://localhost:3000/sse
   ```

3. **Restart Cursor** after changing MCP config

4. **Check Cursor logs** for connection errors

### Server Not Running

```bash
cd /Users/yab/Projects/v5-clear-ai/mcp-server
npm run dev
```

### MongoDB Connection Issues

Make sure MongoDB is running:
```bash
pgrep -l mongod
```

If not running:
```bash
brew services start mongodb-community
```

---

## 📚 Additional Resources

- See `README.md` for full documentation
- See `QUICKSTART.md` for setup instructions
- Check `/health` endpoint for server status
- Visit `http://localhost:3000/` for server info

---

**Your MCP server is ready to use!** 🎉

