import React, { useEffect, useRef, useState } from "react";

const App: React.FC = () => {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [role, setRole] = useState<"broadcaster" | "viewer">("viewer"); // Add role state
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket>();
  const peerConnectionRef = useRef<RTCPeerConnection>();

  useEffect(() => {
    const api_url = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const ws_url = api_url.replace(/^http/, "ws");
    if (isJoined) {
      const ws = new WebSocket(`${ws_url}/video/ws/${room}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        ws.send(JSON.stringify({ event: "room:join", data: { username } }));
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);

        switch (message.event) {
          case "room:users":
            console.log("Existing users in the room:", message.data.users);
            break;
          case "user:joined":
            console.log("User joined:", message.data);
            break;
          case "webrtc:offer":
            await handleOffer(message.data, message.from);
            break;
          case "webrtc:answer":
            await handleAnswer(message.data);
            break;
          case "webrtc:ice-candidate":
            handleIceCandidate(message.data);
            break;
          case "broadcast:started":
            console.log("Broadcast started by:", message.data.broadcaster);
            break;
          case "message:broadcast":
            console.log("Broadcast message:", message.data.message);
            break;
          case "user:left":
            console.log("User left:", message.data.id);
            break;
          default:
            break;
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
      };

      return () => {
        ws.close();
      };
    }
  }, [isJoined, room, username]);

  const joinRoom = async () => {
    setIsJoined(true);

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current?.send(
          JSON.stringify({
            event: "webrtc:ice-candidate",
            data: event.candidate,
          })
        );
      }
    };

    peerConnection.ontrack = (event) => {
      if (localVideoRef.current && role === "viewer") {
        localVideoRef.current.srcObject = event.streams[0]; // Use single video box for remote stream
      }
    };

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnectionRef.current = peerConnection;

    wsRef.current?.send(
      JSON.stringify({
        event: "room:join",
        data: { username, role }, // Send role to server
      })
    );
  };

  const handleOffer = async (
    offer: RTCSessionDescriptionInit,
    from: number
  ) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      wsRef.current?.send(
        JSON.stringify({ event: "webrtc:answer", data: answer, target: from })
      );
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  };

  const handleIceCandidate = (candidate: RTCIceCandidateInit) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">WebRTC Video Call</h1>
      <div className="space-y-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "broadcaster" | "viewer")}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="broadcaster">Broadcaster</option>
          <option value="viewer">Viewer</option>
        </select>
        <button
          onClick={joinRoom}
          className="w-full p-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Join Room
        </button>
      </div>
      <div className="mt-6 aspect-video bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted={role === "broadcaster"} // Mute if broadcaster
          className="w-full h-full object-cover"
        ></video>
      </div>
    </div>
  );
};

export default App;
