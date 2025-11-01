# 🎯 Cursor Integration Testing - Step by Step

## ✅ Server is Running and Ready!

Your MCP server is **fully operational** and waiting for Cursor to connect.

---

## 📋 Pre-Flight Checklist

1. ✅ Server running on `http://localhost:3000`
2. ✅ MongoDB connected
3. ✅ 25 tools available
4. ✅ Protocol tests passing

Verify server status:
```bash
curl http://localhost:3000/health | jq .
```

Expected output:
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "timestamp": "2025-11-01T..."
}
```

---

## 🔧 Step 1: Configure Cursor

### Option A: Using Cursor Settings UI (Easier)

1. Open **Cursor**
2. Press `Cmd+,` (or `Ctrl+,` on Windows)
3. Go to **Features** → **Model Context Protocol**
4. Click **"Add Server"** or **"+"**
5. Fill in:
   - **Name**: `waste-management`
   - **Command**: Leave empty (we're using HTTP, not stdio)
   - **URL**: `http://localhost:3000/sse`
6. Click **Save**
7. **Restart Cursor** (Cmd+Q, then reopen)

### Option B: Manual Configuration (If UI doesn't work)

1. **Close Cursor completely** (Cmd+Q)

2. **Create/Edit MCP config file**:
   ```bash
   # macOS/Linux
   nano ~/.cursor/mcp.json
   
   # Windows (PowerShell)
   notepad $env:APPDATA\Cursor\mcp.json
   ```

3. **Add this configuration**:
   ```json
   {
     "mcpServers": {
       "waste-management": {
         "url": "http://localhost:3000/sse"
       }
     }
   }
   ```

4. **Save and close** the file

5. **Restart Cursor**

---

## 🧪 Step 2: Test in Cursor

### Test 1: Verify Connection

Open Cursor's chat and type:
```
List all available tools from the waste-management server
```

**Expected**: Cursor should show you 25 tools (facilities, contaminants, inspections, shipments, contracts CRUD operations)

### Test 2: Create a Facility

```
Create a new facility with:
- name: "North Processing Center"
- shortCode: "NPC-001"  
- location: "Boston, MA"
```

**Expected**: Cursor should create the facility and show you the created record with an ID

### Test 3: List Facilities

```
Show me all facilities in the database
```

**Expected**: Should return at least 3 facilities (2 existing + 1 just created)

### Test 4: Create an Inspection

First, get a facility ID from the previous step, then:
```
Create an inspection for facility [FACILITY_ID] with:
- delivery accepted: true
- meets conditions: true
- waste types: [{"category": "plastic", "percentage": "50"}, {"category": "metal", "percentage": "30"}]
- heating value: 4500
- waste producer: "Green Solutions Inc"
- contract reference: "CNT-2025-001"
```

**Expected**: Inspection should be created successfully

### Test 5: Complex Query

```
List all contaminants with high explosive levels at facility [FACILITY_ID]
```

**Expected**: Should execute the query (may return empty list if no contaminants exist)

---

## 🔍 Step 3: Monitor Server Logs

While testing in Cursor, watch the server logs in another terminal:

```bash
tail -f /Users/yab/Projects/v5-clear-ai/mcp-server/logs/app.log
```

You should see:
```
[INFO] [MCP] Received JSON-RPC request: { jsonrpc: '2.0', id: 1, method: 'initialize', ... }
[INFO] [MCP] Handling initialize
[INFO] [MCP] Handling tools/list
[INFO] [MCP] Handling tools/call for: create_facility
```

---

## ❌ Troubleshooting

### Cursor Can't Find the Server

1. **Check server is running**:
   ```bash
   curl http://localhost:3000/health
   ```
   
2. **Check Cursor config**:
   ```bash
   cat ~/.cursor/mcp.json
   ```
   Make sure it matches exactly

3. **Restart Cursor completely** (Cmd+Q, wait 5 seconds, reopen)

4. **Check Cursor's developer console** for errors:
   - In Cursor, go to: Help → Toggle Developer Tools
   - Look for MCP connection errors in the console

### Cursor Shows "Tool Not Found"

- The server might not be running
- Check: `curl http://localhost:3000/ | jq .`
- Should show 25 tools

### Connection Timeouts

- Firewall might be blocking localhost
- Try: `curl -v http://localhost:3000/health`
- Should connect without errors

### Cursor Uses Wrong Port

- Make sure no other MCP servers are configured
- Check `~/.cursor/mcp.json` for conflicts

---

## 📊 Success Indicators

You'll know it's working when:

1. ✅ Cursor doesn't show connection errors
2. ✅ You can ask Cursor to list tools and it returns 25
3. ✅ Tool execution returns data from MongoDB
4. ✅ Server logs show incoming MCP requests
5. ✅ Data persists in database (check with `list_*` tools)

---

## 🎉 When It Works

Once working, you can:

- **Create** records in any collection
- **Read** data with filtering
- **Update** existing records
- **Delete** records by ID
- **Query** across relationships (facilities ← inspections, contaminants, shipments)

### Example Workflows

**Waste Tracking**:
```
1. Create a facility
2. Create a shipment for that facility
3. Log contaminants detected in the shipment
4. Create an inspection report
5. Query all activities for that facility
```

**Compliance Reporting**:
```
1. List all inspections where delivery was not accepted
2. Show all contaminants with high explosive levels
3. Find facilities with multiple violations
```

---

## 🆘 If Nothing Works

1. **Check server logs**: `tail -f logs/app.log`
2. **Test protocol directly**:
   ```bash
   curl -X POST http://localhost:3000/sse \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "initialize",
       "params": {
         "protocolVersion": "2024-11-05",
         "capabilities": {},
         "clientInfo": {"name": "test", "version": "1.0.0"}
       }
     }' | jq .
   ```
   Should return server info

3. **Restart everything**:
   ```bash
   # Kill server
   pkill -f tsx
   
   # Restart server
   cd /Users/yab/Projects/v5-clear-ai/mcp-server
   npm run dev
   
   # Restart Cursor
   # Cmd+Q, wait, reopen
   ```

4. **Check this document**: `SERVER_STATUS.md`

---

## 📞 Report Results

After testing, please report:

1. ✅/❌ Connection established?
2. ✅/❌ Tools visible in Cursor?
3. ✅/❌ Tool execution working?
4. 📝 Any error messages?
5. 📝 What worked? What didn't?

---

**Good luck! The server is ready and waiting.** 🚀

