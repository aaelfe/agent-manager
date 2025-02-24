from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import subprocess
import uvicorn
import os

app = FastAPI()

# Dictionary to track running agents
agents = {}

@app.post("/start-agent")
def start_agent(agent_id: str):
    """Starts an OpenHands agent as a subprocess."""
    if agent_id in agents:
        return {"error": "Agent already running"}
    
    process = subprocess.Popen(["python", "-m", "openhands.agent"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    agents[agent_id] = process
    return {"message": "Agent started", "agent_id": agent_id}

@app.post("/stop-agent")
def stop_agent(agent_id: str):
    """Stops an OpenHands agent."""
    if agent_id not in agents:
        return {"error": "Agent not found"}
    
    agents[agent_id].terminate()
    del agents[agent_id]
    return {"message": "Agent stopped", "agent_id": agent_id}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Received: {data}")
    except WebSocketDisconnect:
        pass

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host=host, port=port)
