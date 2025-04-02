// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Loader2 } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { UserInputObject } from "./types";
// import VideoAnalysis from "./userInput Functions/VideoAnalysis";
// import AudioAnalysis from "./userInput Functions/AudioAnalysis";
// import ImageAnalysis from "./userInput Functions/ImageAnalysis";
// import TextAnalysis from "./userInput Functions/TextAnalysis";
// import NewsUrlAnalysis from "./userInput Functions/NewsUrlAnalysis";

// export default function UserInput() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [inputType, setInputType] = useState("text");
//   const [inputValue, setInputValue] = useState("");
//   const [showSources, setShowSources] = useState(false);
//   const api_url = import.meta.env.VITE_API_URL;
//   const [result, setResult] = useState<UserInputObject | null>(null);

//   useEffect(() => {
//     // console.log("Result updated:", result);
//   }, [result]);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setIsLoading(true);

//     const endpoint = inputType === "url" ? "get-fc-url" : "get-fc-text";

//     try {
//       const response = await fetch(`${api_url}/${endpoint}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           [inputType]: inputValue,
//         }),
//       });

//       const data = await response.json();

//       const res = data.content;


//       setResult((prevResult) => {
//         if (prevResult) {
//           // console.log("Result before update: " + prevResult);
//         }
//         // console.log("Result after update: " + res);
//         return res;
//       });

//       // console.log("Result: " + result);
//     } catch (error) {
//       // Handle error
//       console.error("Error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   // console.log("Result outside: " + result);
//   if (!result && isLoading) {
//     return <div>LOADING RIGHT NOW</div>;
//   }

//   return (
//     <div className="container mx-auto p-8 bg-black text-white min-h-screen">
//       <h1 className="text-3xl font-bold mb-8">Content Verification</h1>

//       <Tabs defaultValue="text" className="w-full">
//         <TabsList className="grid w-full grid-cols-5 gap-4 mb-4 bg-gray-900 p-4 rounded-lg h-auto">
//           <TabsTrigger
//             value="text"
//             onClick={() => {
//               setInputType("text");
//               setInputValue("");
//             }}
//             className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
//           >
//             Text Input
//           </TabsTrigger>
//           <TabsTrigger
//             value="url"
//             onClick={() => {
//               setInputType("url");
//               setInputValue("");
//             }}
//             className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
//           >
//             News URL
//           </TabsTrigger>
//           <TabsTrigger
//             value="video"
//             onClick={() => {
//               setInputType("video");
//               setInputValue("");
//             }}
//             className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
//           >
//             Video Analysis
//           </TabsTrigger>
//           <TabsTrigger
//             value="image"
//             onClick={() => {
//               setInputType("image");
//               setInputValue("");
//             }}
//             className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
//           >
//             Image Analysis
//           </TabsTrigger>
//           <TabsTrigger
//             value="audio"
//             onClick={() => {
//               setInputType("audio");
//               setInputValue("");
//             }}
//             className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
//           >
//             Audio Analysis
//           </TabsTrigger>
//         </TabsList>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* <TabsContent value="text">
//             <Textarea
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               placeholder="Enter the news or text to verify..."
//               className="bg-gray-900 border-gray-800 text-white min-h-[200px] resize-none"
//             />
//           </TabsContent> */}
//           <TabsContent value="text">
//             <div className="w-full">
//               <TextAnalysis />
//             </div>
//           </TabsContent>


//           {/* <TabsContent value="url">
//             <Input
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               placeholder="Enter news article URL..."
//               type="url"
//               className="bg-gray-900 border-gray-800 text-white"
//             />
//           </TabsContent> */}

//           <TabsContent value="url">
//             <div className="w-full">
//               <NewsUrlAnalysis />
//             </div>
//           </TabsContent>


//           <TabsContent value="video">
//             <div className="w-full">
//               <VideoAnalysis />
//             </div>
//           </TabsContent>

//           <TabsContent value="image">
//             <div className="w-full">
//               <ImageAnalysis />
//             </div>
//           </TabsContent>

//           <TabsContent value="audio">
//             <div className="w-full">
//               <AudioAnalysis />
//             </div>
//           </TabsContent>
//           <div className="flex justify-center">
//             <Button
//               type="submit"
//               className="w-64 bg-blue-600 hover:bg-blue-700 mx-auto"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               ) : null}
//               Verify Content
//             </Button>
//           </div>
//         </form>
//       </Tabs>

//       {(isLoading || result) && (
//         <CardContent className="pt-6">
//           {isLoading ? (
//             <div className="flex items-center justify-center space-x-2">
//               <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//               <span className="text-gray-400">Analyzing content...</span>
//             </div>
//           ) : (
//             <Dialog>
//               <DialogTrigger asChild>
//                 <Card className="w-full cursor-pointer hover:bg-gray-800 transition-colors bg-gray-900 border-gray-800">
//                   <CardHeader>
//                     <CardTitle className="text-sm text-white">
//                       Analysis Results
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-2">
//                       <p
//                         className={`text-sm font-semibold mb-2 ${result &&
//                           (result.fact_check_result.detailed_analysis.overall_analysis
//                             .truth_score >= 0.75
//                             ? "text-emerald-400"
//                             : result?.fact_check_result.detailed_analysis.overall_analysis
//                               .truth_score < 0.75
//                               ? "text-amber-400"
//                               : "text-rose-400")
//                           }`}
//                       >
//                         Truth Score:{" "}
//                         {
//                           result?.fact_check_result.detailed_analysis.overall_analysis
//                             .truth_score
//                         }
//                       </p>
//                       <p className="text-sm text-gray-200">
//                         Reliability:{" "}
//                         {
//                           result?.fact_check_result.detailed_analysis.overall_analysis
//                             .reliability_assessment
//                         }
//                       </p>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </DialogTrigger>

//               <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
//                 <DialogHeader>
//                   <DialogTitle className="text-xl font-bold text-blue-400 border-b border-gray-700 pb-2">
//                     Detailed Analysis Results
//                   </DialogTitle>
//                 </DialogHeader>

//                 <div className="space-y-6 mt-4">
//                   {/* Overall Analysis Section */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-emerald-400 mb-3">
//                       Overall Analysis
//                     </h3>
//                     <div className="space-y-4 bg-gray-800 p-4 rounded-md">
//                       <p className="text-sm font-semibold">
//                         Truth Score:{" "}
//                         {
//                           result?.fact_check_result.detailed_analysis.overall_analysis
//                             .truth_score
//                         }
//                       </p>
//                       <p className="text-sm">
//                         Reliability:{" "}
//                         {
//                           result?.fact_check_result.detailed_analysis.overall_analysis
//                             .reliability_assessment
//                         }
//                       </p>

//                       <div>
//                         <p className="text-sm font-medium mb-2">
//                           Key Findings:
//                         </p>
//                         <ul className="list-disc pl-4 text-sm text-gray-300">
//                           {result?.fact_check_result.detailed_analysis.overall_analysis.key_findings.map(
//                             (finding, index) => (
//                               <li key={index}>{finding}</li>
//                             )
//                           )}
//                         </ul>
//                       </div>

//                       {/* <div>
//                           <p className="text-sm font-medium mb-2">
//                             Patterns Identified:
//                           </p>
//                           <ul className="list-disc pl-4 text-sm text-gray-300">
//                             {result?.fact_check_result.detailed_analysis.overall_analysis.patterns_identified.map(
//                               (pattern, index) => (
//                                 <li key={index}>{pattern}</li>
//                               )
//                             )}
//                           </ul>
//                         </div> */}
//                     </div>
//                   </div>
//                   <div className="mt-6">
//                     <button
//                       className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
//                       onClick={() => setShowSources(!showSources)}
//                     >
//                       {showSources ? 'Hide Sources' : 'Show Sources'}
//                     </button>

//                     {showSources && (
//                       <div className="mt-4 bg-gray-800 p-4 rounded-md">
//                         <h4 className="text-emerald-400 font-medium mb-2">Sources</h4>
//                         <ul className="list-disc pl-4 text-gray-300">
//                           {result?.sources?.map((url, index) => (
//                             <li key={index} className="mb-2">
//                               <a
//                                 href={url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-blue-400 hover:underline"
//                               >
//                                 {url}
//                               </a>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}
//                   </div>


//                   {/* Claim Analysis Section */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-emerald-400 mb-3">
//                       Claim Analysis
//                     </h3>
//                     <div className="space-y-4">
//                       {result?.fact_check_result.detailed_analysis.claim_analysis.map(
//                         (claim, index) => (
//                           <div
//                             key={index}
//                             className="bg-gray-800 p-4 rounded-md"
//                           >
//                             <p className="font-medium mb-2">{claim.claim}</p>
//                             <p
//                               className={`text-sm ${claim.verification_status === "Verified"
//                                 ? "text-emerald-400"
//                                 : claim.verification_status ===
//                                   "Partially Verified"
//                                   ? "text-amber-400"
//                                   : "text-rose-400"
//                                 }`}
//                             >
//                               Status: {claim.verification_status} (Confidence:{" "}
//                               {claim.confidence_level})
//                             </p>

//                             { /*<div className="mt-4">
//                                 <p className="text-sm font-medium mb-2">
//                                   Evidence Quality:
//                                 </p>
//                                 <p className="text-sm">
//                                   Strength: {claim.evidence_quality.strength}
//                                 </p>
//                                 <ul className="list-disc pl-4 text-sm text-gray-300 mt-2">
//                                   {claim.evidence_quality.gaps.map((gap, i) => (
//                                     <li key={i}>{gap}</li>
//                                   ))}
//                                 </ul>
//                               </div>*/ }
//                           </div>
//                         )
//                       )}
//                     </div>
//                   </div>

//                   {/* Explanation Section */}
//                   {/* <div>
//                       <h3 className="text-lg font-semibold text-emerald-400 mb-3">
//                         Explanation
//                       </h3>
//                       <div className="bg-gray-800 p-4 rounded-md">
//                         <p className="text-sm mb-4">
//                           {result?.explanation.explanation_summary}
//                         </p>

//                         <div className="space-y-4">
//                           {result?.explanation.claim_explanations.map(
//                             (exp, index) => (
//                               <div
//                                 key={index}
//                                 className="border-t border-gray-700 pt-4"
//                               >
//                                 <p className="font-medium mb-2">{exp.claim}</p>
//                                 <p className="text-sm text-gray-300">
//                                   {exp.reasoning}
//                                 </p>
//                                 <ul className="list-disc pl-4 text-sm text-gray-300 mt-2">
//                                   {exp.key_factors.map((factor, i) => (
//                                     <li key={i}>{factor}</li>
//                                   ))}
//                                 </ul>
//                               </div>
//                             )
//                           )}
//                         </div>
//                       </div>
//                     </div> */}
//                 </div>
//               </DialogContent>
//             </Dialog>
//           )}
//         </CardContent>
//       )}
//     </div>
//   );
// }

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoAnalysis from "./userInput Functions/VideoAnalysis";
import AudioAnalysis from "./userInput Functions/AudioAnalysis";
import ImageAnalysis from "./userInput Functions/ImageAnalysis";
import TextAnalysis from "./userInput Functions/TextAnalysis";
import NewsUrlAnalysis from "./userInput Functions/NewsUrlAnalysis";

export default function UserInput() {
  return (
    <div className="container mx-auto p-8 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Content Verification</h1>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-4 mb-4 bg-gray-900 p-4 rounded-lg h-auto">
          <TabsTrigger
            value="text"
            className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
          >
            Text Input
          </TabsTrigger>
          <TabsTrigger
            value="url"
            className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
          >
            News URL
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
          >
            Video Analysis
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
          >
            Image Analysis
          </TabsTrigger>
          <TabsTrigger
            value="audio"
            className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
          >
            Audio Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <div className="w-full">
            <TextAnalysis />
          </div>
        </TabsContent>

        <TabsContent value="url">
          <div className="w-full">
            <NewsUrlAnalysis />
          </div>
        </TabsContent>

        <TabsContent value="video">
          <div className="w-full">
            <VideoAnalysis />
          </div>
        </TabsContent>

        <TabsContent value="image">
          <div className="w-full">
            <ImageAnalysis />
          </div>
        </TabsContent>

        <TabsContent value="audio">
          <div className="w-full">
            <AudioAnalysis />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
