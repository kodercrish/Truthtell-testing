from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
from collections import defaultdict

router = APIRouter(
    prefix="/video",
    tags=["video broadcast"],
    responses={404: {"description": "Not found"}},
)

# Maps to store socket connections
room_to_sockets_map: Dict[str, List[WebSocket]] = defaultdict(list)
# Maps to store user IDs in rooms
room_to_users_map: Dict[str, Dict[int, str]] = defaultdict(dict)
# Add new map to track roles
room_to_roles_map: Dict[str, Dict[int, str]] = defaultdict(dict)

@router.get("/")
async def video_broadcast_info():
    """
    Get information about the video broadcasting service
    """
    return {
        "service": "TruthTell Video Broadcasting",
        "status": "online",
        "endpoints": {
            "websocket": "/video/ws/{room}"
        }
    }

@router.get("/rooms")
async def get_active_rooms():
    """
    Get a list of all active rooms and their connection counts
    """
    active_rooms = list(room_to_sockets_map.keys())
    room_stats = {room: len(connections) for room, connections in room_to_sockets_map.items()}
    return {
        "active_rooms": active_rooms,
        "room_stats": room_stats
    }

@router.websocket("/ws/{room}")
async def websocket_endpoint(websocket: WebSocket, room: str):
    """
    WebSocket endpoint for video broadcasting in rooms
    """
    await websocket.accept()
    user_id = id(websocket)
    print(f"WebSocket Connected: {websocket.client} with ID {user_id}")

    room_to_sockets_map[room].append(websocket)
    room_to_users_map[room][user_id] = str(user_id)

    try:
        # Notify everyone about the new user
        await broadcast_to_room(room, {
            "event": "user:joined", 
            "data": {"id": user_id, "username": str(user_id)}
        }, exclude=websocket)

        while True:
            data = await websocket.receive_json()
            event = data.get("event")

            if event == "room:join":
                role = data.get("data", {}).get("role", "viewer")
                username = data.get("data", {}).get("username", str(user_id))
                room_to_users_map[room][user_id] = username
                room_to_roles_map[room][user_id] = role
                
                await websocket.send_json({
                    "event": "room:joined", 
                    "data": {"id": user_id, "role": role, "room": room}
                })

                # Notify viewers if broadcaster joins
                if role == "broadcaster":
                    await broadcast_to_room(room, {
                        "event": "broadcast:started",
                        "data": {"broadcaster": user_id}
                    }, exclude=websocket)

            elif event == "webrtc:offer" and room_to_roles_map[room].get(user_id) == "broadcaster":
                # Broadcaster sends offer to all viewers
                offer = data.get("data", {}).get("offer")
                if offer:
                    for ws in room_to_sockets_map[room]:
                        other_id = id(ws)
                        if other_id != user_id and room_to_roles_map[room].get(other_id) == "viewer":
                            await ws.send_json({
                                "event": "webrtc:offer",
                                "data": offer,
                                "from": user_id
                            })

            elif event == "webrtc:answer":
                # Viewer sends answer back to broadcaster
                target_id = data.get("target")
                if target_id:
                    for ws in room_to_sockets_map[room]:
                        if id(ws) == target_id:
                            await ws.send_json({
                                "event": "webrtc:answer",
                                "data": data.get("data"),
                                "from": user_id
                            })
                            break

            elif event == "webrtc:ice-candidate":
                # Forward ICE candidates
                candidate = data.get("data", {}).get("candidate")
                if candidate:
                    for ws in room_to_sockets_map[room]:
                        if id(ws) != user_id:
                            await ws.send_json({
                                "event": "webrtc:ice-candidate",
                                "data": {"candidate": candidate, "from": user_id}
                            })

            elif event == "message:broadcast":
                message = data.get("message")
                await broadcast_to_room(room, {
                    "event": "message:broadcast", 
                    "data": {"from": user_id, "message": message}
                })

    except WebSocketDisconnect:
        print(f"WebSocket Disconnected: User {user_id}")
        if websocket in room_to_sockets_map[room]:
            room_to_sockets_map[room].remove(websocket)
        
        # Remove user from the room
        if user_id in room_to_users_map[room]:
            del room_to_users_map[room][user_id]
            
        # Notify others that user has left
        await broadcast_to_room(room, {
            "event": "user:left", 
            "data": {"id": user_id}
        })
            
        # Clean up empty rooms
        if len(room_to_sockets_map[room]) == 0:
            del room_to_sockets_map[room]
            if room in room_to_users_map:
                del room_to_users_map[room]
        if user_id in room_to_roles_map[room]:
            role = room_to_roles_map[room][user_id]
            del room_to_roles_map[room][user_id]
            
            # If broadcaster leaves, notify all viewers
            if role == "broadcaster":
                await broadcast_to_room(room, {
                    "event": "broadcast:ended",
                    "data": {"broadcaster_id": user_id}
                })

async def broadcast_to_room(room: str, message: dict, exclude: WebSocket = None):
    """
    Broadcast a message to all clients in a specific room, optionally excluding one
    """
    for websocket in room_to_sockets_map[room]:
        if exclude is None or websocket != exclude:
            await websocket.send_json(message)