// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Loader2 } from "lucide-react";
// import PusherClient from "pusher-js";

// const pusherClient = new PusherClient(
//   import.meta.env.VITE_PUSHER_KEY!,
//   {
//     cluster: "ap2",
//   }
// );

// interface BroadcastObject {
//   id: string;
//   title: string;
//   text: string;
//   user_name: string;
//   factcheck: {
//     detailed_analysis: {
//       overall_analysis: {
//         truth_score: number,
//         reliability_assessment: string,
//         key_findings: string[]
//       },
//       claim_analysis: {
//         claim: string,
//         verification_status: string,
//         confidence_level: number,
//         misinformation_impact: {
//           severity: number,
//           affected_domains: string[],
//           potential_consequences: string[],
//           spread_risk: number
//         }
//       }[],
//       original_text: string,
//       timestamp: string
//     }
//   };
// }

// export default function Broadcasts() {
//   const [title, setTitle] = useState("");
//   const [text, setText] = useState("");
//   const [name, setName] = useState("");
//   const [broadcasts, setBroadcasts] = useState<BroadcastObject[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [broadcastLoading, setBroadcastLoading] = useState(true);
//   const [selectedClaims, setSelectedClaims] = useState<any>(null);
//   const [showClaimsDialog, setShowClaimsDialog] = useState(false);
//   const api_url = import.meta.env.VITE_API_URL;

//   useEffect(() => {
//     const fetchBroadcasts = async () => {
//       try {
//         const response = await fetch(`${api_url}/user-broadcasts`);
//         const data = await response.json();
//         console.log("Received broadcasts:", data);
//         setBroadcasts(data.content);
//         setBroadcastLoading(false);
//       } catch (error) {
//         console.error('Error fetching broadcasts:', error);
//       }
//     };

//     fetchBroadcasts();

//     pusherClient.subscribe("user-channel");
//     pusherClient.bind("new-broadcast", (data: BroadcastObject) => {
//       setBroadcasts(prev => [data, ...prev]);
//     });

//     return () => {
//       pusherClient.unsubscribe("user-channel");
//     };
//   }, []);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setIsLoading(true);

//     try {
//       await fetch(`${api_url}/user-broadcast`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ title, text, name }),
//       });

//       setTitle("");
//       setText("");
//       setName("");
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex gap-4 p-8 bg-black min-h-screen">
//       <div className="w-1/3">
//         <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg">
//           <h2 className="text-2xl font-bold text-white">Create Broadcast</h2>
//           <Input
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Author name..."
//             className="bg-gray-800 text-white border-gray-700"
//           />
//           <Input
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="News title..."
//             className="bg-gray-800 text-white border-gray-700"
//           />
//           <Textarea
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             placeholder="News content..."
//             className="bg-gray-800 text-white border-gray-700 min-h-[200px]"
//           />
//           <Button
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700"
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : "Broadcast"}
//           </Button>
//         </form>
//       </div>

//       <div className="w-2/3">
//         <ScrollArea className="h-[calc(100vh-4rem)] rounded-lg border border-gray-800">
//           <div className="p-4 space-y-4">
//             {!broadcastLoading && broadcasts.length > 0 && broadcasts.map((broadcast) => (
//               <Dialog key={broadcast.id}>
//                 <DialogTrigger asChild>
//                   <Card className="cursor-pointer hover:bg-gray-800 transition-colors bg-gray-900 border-gray-800">
//                     <CardHeader>
//                       <CardTitle className="text-white">
//                         <div className="text-sm text-blue-400">{broadcast.user_name}</div>
//                         <div className="text-lg mt-1">{broadcast.title}</div>
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <p className="text-gray-300 line-clamp-2">{broadcast.text}</p>
//                     </CardContent>
//                   </Card>
//                 </DialogTrigger>

//                 <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
//                   <DialogHeader>
//                     <DialogTitle className="text-xl font-bold text-blue-400">
//                       {broadcast.title}
//                     </DialogTitle>
//                     <div className="text-sm text-blue-400 mt-2">By {broadcast.user_name}</div>
//                   </DialogHeader>
                  
//                   <div className="mt-4 space-y-6">
//                     <div className="text-gray-200">{broadcast.text}</div>
                    
//                     <Button
//                         onClick={() => {
//                             setSelectedClaims(broadcast);
//                             setShowClaimsDialog(true);
//                         }}
//                         className="bg-blue-600 hover:bg-blue-700"
//                     >
//                         View Fact Check Results
//                     </Button>

//                   </div>
//                 </DialogContent>
//               </Dialog>
//             ))}
//           </div>
//           <ScrollBar />
//         </ScrollArea>

//         <Dialog open={showClaimsDialog} onOpenChange={setShowClaimsDialog}>
//           <DialogContent className="bg-gray-900 border-gray-800 text-white">
//             <DialogHeader>
//               <DialogTitle className="text-lg font-bold text-blue-400">
//                 Fact Check Analysis
//               </DialogTitle>
//             </DialogHeader>
//             {selectedClaims && (
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                     <p
//                     className={`text-sm font-semibold mb-2 ${
//                         selectedClaims.factcheck.detailed_analysis.overall_analysis.truth_score >= 0.75
//                         ? "text-emerald-400"
//                         : selectedClaims.factcheck.detailed_analysis.overall_analysis.truth_score < 0.75
//                         ? "text-amber-400"
//                         : "text-rose-400"
//                     }`}
//                     >
//                     Truth Score: {selectedClaims.factcheck.detailed_analysis.overall_analysis.truth_score}
//                     </p>
//                     <p className="text-sm text-gray-200">
//                     Reliability: {selectedClaims.factcheck.detailed_analysis.overall_analysis.reliability_assessment}
//                     </p>
//                     <div className="mt-2">
//                     <p className="text-sm font-medium text-gray-200">Key Findings:</p>
//                     <ul className="list-disc pl-4 text-xs text-gray-400">
//                         {selectedClaims.factcheck.detailed_analysis.overall_analysis.key_findings.map((finding: string, index: number) => (
//                         <li key={index}>{finding}</li>
//                         ))}
//                     </ul>
//                     </div>
//                 </div>
                
//                 <div className="mt-6">
//                     <h4 className="text-emerald-400 font-medium mb-2">Claim Analysis</h4>
//                     <ul className="space-y-4">
//                     {selectedClaims.factcheck.detailed_analysis.claim_analysis.map((claim: any, index: number) => (
//                         <li key={index} className="bg-gray-800 p-4 rounded-md">
//                         <p className="font-medium text-white">{claim.claim}</p>
//                         <p className={`text-sm mt-1 ${
//                             claim.verification_status === "Verified" 
//                             ? "text-emerald-400" 
//                             : claim.verification_status === "Partially Verified" 
//                             ? "text-amber-400" 
//                             : "text-rose-400"
//                         }`}>
//                             {claim.verification_status} - Confidence: {claim.confidence_level}
//                         </p>
                        
//                         <div className="mt-4">
//                             <h4 className="text-emerald-400 font-medium mb-2">Misinformation Impact</h4>
//                             <p className="text-gray-200">Severity: {claim.misinformation_impact.severity}</p>
//                             <p className="text-gray-200">Spread Risk: {claim.misinformation_impact.spread_risk}</p>
//                             <div className="mt-2">
//                             <p className="text-gray-400">Potential Consequences:</p>
//                             <ul className="list-disc pl-4 text-gray-300">
//                                 {claim.misinformation_impact.potential_consequences.map((consequence: string, i: number) => (
//                                 <li key={i}>{consequence}</li>
//                                 ))}
//                             </ul>
//                             </div>
//                         </div>
//                         </li>
//                     ))}
//                     </ul>
//                 </div>
//             </div>
            
//             )}
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextBroadcast from "./broadcast/textBroadcast";
import VideoBroadcast from "./broadcast/videoBroadcast";

export default function Broadcasts() {
  const [activeTab, setActiveTab] = useState("text");

  return (
    <div className="p-8 bg-black min-h-screen">
      <Tabs defaultValue="text" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="text">Text Broadcast</TabsTrigger>
          <TabsTrigger value="video">Video Broadcast</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text">
          <TextBroadcast />
        </TabsContent>
        
        <TabsContent value="video">
          <VideoBroadcast />
        </TabsContent>
      </Tabs>
    </div>
  );
}
