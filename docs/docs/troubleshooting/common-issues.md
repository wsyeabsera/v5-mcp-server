# Troubleshooting

Common issues and their solutions.

## Connection Issues

### Server Not Running

**Symptom**: `ECONNREFUSED` error

**Solution**:
```bash
# Check if server is running
curl http://localhost:3000/health

# If not, start it
npm start
```

### Wrong Port

**Symptom**: Connection refused on port 3000

**Solution**:
1. Check `.env` file for correct `PORT` value
2. Verify no other service using port 3000:
   ```bash
   lsof -i :3000
   ```

### Firewall Blocking

**Symptom**: Connection timeout

**Solution**:
- Allow port 3000 in firewall
- Check network security groups (if cloud hosted)

## Database Issues

### MongoDB Not Connected

**Symptom**: `MongoNetworkError: connect ECONNREFUSED`

**Solution**:
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Wrong Connection String

**Symptom**: Authentication failed

**Solution**:
1. Verify `MONGODB_URI` in `.env`
2. Check username/password
3. Ensure database name is correct

### Database Timeout

**Symptom**: Operation takes too long

**Solution**:
- Add indexes to MongoDB collections
- Optimize queries
- Check network latency

## Validation Errors

### Type Mismatch

**Error**: `Expected string, received number`

**Solution**:
```javascript
// Wrong
{ name: 123, shortCode: "TST", location: "Test" }

// Correct
{ name: "Test", shortCode: "TST", location: "Test" }
```

### Invalid ObjectId

**Error**: `Cast to ObjectId failed`

**Solution**:
```javascript
// Validate before use
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
```

### Invalid Enum Value

**Error**: `Invalid enum value`

**Solution**:
```javascript
// Wrong
explosive_level: "HIGH"

// Correct  
explosive_level: "high"
```

### Invalid Date Format

**Error**: `Invalid date`

**Solution**:
```javascript
// Wrong
detection_time: "11/01/2025"

// Correct
detection_time: new Date().toISOString()
// "2025-11-01T10:00:00.000Z"
```

## MCP Inspector Issues

### Cannot Start Inspector

**Solution**:
```bash
# Clear cache
npm cache clean --force

# Try again
npx @modelcontextprotocol/inspector http://localhost:3000/sse
```

### Tools Not Loading

**Solution**:
1. Verify server is running
2. Check server logs
3. Try refreshing browser
4. Clear browser cache

### Schema Errors

**Error**: `invalid literal`

**Solution**:
- Ensure all `zodToJsonSchema` calls use `{ $refStrategy: 'none' }`
- Restart server after schema changes

## Cursor Integration Issues

### Server Not Found

**Solution**:
1. Verify configuration in Cursor settings
2. Ensure server URL is correct
3. Restart Cursor completely

### Tools Not Available

**Solution**:
1. Check Cursor's MCP logs
2. Verify server is accessible: `curl http://localhost:3000/health`
3. Restart both server and Cursor

## Performance Issues

### Slow Responses

**Solution**:
- Add MongoDB indexes
- Implement caching
- Use pagination for large datasets
- Check network latency

### High Memory Usage

**Solution**:
- Limit list operations
- Implement pagination
- Clear caches periodically
- Monitor for memory leaks

## Data Issues

### Facility Not Found

**Solution**:
```javascript
// Always verify existence
const facility = await getFacility(id);
if (!facility || facility.isError) {
  console.error('Facility does not exist');
  // Handle appropriately
}
```

### Orphaned Records

**Problem**: Contaminants reference deleted facilities

**Solution**:
```javascript
// Safe delete pattern
async function safeFacilityDelete(facilityId) {
  // Check for dependencies
  const contaminants = await listContaminants({ facilityId });
  if (contaminants.length > 0) {
    throw new Error('Cannot delete: has related contaminants');
  }
  
  return await deleteFacility(facilityId);
}
```

## Deployment Issues

### Environment Variables Not Loaded

**Solution**:
```bash
# Verify .env file exists
ls -la .env

# Check contents
cat .env

# Ensure dotenv is loaded
import 'dotenv/config';
```

### Build Failures

**Solution**:
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Debug Mode

Enable detailed logging:

```typescript
// In .env
LOG_LEVEL=debug

// In code
logger.debug('Detailed info', { data });
```

## Getting Help

If you're still stuck:

1. **Check Logs**: Look at server logs for detailed errors
2. **Test with curl**: Verify endpoints work with curl
3. **MCP Inspector**: Use for visual debugging
4. **GitHub Issues**: Report bugs or ask questions
5. **FAQ**: Check [FAQ](/troubleshooting/faq)

---

**Need immediate help?** Check the [FAQ](/troubleshooting/faq) or file an issue on GitHub.

