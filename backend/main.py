from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from alith import Agent
from typing import Dict
import uuid
import asyncio

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Alith agent
agent = Agent(
    model="llama3-70b-8192",
    api_key="<API_KEY>",  # Replace with your actual API key
    base_url="https://api.groq.com/openai/v1",
    preamble="You are a helpful AI assistant. Be friendly and provide concise answers.",
)

# Active connections
active_connections: Dict[str, WebSocket] = {}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    active_connections[client_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            
            # Get response from Alith
            response = agent.prompt(data)
            
            # Send response back to client
            await websocket.send_text(response)
            
    except WebSocketDisconnect:
        del active_connections[client_id]
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()

@app.get("/start_chat")
async def start_chat():
    client_id = str(uuid.uuid4())
    return {"client_id": client_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
