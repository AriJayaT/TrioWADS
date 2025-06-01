# Real-time Ticket Assignment Testing Guide

## Overview
This document explains how to test the real-time ticket assignment feature to ensure agents receive immediate updates when tickets are assigned to them without needing to refresh the page.

## Recent Improvements (Enhanced Real-time Updates)

### Backend Improvements:
1. **Enhanced Data Population**: Ticket assignment now includes proper population of `assignedTo` with full user data including `name`, `email`, `agentType`, and `role`
2. **Improved Logging**: Better socket event logging with structured data for easier debugging
3. **Dual Event Emission**: Emitting both `ticket_assigned` and `ticket_updated` events to ensure all components receive updates
4. **Test Route**: Added `POST /api/tickets/test-socket/:ticketId/:agentId` for manual testing

### Frontend Improvements:
1. **Robust ID Comparison**: Enhanced agent ID comparison with string conversion for consistent matching
2. **Better Error Handling**: Added validation for missing data and improved error logging
3. **State Refresh**: Added automatic ticket list refresh after assignment for data consistency
4. **Enhanced Logging**: Structured logging with key data points for easier debugging

## How It Works

### Backend (Server-side)
1. When an admin assigns a ticket to an agent via `PUT /api/tickets/:id`, the `updateTicket` controller:
   - Updates the ticket in the database with proper population
   - Creates a fully populated ticket object with assignedTo user details
   - Emits `ticket_assigned` event to the specific agent with complete data
   - Emits `ticket_updated` event to all relevant users
   - Creates notifications for the assigned agent and customer

### Frontend (Client-side)
1. **AgentDashboard**: Listens for `ticket_assigned` events and updates the active tickets list
2. **TicketList**: Listens for `ticket_assigned` events and moves tickets from unassigned to assigned lists
3. **All Components**: Enhanced ID comparison and data validation for reliable updates

## Testing Steps

### 1. Set Up Test Environment
1. Start the backend server: `cd server && npm run dev`
2. Start the frontend: `cd Frontend && npm run dev`
3. Open multiple browser tabs/windows:
   - Admin dashboard: `http://localhost:5173/admin/login`
   - Agent dashboard: `http://localhost:5173/agent/login`

### 2. Verify Socket Connection
1. Login as an agent and check browser console for:
   ```
   [Socket] Connected successfully
   [Socket] Authentication successful, role: agent
   [TicketList] Setting up socket event handlers
   ```

### 3. Test Real-time Assignment

#### Method 1: Through Admin Interface
1. **In Admin tab**: Go to Agent Management (`/admin/agents`)
2. **Assign a ticket**: Use the dropdown to assign a ticket to an agent
3. **In Agent tab**: Watch for immediate updates without refresh

#### Method 2: Using Test Route (Admin Token Required)
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/tickets/test-socket/TICKET_ID/AGENT_ID
```

### 4. Debug Information
Access debug endpoints (admin only):
- Check connected users: `GET /api/tickets/debug/connections`
- Test socket events: `POST /api/tickets/test-socket/:ticketId/:agentId`

## Expected Behavior

### When a ticket is assigned:
1. **Admin sees**: Ticket removed from unassigned list immediately
2. **Assigned agent sees**: 
   - New ticket appears in their dashboard active tickets
   - Ticket appears in their assigned tickets list (TicketList page)
   - Notification bell shows new notification
   - Console shows successful event handling
3. **Customer sees**: Notification that ticket was assigned

### Console Logs to Watch For:

#### Server Logs:
```
[TicketController] Ticket [ticketId] assigned to agent [agentId]
[Socket] Emitting ticket_assigned to user [agentId]: {ticketId, subject, assignedTo}
[Socket] User [agentId] found with socket [socketId], role: agent
[Socket] Event ticket_assigned emitted successfully to user [agentId]
```

#### Frontend Logs (Agent):
```
[TicketList] Ticket assigned event received: {ticketId, assignedTo, currentUserId}
[TicketList] Assignment check: {assignedToId, currentUserId, isAssignedToMe: true}
[TicketList] Ticket [ticketId] assigned to current agent - updating state
[TicketList] Adding new assigned ticket to list: [subject]
```

## Troubleshooting

### Issue: Agent not receiving real-time updates

#### Step 1: Verify Socket Connection
```javascript
// Check browser console for these logs:
[Socket] Connected successfully
[Socket] Authentication successful, role: agent
```

#### Step 2: Check User ID Consistency
```javascript
// Compare these values in browser console:
console.log('Frontend User ID:', user._id, typeof user._id);
// And in server logs:
[Socket] Authenticating user: [userId] on socket: [socketId]
```

#### Step 3: Verify Event Emission
```javascript
// Server should log:
[Socket] Emitting ticket_assigned to user [agentId]
[Socket] Event ticket_assigned emitted successfully to user [agentId]
```

#### Step 4: Check Event Reception
```javascript
// Frontend should log:
[TicketList] Ticket assigned event received
[TicketList] Is assigned to me: true
```

### Common Issues and Solutions

1. **User ID Mismatch**: 
   - **Problem**: Frontend `user._id` doesn't match backend `userId`
   - **Solution**: Check authentication token and user object consistency

2. **Socket Disconnection**: 
   - **Problem**: User socket disconnected but frontend doesn't know
   - **Solution**: Check network connection and browser console for connection errors

3. **Event Handler Not Registered**: 
   - **Problem**: Component unmounted before event received
   - **Solution**: Ensure component is still mounted when assignment occurs

4. **Data Population Issues**:
   - **Problem**: `assignedTo` field not properly populated
   - **Solution**: Verify server populates `assignedTo` with full user object

5. **Type Conversion Issues**:
   - **Problem**: ObjectId comparison failing due to type differences
   - **Solution**: Enhanced ID comparison with string conversion now implemented

### Manual Testing Commands

```bash
# Check connected users (admin token required)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/tickets/debug/connections

# Test socket event emission (admin token required)
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/tickets/test-socket/TICKET_ID/AGENT_ID

# Update ticket assignment (admin/agent token required)
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assignedTo": "AGENT_ID", "status": "in-progress"}' \
  http://localhost:5000/api/tickets/TICKET_ID
```

## Success Criteria
- ✅ Agent receives ticket without refreshing page
- ✅ Ticket appears in agent's active tickets immediately  
- ✅ Unassigned tickets list updates in real-time
- ✅ Notifications appear immediately
- ✅ Dashboard metrics update automatically
- ✅ Console logs show successful event flow
- ✅ Event handlers properly receive and process assignments
- ✅ Robust ID comparison handles different data types
- ✅ Proper error handling for edge cases

## Performance Notes
- Events are emitted to both specific socket ID and user room for redundancy
- Automatic ticket refresh occurs 1 second after assignment for data consistency
- Duplicate event prevention on server side to avoid excessive notifications 