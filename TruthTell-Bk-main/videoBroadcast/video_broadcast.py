from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from collections import defaultdict

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to the specific origins you want to allow
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Maps to store socket connections
room_to_sockets_map: Dict[str, List[WebSocket]] = defaultdict(list)

@app.websocket("/ws/{room}")
async def websocket_endpoint(websocket: WebSocket, room: str):
    await websocket.accept()
    print(f"WebSocket Connected: {websocket.client}")

    room_to_sockets_map[room].append(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            event = data.get("event")

            if event == "room:join":
                role = data.get("data", {}).get("role", "viewer")
                await websocket.send_json({"event": "room:join", "data": {"role": role}})
                await broadcast_to_room(room, {"event": "user:joined", "data": {"id": id(websocket)}})

            elif event == "message:broadcast":
                message = data.get("message")
                await broadcast_to_room(room, {"event": "message:broadcast", "data": {"from": id(websocket), "message": message}})

    except WebSocketDisconnect:
        print("WebSocket Disconnected")
        room_to_sockets_map[room].remove(websocket)

async def broadcast_to_room(room: str, message: dict):
    for websocket in room_to_sockets_map[room]:
        await websocket.send_json(message)

# if _name_ == "_main_":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)