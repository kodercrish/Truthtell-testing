// // import * as React from 'react';
// // import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// // function randomID(len) {
// //   let result = '';
// //   if (result) return result;
// //   var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
// //     maxPos = chars.length,
// //     i;
// //   len = len || 5;
// //   for (i = 0; i < len; i++) {
// //     result += chars.charAt(Math.floor(Math.random() * maxPos));
// //   }
// //   return result;
// // }

// // export function getUrlParams(
// //   url = window.location.href
// // ) {
// //   let urlStr = url.split('?')[1];
// //   return new URLSearchParams(urlStr);
// // }

// // export default function App() {
// //   const roomID = getUrlParams().get('roomID') || randomID(5);
// //   let role_str = getUrlParams(window.location.href).get('role') || 'Host';
// //   const role =
// //     role_str === 'Host'
// //       ? ZegoUIKitPrebuilt.Host
// //       : role_str === 'Cohost'
// //       ? ZegoUIKitPrebuilt.Cohost
// //       : ZegoUIKitPrebuilt.Audience;

// //   let sharedLinks = [];
// //   if (role === ZegoUIKitPrebuilt.Host || role === ZegoUIKitPrebuilt.Cohost) {
// //     sharedLinks.push({
// //       name: 'Join as co-host',
// //       url:
// //         window.location.protocol + '//' + 
// //         window.location.host + window.location.pathname +
// //         '?roomID=' +
// //         roomID +
// //         '&role=Cohost',
// //     });
// //   }
// //   sharedLinks.push({
// //     name: 'Join as audience',
// //     url:
// //      window.location.protocol + '//' + 
// //      window.location.host + window.location.pathname +
// //       '?roomID=' +
// //       roomID +
// //       '&role=Audience',
// //   });
// //  // generate Kit Token
// //   const appID = Number(import.meta.env.VITE_APP_ID);
// //   const serverSecret = import.meta.env.VITE_SERVER_SECRET;
// //   const kitToken =  ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID,  randomID(5),  randomID(5));


// //   // start the call
// //   let myMeeting = async (element) => {
// //       // Create instance object from Kit Token.
// //       const zp = ZegoUIKitPrebuilt.create(kitToken);
// //       // start the call
// //       zp.joinRoom({
// //         container: element,
// //         scenario: {
// //           mode: ZegoUIKitPrebuilt.LiveStreaming,
// //           config: {
// //             role,
// //           },
// //         },
// //         sharedLinks,
// //       });
// //   };

// //   return (
// //     <div
// //       className="myCallContainer"
// //       ref={myMeeting}
// //       style={{ width: '100vw', height: '100vh' }}
// //     ></div>
// //   );
// // }

// import * as React from 'react';
// import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// function randomID(len) {
//   let result = '';
//   if (result) return result;
//   var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
//     maxPos = chars.length,
//     i;
//   len = len || 5;
//   for (i = 0; i < len; i++) {
//     result += chars.charAt(Math.floor(Math.random() * maxPos));
//   }
//   return result;
// }

// export function getUrlParams(
//   url = window.location.href
// ) {
//   let urlStr = url.split('?')[1];
//   return new URLSearchParams(urlStr);
// }

// export default function App() {
//   const roomID = getUrlParams().get('roomID') || randomID(5);
//   let role_str = getUrlParams(window.location.href).get('role') || 'Host';
//   const role =
//     role_str === 'Host'
//       ? ZegoUIKitPrebuilt.Host
//       : role_str === 'Cohost'
//       ? ZegoUIKitPrebuilt.Cohost
//       : ZegoUIKitPrebuilt.Audience;

//   let sharedLinks = [];
//   if (role === ZegoUIKitPrebuilt.Host || role === ZegoUIKitPrebuilt.Cohost) {
//     sharedLinks.push({
//       name: 'Join as co-host',
//       url:
//         window.location.protocol + '//' + 
//         window.location.host + window.location.pathname +
//         '?roomID=' +
//         roomID +
//         '&role=Cohost',
//     });
//   }
//   sharedLinks.push({
//     name: 'Join as audience',
//     url:
//      window.location.protocol + '//' + 
//      window.location.host + window.location.pathname +
//       '?roomID=' +
//       roomID +
//       '&role=Audience',
//   });
  
//   // generate Kit Token
//   const appID = Number(import.meta.env.VITE_APP_ID);
//   const serverSecret = import.meta.env.VITE_SERVER_SECRET;
//   const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, randomID(5), randomID(5));

//   // start the call
//   let myMeeting = async (element) => {
//     // Create instance object from Kit Token.
//     const zp = ZegoUIKitPrebuilt.create(kitToken);
//     // start the call
//     zp.joinRoom({
//       container: element,
//       scenario: {
//         mode: ZegoUIKitPrebuilt.LiveStreaming,
//         config: {
//           role,
//         },
//       },
//       sharedLinks,
//       // Configure to open links in new tab instead of showing copy buttons
//       sharedLinksConfig: {
//         openInNewTab: true,
//       },
//     });
//   };

//   return (
//     <div
//       className="myCallContainer"
//       ref={myMeeting}
//       style={{ 
//         width: '100%',  // Changed from 100vw to 100% to prevent horizontal overflow
//         height: '100vh',
//         maxWidth: '100%', // Ensure content doesn't overflow horizontally
//         overflow: 'hidden' // Prevent scrollbars
//       }}
//     ></div>
//   );
// }

import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import axios from 'axios';

function randomID(len) {
  let result = '';
  if (result) return result;
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(
  url = window.location.href
) {
  let urlStr = url.split('?')[1];
  return new URLSearchParams(urlStr);
}

// API endpoint for video analysis
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:8000';

export default function App() {
  const roomID = getUrlParams().get('roomID') || randomID(5);
  let role_str = getUrlParams(window.location.href).get('role') || 'Host';
  const role =
    role_str === 'Host'
      ? ZegoUIKitPrebuilt.Host
      : role_str === 'Cohost'
      ? ZegoUIKitPrebuilt.Cohost
      : ZegoUIKitPrebuilt.Audience;

  // State for recording and processing
  const [isRecording, setIsRecording] = React.useState(false);
  const [videoChunks, setVideoChunks] = React.useState([]);
  const [processingStatus, setProcessingStatus] = React.useState('');
  const [analysisResults, setAnalysisResults] = React.useState([]);
  const [showResults, setShowResults] = React.useState(false);
  const mediaRecorderRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const zegoInstanceRef = React.useRef(null);

  let sharedLinks = [];
  if (role === ZegoUIKitPrebuilt.Host || role === ZegoUIKitPrebuilt.Cohost) {
    sharedLinks.push({
      name: 'Join as co-host',
      url:
        window.location.protocol + '//' + 
        window.location.host + window.location.pathname +
        '?roomID=' +
        roomID +
        '&role=Cohost',
    });
  }
  sharedLinks.push({
    name: 'Join as audience',
    url:
     window.location.protocol + '//' + 
     window.location.host + window.location.pathname +
      '?roomID=' +
      roomID +
      '&role=Audience',
  });
 
  // generate Kit Token
  const appID = Number(import.meta.env.VITE_APP_ID);
  const serverSecret = import.meta.env.VITE_SERVER_SECRET;
  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, randomID(5), randomID(5));

  // Function to start capturing video chunks
  const startCapturing = async () => {
    try {
      setProcessingStatus('Initializing video capture...');
      setAnalysisResults([]);
      
      // Find the video element in the DOM after ZegoCloud has initialized
      setTimeout(() => {
        const videoElement = document.querySelector('.myCallContainer video');
        if (!videoElement) {
          console.error('Video element not found');
          setProcessingStatus('Error: Video element not found');
          return;
        }

        // Get the stream from the video element
        const stream = videoElement.srcObject;
        if (!stream) {
          console.error('No media stream found');
          setProcessingStatus('Error: No media stream found');
          return;
        }
        
        streamRef.current = stream;
        
        // Create a MediaRecorder instance
        const options = { mimeType: 'video/webm;codecs=vp9' };
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        
        // Clear previous chunks
        setVideoChunks([]);
        
        // Set up event handlers for data
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            setVideoChunks(prev => [...prev, event.data]);
            
            // Process each chunk as it becomes available
            processVideoChunk(event.data);
          }
        };
        
        // Start recording with 5-second chunks (adjust as needed)
        mediaRecorder.start(5000);
        setIsRecording(true);
        setProcessingStatus('Capturing video chunks...');
        console.log('Started capturing video chunks');
      }, 3000); // Wait for ZegoCloud to initialize
    } catch (error) {
      console.error('Error starting capture:', error);
      setProcessingStatus(`Error: ${error.message}`);
    }
  };
  
  // Function to stop capturing
  const stopCapturing = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setProcessingStatus('Video capture stopped');
      console.log('Stopped capturing video chunks');
    }
  };
  
  // Function to process a video chunk with Gemini
  const processVideoChunk = async (chunk) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(chunk);
      
      reader.onloadend = async () => {
        const base64data = reader.result;
        const chunkSizeKB = (chunk.size / 1024).toFixed(2);
        
        setProcessingStatus(`Processing video chunk (${chunkSizeKB} KB)...`);
        
        try {
          // Send to backend for Gemini analysis
          const response = await axios.post(`${API_ENDPOINT}/video-chunks/analyze-video-chunk`, {
            videoChunk: base64data,
            roomID: roomID,
            timestamp: new Date().toISOString()
          });
          
          if (response.data.status === 'success') {
            // Add the analysis result to our state
            setAnalysisResults(prev => [
              ...prev, 
              {
                id: response.data.chunk_id,
                timestamp: response.data.timestamp,
                analysis: response.data.analysis,
                createdAt: new Date().toISOString()
              }
            ]);
            
            setProcessingStatus(`Analysis complete for chunk (${chunkSizeKB} KB)`);
          } else {
            console.error('Analysis failed:', response.data.message);
            setProcessingStatus(`Analysis failed: ${response.data.message}`);
          }
        } catch (error) {
          console.error('Error sending video for analysis:', error);
          setProcessingStatus(`Error: ${error.message}`);
        }
      };
    } catch (error) {
      console.error('Error processing video chunk:', error);
      setProcessingStatus(`Error processing: ${error.message}`);
    }
  };
  
  // Function to toggle analysis results panel
  const toggleResults = () => {
    setShowResults(!showResults);
  };

  // start the call
  let myMeeting = async (element) => {
    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zegoInstanceRef.current = zp;
    
    // start the call
    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.LiveStreaming,
        config: {
          role,
        },
      },
      sharedLinks,
      sharedLinksConfig: {
        openInNewTab: true,
      },
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div
        className="myCallContainer"
        ref={myMeeting}
        style={{ 
          width: '100%',
          height: '100vh',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      ></div>
      
      {/* Controls for video capture - only shown to hosts */}
      {(role === ZegoUIKitPrebuilt.Host || role === ZegoUIKitPrebuilt.Cohost) && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '10px',
          borderRadius: '8px',
          color: 'white',
          maxWidth: '300px'
        }}>
          <div style={{ marginBottom: '5px' }}>
            {processingStatus && (
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                Status: {processingStatus}
              </div>
            )}
            
            {!isRecording ? (
              <button
                onClick={startCapturing}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Start Video Analysis
              </button>
            ) : (
              <button
                onClick={stopCapturing}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Stop Analysis
              </button>
            )}
          </div>
          
          {analysisResults.length > 0 && (
            <button
              onClick={toggleResults}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {showResults ? 'Hide Analysis' : `Show Analysis (${analysisResults.length})`}
            </button>
          )}
        </div>
      )}
      
      {/* Analysis Results Panel */}
      {showResults && analysisResults.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '15px',
          borderRadius: '8px',
          color: 'white',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>
            Video Analysis Results
          </h3>
          
          {analysisResults.map((result, index) => (
            <div key={result.id || index} style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
                {new Date(result.createdAt).toLocaleTimeString()}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {result.analysis}
              </div>
            </div>
          ))}
          
          <button
            onClick={toggleResults}
            style={{
              padding: '8px 16px',
              backgroundColor: '#555',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              marginTop: '10px'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
