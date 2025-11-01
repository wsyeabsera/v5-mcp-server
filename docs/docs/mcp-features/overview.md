# MCP Features Overview

Welcome to the advanced features guide for your MCP server. This section covers three powerful capabilities that go beyond basic CRUD operations: **Prompts**, **Resources**, and **Sampling**.

## What Are MCP Features?

The Model Context Protocol defines several capabilities beyond just tools (CRUD operations). These additional features enable more sophisticated interactions between AI assistants and your server:

| Feature | Purpose | Direction | Example Use Case |
|---------|---------|-----------|------------------|
| **Tools** | Perform actions | AI → Server | Create facility, update inspection |
| **Prompts** | Workflow templates | User → AI → Server | "Analyze facility compliance" |
| **Resources** | Read data | AI ← Server | View system stats, facility list |
| **Sampling** | AI analysis | Server → AI | Automated report generation |

## The Three Advanced Features

### 1. Prompts - Workflow Templates

**What**: Pre-defined templates that guide AI through complex multi-step workflows

**Why**: Users don't need to remember detailed instructions for common tasks

**Example**: Instead of typing "Get facility X, list its inspections, calculate acceptance rate, check contamination levels, and provide a compliance summary," users simply invoke the "analyze-facility-compliance" prompt with a facility ID.

**Best For**:
- Common, repeatable workflows
- Multi-step analysis tasks
- Guided operations
- Onboarding new users

**Learn More**: [Prompts Documentation](./prompts.md)

### 2. Resources - Direct Data Access

**What**: Read-only endpoints that expose data for AI to reference without calling tools

**Why**: Faster, more efficient than using tools for simple data reading

**Example**: AI can read `stats://overview` to see system statistics without calling multiple list tools and counting records.

**Best For**:
- System dashboards
- Reference data
- Background context
- Recent activity feeds

**Learn More**: [Resources Documentation](./resources.md)

### 3. Sampling - Server-Initiated AI Requests

**What**: Allows your server to request AI analysis and text generation

**Why**: Enables automated workflows that leverage AI intelligence

**Example**: When contamination levels spike, your server automatically requests AI to analyze patterns and generate an alert summary.

**Best For**:
- Automated analysis
- Scheduled reports
- Pattern detection
- Smart notifications

**Learn More**: [Sampling Documentation](./sampling.md)

## Feature Comparison

### When to Use Each Feature

#### Use **Tools** When:
- ✅ User explicitly wants to perform an action
- ✅ Creating, updating, or deleting data
- ✅ Complex queries with multiple filters
- ✅ Any operation with side effects

#### Use **Prompts** When:
- ✅ Common workflow needs to be simplified
- ✅ Multi-step process follows a pattern
- ✅ Guiding users through complex tasks
- ✅ Standardizing how tasks are performed

#### Use **Resources** When:
- ✅ AI needs reference data
- ✅ Reading static or semi-static information
- ✅ Providing dashboard/overview data
- ✅ No filtering or complex logic needed

#### Use **Sampling** When:
- ✅ Server needs AI analysis automatically
- ✅ Generating content on a schedule
- ✅ Pattern detection in background
- ✅ Smart decision-making in workflows

## Implementation Roadmap

Here's the recommended order to implement these features in your waste management server:

### Phase 1: Foundation (Already Complete)
- ✅ Tools for CRUD operations
- ✅ Server running with MCP endpoint
- ✅ Database models defined

### Phase 2: Enhance with Prompts (Start Here)
1. Create `src/prompts/index.ts`
2. Define 2-3 common workflows as prompts
3. Add `prompts: {}` to server capabilities
4. Implement `prompts/list` and `prompts/get` handlers
5. Test with MCP Inspector

**Time**: 2-3 hours  
**Complexity**: Low  
**Impact**: High - immediate user value

### Phase 3: Add Resources (Next)
1. Create `src/resources/index.ts`
2. Define 3-4 static resources (stats, lists)
3. Add dynamic resources (facility by ID)
4. Add `resources` capability to server
5. Implement `resources/list` and `resources/read` handlers
6. Test with MCP Inspector

**Time**: 3-4 hours  
**Complexity**: Medium  
**Impact**: High - better performance

### Phase 4: Enable Sampling (Advanced)
1. Create `src/utils/sampling.ts`
2. Add `sampling: {}` to capabilities
3. Create helper functions for common analyses
4. Integrate into tools or scheduled jobs
5. Test with sampling-capable client

**Time**: 4-6 hours  
**Complexity**: High  
**Impact**: Medium - depends on use cases

## Real-World Example: Facility Compliance Check

Let's see how all features work together for a facility compliance check:

### Without Advanced Features (Tools Only)

User types:
> "Check compliance for facility MPP. Show me its inspections, calculate acceptance rate, list contaminations, and tell me if there are concerns."

AI makes 4+ tool calls:
1. `get_facility` with ID
2. `list_inspections` filtered by facility
3. `list_contaminants` filtered by facility
4. Manual calculation and analysis

**Result**: Works, but requires AI to orchestrate everything

### With Prompts

User types:
> "Use analyze-facility-compliance prompt for facility MPP"

AI invokes one prompt that generates complete instructions:
- Structured steps
- All necessary tool calls
- Expected output format

**Result**: Consistent, efficient, guided workflow

### With Resources

AI first reads:
- `stats://overview` - system context
- `facility://507f...` - all facility data in one call

Then performs specific operations only if needed.

**Result**: Fewer API calls, faster results

### With Sampling

Your server detects anomaly in facility MPP's data and automatically:
1. Gathers relevant data
2. Requests AI analysis via sampling
3. Generates alert with AI insights
4. Notifies facility manager

**Result**: Proactive, automated intelligence

## Getting Started

### Quick Start Checklist

- [ ] Read [Prompts documentation](./prompts.md)
- [ ] Create your first 2 prompts
- [ ] Test prompts in MCP Inspector
- [ ] Read [Resources documentation](./resources.md)
- [ ] Implement 3 static resources
- [ ] Add 1 dynamic resource pattern
- [ ] Test resources in MCP Inspector
- [ ] Read [Sampling documentation](./sampling.md)
- [ ] Decide if you need sampling
- [ ] If yes, implement one sampling use case

### Testing Your Implementation

After implementing each feature:

1. **Start your server**: `npm run dev`
2. **Launch inspector**: `npx @modelcontextprotocol/inspector http://localhost:3000/sse`
3. **Check capabilities**: Verify your new feature appears
4. **Test endpoints**: Try the new methods
5. **Integrate with client**: Test in Cursor or your MCP client

## Code Organization

Recommended project structure after implementing all features:

```
mcp-server/
├── src/
│   ├── models/           # Mongoose models (existing)
│   ├── tools/            # Tool implementations (existing)
│   ├── prompts/          # NEW: Prompt definitions
│   │   └── index.ts
│   ├── resources/        # NEW: Resource handlers
│   │   └── index.ts
│   ├── utils/            # Utilities
│   │   ├── logger.ts     # (existing)
│   │   └── sampling.ts   # NEW: Sampling helpers
│   ├── config.ts         # (existing)
│   ├── db.ts             # (existing)
│   └── index.ts          # Main server with all handlers
```

## Common Patterns

### Pattern 1: Prompt → Tools → Resource

1. User invokes a prompt
2. Prompt guides AI to call specific tools
3. AI reads resources for context
4. AI synthesizes results

### Pattern 2: Resource → Sampling → Tool

1. AI reads resource (current data)
2. Server uses sampling to analyze data
3. Based on analysis, server calls tools to take action

### Pattern 3: Tool → Sampling → Response

1. User calls a tool (e.g., create_inspection)
2. Tool triggers sampling for quality check
3. Sampling result included in response

## Best Practices

### 1. Start Simple
Don't implement all features at once. Start with prompts, add resources, then consider sampling.

### 2. Think User-First
Design prompts and resources based on real user needs, not just because you can.

### 3. Test Incrementally
Test each feature thoroughly before moving to the next.

### 4. Document Everything
Keep your documentation up-to-date as you add features.

### 5. Monitor Performance
Track API calls, response times, and costs (especially for sampling).

### 6. Handle Failures
Always have fallbacks when advanced features aren't available.

## Troubleshooting

### Prompts Not Appearing

- Check that `prompts: {}` is in capabilities
- Verify prompts are exported from `src/prompts/index.ts`
- Ensure `prompts/list` handler is implemented

### Resources Not Loading

- Check that `resources` capability is configured
- Verify `resources/list` returns proper format
- Check that resource URIs are valid

### Sampling Not Working

- Verify client supports sampling
- Check that `sampling: {}` is in capabilities
- Consider using external AI API as fallback

## Next Steps

Choose your path based on your needs:

1. **🎯 Most Common**: Start with [Prompts](./prompts.md) to simplify user workflows
2. **⚡ Performance**: Add [Resources](./resources.md) for faster data access
3. **🤖 Automation**: Implement [Sampling](./sampling.md) for intelligent automation

## Additional Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Architecture Overview](../architecture/overview.md)
- [API Reference](../api/overview.md)
- [Best Practices](../guides/best-practices.md)

---

Ready to enhance your MCP server? Start with [Prompts](./prompts.md) to make your server more user-friendly! 🚀

