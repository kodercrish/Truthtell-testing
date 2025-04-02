import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Video, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { v4 as uuidv4 } from 'uuid';

interface Room {
  id: string;
  name: string;
  participants: number;
}

export default function VideoBroadcast() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  
  const api_url = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const ws_url = api_url.replace(/^http/, 'ws');

  // Fetch active rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoadingRooms(true);
        const response = await fetch(`${api_url}/video/rooms`);
        const data = await response.json();
        
        // Transform the data into our Room format
        const roomList: Room[] = Object.keys(data.room_stats).map(roomId => ({
          id: roomId,
          name: roomId, // We could store room names in the future
          participants: data.room_stats[roomId]
        }));
        
        setRooms(roomList);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
    
    // Poll for room updates every 5 seconds
    const interval = setInterval(fetchRooms, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [api_url]);

  // Handle WebSocket connection
  useEffect(() => {
    if (joinedRoom) {
      // Close any existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Create new WebSocket connection
      wsRef.current = new WebSocket(`${ws_url}/video/ws/${joinedRoom}`);
      
      wsRef.current.onopen = () => {
        console.log(`Connected to room: ${joinedRoom}`);
        wsRef.current?.send(JSON.stringify({
          event: "room:join",
          data: { room: joinedRoom }
        }));
        
        // If broadcasting, initiate the WebRTC offer
        if (isBroadcasting && streamRef.current) {
          initiatePeerConnection();
        }
      };
      
      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);
        
        // Handle different event types
        if (data.event === "user:joined") {
          console.log("New user joined the room");
          // If broadcasting, send an offer to the new user
          if (isBroadcasting && streamRef.current) {
            createAndSendOffer();
          }
        } else if (data.event === "webrtc:offer" && !isBroadcasting) {
          // Handle incoming offer (for viewers)
          await handleOffer(data.data.offer);
        } else if (data.event === "webrtc:answer" && isBroadcasting) {
          // Handle incoming answer (for broadcaster)
          await handleAnswer(data.data.answer);
        } else if (data.event === "webrtc:ice-candidate") {
          // Handle ICE candidate
          await handleIceCandidate(data.data.candidate);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      
      wsRef.current.onclose = () => {
        console.log("WebSocket connection closed");
        // Clean up peer connection
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
      };
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      // Clean up peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [joinedRoom, ws_url, isBroadcasting]);

  // Clean up media stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // WebRTC functions
  const initiatePeerConnection = () => {
    // Create a new RTCPeerConnection
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    // Add local stream tracks to the peer connection
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, streamRef.current!);
      });
    }
    
    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          event: "webrtc:ice-candidate",
          data: { candidate: event.candidate }
        }));
      }
    };
    
    // For viewers, handle incoming streams
    peerConnectionRef.current.ontrack = (event) => {
      console.log("Received remote track", event.streams[0]);
      remoteStreamRef.current = event.streams[0];
      
      // Display the remote stream in the video element
      if (videoRef.current && !isBroadcasting) {
        videoRef.current.srcObject = remoteStreamRef.current;
      }
    };
  };

  const createAndSendOffer = async () => {
    if (!peerConnectionRef.current || !wsRef.current) return;
    
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      wsRef.current.send(JSON.stringify({
        event: "webrtc:offer",
        data: { offer }
      }));
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!wsRef.current) return;
    
    try {
      // Initialize peer connection for viewer
      initiatePeerConnection();
      
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        wsRef.current.send(JSON.stringify({
          event: "webrtc:answer",
          data: { answer }
        }));
      }
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };

  const startBroadcast = async () => {
    setIsLoading(true);
    try {
      // Generate a room ID if not provided
      const newRoomId = roomName.trim() || `room-${uuidv4().substring(0, 8)}`;
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support media devices access. Please use a modern browser.");
      }
      
      // Try to get user media with more specific constraints and error handling
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }, 
          audio: true 
        });
        
        streamRef.current = stream;
        
        // Display the stream in the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Join the room
        setJoinedRoom(newRoomId);
        setIsBroadcasting(true);
        
        // Add the new room to our list
        setRooms(prev => [...prev, {
          id: newRoomId,
          name: roomName || newRoomId,
          participants: 1
        }]);
        
      } catch (mediaError) {
        // Handle specific media errors
        if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
          throw new Error("Camera access denied. Please allow camera and microphone access in your browser settings.");
        } else if (mediaError.name === 'NotFoundError' || mediaError.name === 'DevicesNotFoundError') {
          throw new Error("No camera or microphone found. Please connect a camera to your device.");
        } else if (mediaError.name === 'NotReadableError' || mediaError.name === 'TrackStartError') {
          throw new Error("Your camera or microphone is already in use by another application.");
        } else {
          throw new Error(`Media error: ${mediaError.message || mediaError.name}`);
        }
      }
      
    } catch (error) {
      console.error("Error starting broadcast:", error);
      // Display user-friendly error message
      alert(error.message || "Failed to start broadcast. Please check your camera and microphone permissions.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const joinBroadcast = (roomId: string) => {
    setJoinedRoom(roomId);
    setIsBroadcasting(false);
    
    // Reset video element to prepare for remote stream
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const leaveBroadcast = () => {
    // Stop the media stream if broadcasting
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setJoinedRoom(null);
    setIsBroadcasting(false);
    
    // Clear the video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="flex gap-4">
      <div className="w-1/3">
        {!joinedRoom ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Start a New Broadcast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name (optional)..."
                  className="bg-gray-800 text-white border-gray-700"
                />
                <Button 
                  onClick={startBroadcast}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Start Broadcasting
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">
                {isBroadcasting ? "Broadcasting" : "Viewing"}: {joinedRoom}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={leaveBroadcast}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Leave Broadcast
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-900 border-gray-800 mt-4">
          <CardHeader>
            <CardTitle className="text-white">Active Broadcasts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRooms ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : rooms.length > 0 ? (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <Button
                      key={room.id}
                      onClick={() => joinBroadcast(room.id)}
                      className="w-full justify-between bg-gray-800 hover:bg-gray-700"
                      disabled={joinedRoom === room.id}
                    >
                      <span>{room.name}</span>
                      <span className="flex items-center text-xs text-gray-400">
                        <Users className="h-3 w-3 mr-1" />
                        {room.participants}
                      </span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-gray-400 text-center py-4">No active broadcasts</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="w-2/3">
        <Card className="bg-gray-900 border-gray-800 h-full">
          <CardHeader>
            <CardTitle className="text-white">
              {joinedRoom ? (
                isBroadcasting ? "Your Broadcast" : `Viewing: ${joinedRoom}`
              ) : (
                "Video Stream"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {joinedRoom ? (
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  playsInline
                  muted={isBroadcasting} // Mute own video to prevent feedback
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">
                  Start a broadcast or join an existing one
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
