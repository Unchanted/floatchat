# WebSocket Integration Setup

This document explains how the WebSocket integration works between the frontend and backend for real-time ocean data queries.

## Overview

The application now supports real-time communication between the frontend chat interface and the backend WebSocket server. When users send queries through the text box, they are sent to the WebSocket server at `wss://0r8w7bh1-8000.inc1.devtunnels.ms/ws` and responses are received in real-time.

## Backend Changes

### Dependencies Added
- `websockets>=12.0` - For WebSocket support in FastAPI

### WebSocket Server
- **Endpoint**: `/ws`
- **Protocol**: WebSocket
- **Message Format**: JSON
- **Input**: `{"query": "your ocean data query"}`
- **Output**: `{"type": "response", "content": "response text", "query": "original query", "timestamp": 1234567890}`

### Features
- Connection management with automatic cleanup
- CORS support for cross-origin requests
- Error handling and logging
- Simulated processing time (1 second delay)

## Frontend Changes

### WebSocket Service (`src/lib/websocket.ts`)
- **Connection URL**: `wss://0r8w7bh1-8000.inc1.devtunnels.ms/ws`
- **Auto-reconnection**: Up to 5 attempts with exponential backoff
- **Error handling**: Graceful fallback when connection fails
- **TypeScript interfaces**: Type-safe message handling

### Chat Interface Updates
- **Real-time communication**: Messages sent via WebSocket instead of simulated responses
- **Connection status indicator**: Shows connection state (connecting/connected/disconnected)
- **Input validation**: Disables input when not connected
- **Fallback responses**: Shows error message if WebSocket fails

## How to Test

### 1. Test WebSocket Connection
Open `test-websocket.html` in your browser to test the WebSocket connection independently.

### 2. Test Full Application
1. Start the backend server:
   ```bash
   cd apps/backend
   uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. Start the frontend development server:
   ```bash
   cd apps/frontend
   npm run dev
   ```

3. Open the application in your browser and try sending a query

## Message Flow

1. **User Input**: User types a query in the chat input
2. **WebSocket Send**: Query is sent as JSON to the WebSocket server
3. **Backend Processing**: Server processes the query (currently simulated)
4. **Response**: Server sends back a JSON response
5. **UI Update**: Frontend displays the response in the chat interface

## Error Handling

- **Connection failures**: Automatic reconnection with exponential backoff
- **Message sending failures**: Graceful fallback with error message
- **WebSocket errors**: Proper error logging and user notification
- **Network issues**: Connection status indicator shows current state

## Configuration

### Backend
- WebSocket endpoint: `/ws`
- CORS: Configured for all origins (change in production)
- Logging: INFO level for connection events

### Frontend
- WebSocket URL: `wss://0r8w7bh1-8000.inc1.devtunnels.ms/ws`
- Reconnection attempts: 5
- Reconnection delay: 1 second (exponential backoff)

## Production Considerations

1. **Security**: Update CORS settings to specific domains
2. **Authentication**: Add WebSocket authentication if needed
3. **Rate limiting**: Implement rate limiting for WebSocket connections
4. **Monitoring**: Add proper logging and monitoring
5. **SSL/TLS**: Ensure secure WebSocket connections (WSS)

## Troubleshooting

### Common Issues
1. **Connection refused**: Check if the WebSocket server is running
2. **CORS errors**: Verify CORS configuration in backend
3. **SSL errors**: Ensure using `wss://` for secure connections
4. **Message format**: Verify JSON format matches expected schema

### Debug Steps
1. Check browser console for WebSocket errors
2. Verify backend logs for connection attempts
3. Test with the provided HTML test file
4. Check network tab for WebSocket connection status
