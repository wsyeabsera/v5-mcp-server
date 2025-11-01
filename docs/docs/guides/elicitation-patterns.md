# User Elicitation Patterns

Learn how to design interactive MCP workflows that request user input, confirm actions, and create user-friendly multi-step experiences.

## What is User Elicitation?

**Elicitation** is the process of requesting information or confirmation from the user during workflow execution. It's how your MCP server can:

- Get missing parameters before executing actions
- Confirm destructive operations
- Guide users through multi-step processes
- Resolve ambiguities
- Validate intentions

### Traditional vs Elicitation Flow

**Traditional (one-shot):**
```
User: "Delete facilities"
AI: ✅ Deleted 50 facilities
```

**With Elicitation (safer):**
```
User: "Delete facilities"
AI: ⚠️ Which facilities? All (50)? Specific ones?
User: "Just the old ones"
AI: What do you consider 'old'? 
    a) Not used in 90 days
    b) Created before 2023
    c) Marked as inactive
User: "b"
AI: Found 5 facilities created before 2023. Delete all 5?
User: "yes"
AI: ✅ Deleted 5 facilities
```

## Why Use Elicitation?

### Benefits

1. **Safety**: Prevent accidental destructive actions
2. **Accuracy**: Ensure correct parameters before execution
3. **User Control**: Let users verify before proceeding
4. **Disambiguation**: Resolve ambiguous requests
5. **Guidance**: Help users through complex workflows
6. **Error Prevention**: Catch mistakes before they happen

### When to Use

| Scenario | Use Elicitation? | Pattern |
|----------|------------------|---------|
| Deleting records | ✅ Yes | Confirmation |
| Creating single record | ❌ Usually not | Direct (if all params provided) |
| Bulk operations | ✅ Yes | Confirmation + count preview |
| Missing parameters | ✅ Yes | Parameter collection |
| Ambiguous query | ✅ Yes | Disambiguation |
| Multi-step workflow | ✅ Yes | Progressive disclosure |
| Read-only query | ❌ No | Direct response |
| High-risk changes | ✅ Yes | Explicit confirmation |

## Common Elicitation Patterns

### Pattern 1: Confirmation for Destructive Actions

**Use when:** User requests deletion, bulk updates, or irreversible changes.

**Example:**

```
User: "Delete facility HAN"

AI: "⚠️ Warning: Deleting Facility HAN (Hannover)

This is a DESTRUCTIVE action that will permanently delete:
├─ The facility record
├─ All associated inspections (12 inspections)
├─ All associated shipments (45 shipments)  
├─ All contamination records (8 incidents)

📊 Total records affected: 66

This action CANNOT be undone.

To confirm, please type exactly: DELETE FACILITY HAN"

User: "DELETE FACILITY HAN"

AI: "✅ Confirmed. Deleting facility..."
[Executes deletion]
AI: "✅ Successfully deleted Facility HAN and 66 associated records"
```

**Implementation:**

```typescript
// In your tool handler
export const facilityTools = {
  delete_facility: {
    description: 'Delete a facility and all associated records',
    inputSchema: zodToJsonSchema(deleteFacilitySchema),
    handler: async (args: z.infer<typeof deleteFacilitySchema>) => {
      const { id, confirmation } = args;

      // Get facility details first
      const facility = await Facility.findById(id).lean();
      if (!facility) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Facility not found' })
          }],
          isError: true
        };
      }

      // Count associated records
      const [inspectionCount, shipmentCount, contaminantCount] = await Promise.all([
        Inspection.countDocuments({ facility_id: id }),
        Shipment.countDocuments({ facilityId: id }),
        Contaminant.countDocuments({ facilityId: id })
      ]);

      const totalRecords = 1 + inspectionCount + shipmentCount + contaminantCount;

      // Check if confirmation provided
      const expectedConfirmation = `DELETE FACILITY ${facility.shortCode}`;
      
      if (confirmation !== expectedConfirmation) {
        // Return confirmation request
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              requiresConfirmation: true,
              message: `⚠️ Warning: Deleting Facility ${facility.shortCode} (${facility.name})

This is a DESTRUCTIVE action that will permanently delete:
├─ The facility record
├─ All associated inspections (${inspectionCount} inspections)
├─ All associated shipments (${shipmentCount} shipments)  
├─ All contamination records (${contaminantCount} incidents)

📊 Total records affected: ${totalRecords}

This action CANNOT be undone.

To confirm, please type exactly: ${expectedConfirmation}`,
              expectedConfirmation,
              affectedRecords: {
                facility: 1,
                inspections: inspectionCount,
                shipments: shipmentCount,
                contaminants: contaminantCount,
                total: totalRecords
              }
            }, null, 2)
          }]
        };
      }

      // Confirmation matches - proceed with deletion
      try {
        // Delete in transaction for safety
        await Promise.all([
          Facility.findByIdAndDelete(id),
          Inspection.deleteMany({ facility_id: id }),
          Shipment.deleteMany({ facilityId: id }),
          Contaminant.deleteMany({ facilityId: id })
        ]);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              message: `✅ Successfully deleted Facility ${facility.shortCode} (${facility.name})`,
              deleted: {
                facility: 1,
                inspections: inspectionCount,
                shipments: shipmentCount,
                contaminants: contaminantCount,
                total: totalRecords
              }
            }, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: `Deletion failed: ${error.message}` })
          }],
          isError: true
        };
      }
    }
  }
};
```

**Schema:**

```typescript
const deleteFacilitySchema = z.object({
  id: z.string().describe('The ID of the facility to delete'),
  confirmation: z.string().optional().describe('Confirmation string (must match expected format)')
});
```

---

### Pattern 2: Parameter Collection

**Use when:** User's request is missing required parameters.

**Example:**

```
User: "Create a shipment"

AI: "I'll help you create a shipment. I need some information:

1️⃣ Which facility?
   a) Hannover (HAN)
   b) Berlin (BER)
   c) Munich (MUN)
   
Please choose a, b, or c:"

User: "a"

AI: "Great! Hannover facility selected.

2️⃣ What's the license plate number?"

User: "ABC-123"

AI: "Got it: ABC-123

3️⃣ What's the contract reference ID?"

User: "CNT-2025-001"

AI: "Perfect! 

4️⃣ What's the source location?"

User: "Industrial District A"

AI: "✅ Creating shipment with:
- Facility: Hannover (HAN)
- License Plate: ABC-123
- Contract: CNT-2025-001
- Source: Industrial District A

Proceed? (yes/no)"

User: "yes"

AI: "✅ Shipment created successfully! ID: 6905e7fc..."
```

**Implementation Tips:**

```typescript
// Use a state machine or conversation tracking

interface ShipmentCreationState {
  facilityId?: string;
  licensePlate?: string;
  contractId?: string;
  source?: string;
}

// Store state between interactions
const creationStates = new Map<string, ShipmentCreationState>();

// In your tool handler, check what's missing
function getNextMissingParameter(state: ShipmentCreationState): string | null {
  if (!state.facilityId) return 'facilityId';
  if (!state.licensePlate) return 'licensePlate';
  if (!state.contractId) return 'contractId';
  if (!state.source) return 'source';
  return null;
}
```

**Better approach:** Let AI handle the collection naturally through conversation, and only execute the tool when all parameters are available.

---

### Pattern 3: Disambiguation

**Use when:** User's request could refer to multiple entities.

**Example:**

```
User: "Show me the facility"

AI: "I found 5 facilities. Which one?

a) Hannover (HAN) - New York, NY
b) Berlin (BER) - Industrial Zone B
c) Munich (MUN) - Munich, Germany
d) Hamburg (HAM) - Hamburg Port Area
e) Frankfurt (FRA) - Frankfurt am Main

Please choose a-e, or provide more details:"

User: "b"

AI: "📍 Facility: Berlin (BER)

Location: Industrial Zone B
Status: Active
Created: Feb 1, 2025

Recent Activity:
├─ Inspections: 23 (95.7% acceptance rate)
├─ Shipments: 67
└─ Contaminants: 3 incidents

Would you like more detailed information about any aspect?"
```

**Implementation:**

```typescript
export const facilityTools = {
  get_facility: {
    description: 'Get details for a specific facility',
    inputSchema: zodToJsonSchema(getFacilitySchema),
    handler: async (args: z.infer<typeof getFacilitySchema>) => {
      const { identifier } = args;  // Could be ID, name, or shortCode

      // Try to find facility
      let facility = await Facility.findById(identifier).lean();
      
      if (!facility) {
        // Try by shortCode or name
        const facilities = await Facility.find({
          $or: [
            { shortCode: new RegExp(identifier, 'i') },
            { name: new RegExp(identifier, 'i') }
          ]
        }).lean();

        if (facilities.length === 0) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: 'No facilities found matching that identifier' })
            }],
            isError: true
          };
        }

        if (facilities.length === 1) {
          facility = facilities[0];
        } else {
          // Multiple matches - need disambiguation
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                requiresDisambiguation: true,
                message: `I found ${facilities.length} facilities matching "${identifier}". Which one?`,
                options: facilities.map((f, i) => ({
                  letter: String.fromCharCode(97 + i), // a, b, c, ...
                  id: f._id,
                  name: f.name,
                  shortCode: f.shortCode,
                  location: f.location
                }))
              }, null, 2)
            }]
          };
        }
      }

      // Single facility found - return details
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ facility }, null, 2)
        }]
      };
    }
  }
};
```

---

### Pattern 4: Progressive Disclosure

**Use when:** Complex workflow with multiple steps, revealing next step only after current completes.

**Example: Compliance Investigation Workflow**

```
User: "I want to investigate compliance issues"

AI: "I'll guide you through a compliance investigation.

📋 Step 1: Select Analysis Scope

What would you like to investigate?
a) Single facility
b) Multiple facilities (comparison)
c) System-wide analysis
d) Specific time period

Choose a-d:"

User: "a"

AI: "📋 Step 2: Select Facility

Which facility should we investigate?
[Shows facility list]"

User: "Hannover"

AI: "📋 Step 3: Select Investigation Areas

For Facility Hannover, investigate:
☐ a) Inspection compliance
☐ b) Contamination incidents
☐ c) Shipment patterns
☐ d) Contract compliance
☐ e) All of the above

Choose one or more (e.g., 'a, b, c'):"

User: "e"

AI: "📋 Step 4: Set Time Range

Analyze data from:
a) Last 30 days
b) Last 90 days
c) Last 6 months
d) Last year
e) All time

Choose a-e:"

User: "b"

AI: "Perfect! Starting comprehensive investigation:
✓ Facility: Hannover (HAN)
✓ Areas: All compliance aspects
✓ Time Range: Last 90 days

🔍 Investigating...
[Executes analysis]

📊 Compliance Investigation Report
[Shows detailed report]

Would you like to:
- Export this report
- Investigate another facility
- Get detailed analysis of specific findings"
```

**Benefits:**
- ✅ Not overwhelming (one question at a time)
- ✅ User can back out early
- ✅ Clear progress indication
- ✅ Flexible (can branch based on answers)

---

### Pattern 5: Validation Before Execution

**Use when:** Parameters provided need validation or might cause issues.

**Example:**

```
User: "Create 1000 test facilities"

AI: "⚠️ Hold on! You're about to create 1,000 facilities.

This will:
├─ Generate 1,000 database records
├─ Use significant storage space
├─ Impact system performance
├─ Create test data that may need cleanup later

Did you mean:
a) Create 10 test facilities (recommended for testing)
b) Create 100 test facilities
c) Yes, really create 1,000 (please confirm)

Choose a-c:"

User: "a"

AI: "Smart choice! Creating 10 test facilities instead..."
[Executes with adjusted count]
AI: "✅ Created 10 test facilities"
```

**Implementation:**

```typescript
// In tool handler, validate before executing
if (args.count > 100) {
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        warning: `You're about to create ${args.count} facilities.`,
        recommendations: [
          `a) Create 10 facilities (recommended for testing)`,
          `b) Create 100 facilities`,
          `c) Yes, really create ${args.count} (please confirm)`
        ],
        message: 'This seems like a lot. Did you mean something else?'
      }, null, 2)
    }]
  };
}
```

---

### Pattern 6: Multiple Choice Selection

**Use when:** User needs to choose from a set of options.

**Example:**

```
User: "Generate a report"

AI: "📊 Which type of report would you like?

a) 📈 Compliance Summary
   - Acceptance rates, trends, recommendations
   - Best for: Weekly reviews
   
b) ☢️ Contamination Analysis
   - Incident breakdown, severity levels, patterns
   - Best for: Safety assessments
   
c) 🚚 Shipment Activity
   - Volume, sources, processing times
   - Best for: Operational reviews
   
d) 🏭 Facility Performance
   - Multi-facility comparison, rankings
   - Best for: Management decisions
   
e) 📋 Custom Report
   - I'll help you build a custom report
   
Choose a-e:"

User: "a"

AI: "Great! Generating Compliance Summary...
[Executes]
📈 Compliance Summary Report
[Shows report]"
```

**Best Practices:**
- ✅ Use letters (a, b, c) instead of numbers for options
- ✅ Keep descriptions short but informative
- ✅ Add "Best for" context when helpful
- ✅ Limit to 5-7 options (more is overwhelming)
- ✅ Always include "other/custom" option if applicable

---

### Pattern 7: Confirmation Summary

**Use when:** Multiple parameters collected, confirm before final execution.

**Example:**

```
User: "Schedule automated report"

[After collecting: frequency, recipients, report type, time...]

AI: "📋 Please confirm your scheduled report:

Report Configuration:
├─ Type: Weekly Compliance Summary
├─ Frequency: Every Monday at 8:00 AM
├─ Recipients: compliance@example.com, manager@example.com
├─ Format: PDF + Email
├─ Start Date: Nov 4, 2025
└─ Facilities: All (4 facilities)

Is this correct?
a) ✅ Yes, schedule this report
b) ✏️ Edit configuration
c) ❌ Cancel

Choose a-c:"

User: "a"

AI: "✅ Scheduled! Your weekly compliance report will be generated and sent every Monday at 8:00 AM starting Nov 4, 2025.

Job ID: weekly-compliance-001
Next run: Monday, Nov 4, 2025 8:00 AM

You can manage this scheduled report with:
- View details: 'show report schedule weekly-compliance-001'
- Pause: 'pause report schedule weekly-compliance-001'
- Delete: 'delete report schedule weekly-compliance-001'"
```

---

## Design Best Practices

### 1. Clear Communication

✅ **Good:**
```
"⚠️ This will delete 23 shipments. Type 'CONFIRM DELETE' to proceed."
```

❌ **Bad:**
```
"Are you sure?"
```

### 2. Provide Context

✅ **Good:**
```
"Deleting this facility will affect:
├─ 12 inspections
├─ 45 shipments
└─ 8 contamination records
Total: 66 records will be permanently deleted."
```

❌ **Bad:**
```
"This will delete some related data."
```

### 3. Use Visual Hierarchy

✅ **Good:**
```
📊 Compliance Report Options:

a) 📈 Weekly Summary
   Quick overview of last week
   
b) 📋 Detailed Analysis
   Comprehensive multi-facility review
   
c) 🚨 Incident Report
   Focus on contamination events
```

❌ **Bad:**
```
Options: weekly, detailed, incident
```

### 4. Enable Easy Cancellation

✅ **Good:**
```
"Ready to delete 50 facilities?
a) Yes, proceed
b) No, cancel

Type 'a' or 'b' (or just 'cancel'):"
```

❌ **Bad:**
```
"Type YES to confirm or literally anything else to cancel:"
```

### 5. Confirm Destructive Actions

✅ **Good:**
```
"To confirm deletion, type: DELETE FACILITY HAN"
```

❌ **Bad:**
```
"Delete facility? (y/n)"
```

**Why?** Typing the full phrase prevents accidental confirmations.

### 6. Show Progress

✅ **Good:**
```
"📋 Step 2 of 4: Select Time Range

Previous selections:
✓ Facility: Hannover
✓ Analysis Type: Compliance

Time range:
a) Last 30 days
b) Last 90 days
c) Custom range"
```

❌ **Bad:**
```
"Select time range"
```

### 7. Provide Examples

✅ **Good:**
```
"Enter date range (format: YYYY-MM-DD to YYYY-MM-DD)
Example: 2025-01-01 to 2025-03-31"
```

❌ **Bad:**
```
"Enter date range"
```

### 8. Validate Input

✅ **Good:**
```
User: "maybe"

AI: "I didn't understand 'maybe'. Please choose:
a) Yes, proceed
b) No, cancel

Type 'a' or 'b':"
```

❌ **Bad:**
```
AI: [Proceeds with default action]
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Too Many Questions

**Bad:**
```
AI: "What's the facility?"
User: "HAN"
AI: "What's the inspection type?"
User: "Delivery"
AI: "What's the date?"
User: "Today"
AI: "What's the waste type?"
User: "Plastic"
AI: "What percentage?"
User: [frustrated, gives up]
```

**Better:**
```
AI: "I'll help you create an inspection. Tell me:
- Facility (name or code)
- Inspection type
- Waste details

Or say 'guide me' for step-by-step."
```

### ❌ Anti-Pattern 2: Unclear Options

**Bad:**
```
AI: "Choose: 1, 2, or 3"
User: "What are they?"
```

**Better:**
```
AI: "Choose:
a) Option 1 - Description
b) Option 2 - Description  
c) Option 3 - Description"
```

### ❌ Anti-Pattern 3: No Confirmation for Risky Actions

**Bad:**
```
User: "Delete old data"
AI: [Deletes 5000 records]
AI: "Done!"
```

**Better:**
```
User: "Delete old data"
AI: "Found 5000 old records. Delete all? (yes/no)"
User: "yes"
AI: "Type 'DELETE 5000 RECORDS' to confirm"
User: [confirms]
AI: "Deleting... Done! 5000 records deleted."
```

### ❌ Anti-Pattern 4: Forced Linear Flow

**Bad:**
```
[Must go through 10 steps even if user knows what they want]
```

**Better:**
```
AI: "I can guide you step-by-step, or if you know what you want, just tell me:
'Create facility called Berlin with code BER in location Germany'"
```

### ❌ Anti-Pattern 5: Not Showing Preview

**Bad:**
```
User: "Update all facilities"
AI: [Updates 50 facilities]
AI: "Done!"
```

**Better:**
```
User: "Update all facilities"
AI: "This will update 50 facilities. Preview:
- Hannover (HAN)
- Berlin (BER)
... (48 more)

Proceed? (yes/no)"
```

---

## Implementation Patterns

### Pattern A: Stateless (AI Manages State)

Let Claude manage the conversation state naturally:

```typescript
// Your tools just check if they have what they need
export const shipmentTools = {
  create_shipment: {
    handler: async (args) => {
      // Check for missing required fields
      const missing = [];
      if (!args.facilityId) missing.push('facility');
      if (!args.licensePlate) missing.push('license plate');
      if (!args.contractId) missing.push('contract ID');

      if (missing.length > 0) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Missing required fields',
              missing,
              message: `Please provide: ${missing.join(', ')}`
            })
          }],
          isError: true
        };
      }

      // All params present - create shipment
      // ...
    }
  }
};
```

**Pros:**
- ✅ Simple implementation
- ✅ Claude handles conversation flow naturally
- ✅ No state management needed

**Cons:**
- ❌ Less control over exact flow
- ❌ Claude might ask differently each time

### Pattern B: State Machine (Server Manages State)

Store conversation state on the server:

```typescript
interface WorkflowState {
  step: number;
  data: Record<string, any>;
  userId: string;
}

const activeWorkflows = new Map<string, WorkflowState>();

export const workflowTools = {
  facility_deletion_workflow: {
    handler: async (args) => {
      const { userId, action, data } = args;
      const state = activeWorkflows.get(userId) || {
        step: 0,
        data: {},
        userId
      };

      switch (state.step) {
        case 0: // Initial request
          state.facilityId = data.facilityId;
          state.step = 1;
          // Get confirmation details
          const counts = await getCounts(state.facilityId);
          activeWorkflows.set(userId, state);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                step: 1,
                message: `Confirm deletion of ${counts.total} records?`,
                confirmationRequired: 'DELETE FACILITY'
              })
            }]
          };
        
        case 1: // Waiting for confirmation
          if (data.confirmation === 'DELETE FACILITY') {
            // Execute deletion
            await deleteFacility(state.facilityId);
            activeWorkflows.delete(userId);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ success: true, message: 'Deleted' })
              }]
            };
          } else {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ error: 'Invalid confirmation' })
              }],
              isError: true
            };
          }
      }
    }
  }
};
```

**Pros:**
- ✅ Full control over flow
- ✅ Consistent experience
- ✅ Can enforce specific sequences

**Cons:**
- ❌ Complex implementation
- ❌ Need to handle state cleanup
- ❌ Harder to make flexible

**Recommendation:** Use Pattern A (stateless) and let Claude handle the conversation flow. It's simpler and works well in practice.

---

## Testing Elicitation Flows

### Manual Testing

```bash
# Test in MCP Inspector

# 1. Trigger elicitation
{
  "method": "tools/call",
  "params": {
    "name": "delete_facility",
    "arguments": {
      "id": "6905db9211cc522275d5f013"
    }
  }
}

# Should return confirmation request

# 2. Provide confirmation
{
  "method": "tools/call",
  "params": {
    "name": "delete_facility",
    "arguments": {
      "id": "6905db9211cc522275d5f013",
      "confirmation": "DELETE FACILITY HAN"
    }
  }
}

# Should execute deletion
```

### Automated Tests

```typescript
describe('Elicitation Patterns', () => {
  describe('Confirmation Pattern', () => {
    it('should require confirmation for deletion', async () => {
      const result = await callTool('delete_facility', {
        id: testFacilityId
      });

      expect(result.content[0].text).toContain('requiresConfirmation');
      expect(result.content[0].text).toContain('DELETE FACILITY');
    });

    it('should reject invalid confirmation', async () => {
      const result = await callTool('delete_facility', {
        id: testFacilityId,
        confirmation: 'yes'  // Wrong format
      });

      expect(result.content[0].text).toContain('requiresConfirmation');
    });

    it('should execute with valid confirmation', async () => {
      const result = await callTool('delete_facility', {
        id: testFacilityId,
        confirmation: 'DELETE FACILITY TEST'
      });

      expect(result.content[0].text).toContain('Successfully deleted');
    });
  });

  describe('Disambiguation Pattern', () => {
    it('should return options for ambiguous query', async () => {
      const result = await callTool('get_facility', {
        identifier: 'fac'  // Matches multiple
      });

      expect(result.content[0].text).toContain('requiresDisambiguation');
      expect(result.content[0].text).toContain('options');
    });

    it('should return single result for unique match', async () => {
      const result = await callTool('get_facility', {
        identifier: 'HAN'  // Unique shortCode
      });

      expect(result.content[0].text).toContain('facility');
      expect(result.content[0].text).not.toContain('disambiguation');
    });
  });
});
```

---

## Summary

### Key Takeaways

1. **Always Confirm Destructive Actions**
   - Show what will be affected
   - Require explicit confirmation (not just "yes")
   - Provide counts and previews

2. **Collect Missing Parameters Naturally**
   - Let AI guide the conversation
   - Don't force rigid step-by-step flows
   - Allow users to provide all params at once if they want

3. **Disambiguate When Necessary**
   - Offer clear options
   - Provide context for each option
   - Use letters (a, b, c) not numbers

4. **Use Progressive Disclosure for Complex Workflows**
   - One question at a time
   - Show progress
   - Allow backing out

5. **Validate Before Executing**
   - Check for unusual values
   - Warn about performance impacts
   - Suggest alternatives

6. **Design for Safety**
   - Preview changes
   - Allow cancellation
   - Confirm intentions
   - Show affected records

### Implementation Checklist

- [ ] Identify destructive operations → Add confirmation
- [ ] Find operations with many parameters → Add collection flow
- [ ] Look for ambiguous queries → Add disambiguation
- [ ] Review bulk operations → Add previews
- [ ] Test each elicitation pattern
- [ ] Document expected confirmation formats
- [ ] Add examples to tool descriptions
- [ ] Test error cases (wrong input, cancellation)

## Related Guides

- [Client Execution Flow](./client-execution-flow.md) - How patterns fit into overall flow
- [Sampling Guide](./sampling-guide.md) - Server-initiated requests
- [Best Practices](./best-practices.md) - General MCP guidelines
- [Error Handling](./error-handling.md) - Handling failures gracefully

---

**Remember:** Good elicitation makes your MCP server safe, user-friendly, and professional. Always confirm before destructive actions, guide users through complex flows, and validate inputs before execution!

