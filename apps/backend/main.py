from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import uvicorn
import os
from pydantic import BaseModel
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dictionary to track running agents
agents = {}

# Create Pydantic model for request validation
class AgentRequest(BaseModel):
    agent_id: str

@app.post("/start-agent")
def start_agent(request: AgentRequest):
    """Starts an OpenHands agent as a subprocess."""
    agent_id = request.agent_id
    logger.info(f"Request to start agent: {agent_id}")
    
    if agent_id in agents:
        return {"error": "Agent already running"}
    
    try:
        process = subprocess.Popen(["python", "-m", "openhands.agent"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        agents[agent_id] = process
        logger.info(f"Agent started: {agent_id}")
        return {"message": "Agent started", "agent_id": agent_id}
    except Exception as e:
        logger.error(f"Error starting agent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start agent: {str(e)}")

@app.post("/stop-agent")
def stop_agent(request: AgentRequest):
    """Stops an OpenHands agent."""
    agent_id = request.agent_id
    logger.info(f"Request to stop agent: {agent_id}")
    
    if agent_id not in agents:
        return {"error": "Agent not found"}
    
    try:
        agents[agent_id].terminate()
        del agents[agent_id]
        logger.info(f"Agent stopped: {agent_id}")
        return {"message": "Agent stopped", "agent_id": agent_id}
    except Exception as e:
        logger.error(f"Error stopping agent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to stop agent: {str(e)}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("WebSocket connection request received")
    
    try:
        await websocket.accept()
        logger.info("WebSocket connection accepted")
        
        await websocket.send_text("Connected to server")
        
        try:
            while True:
                data = await websocket.receive_text()
                logger.info(f"Received message: {data}")
                await websocket.send_text(f"Received: {data}")
        except WebSocketDisconnect:
            logger.info("WebSocket disconnected")
        except Exception as e:
            logger.error(f"WebSocket error: {str(e)}")
    except Exception as e:
        logger.error(f"Error accepting WebSocket connection: {str(e)}")

@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
