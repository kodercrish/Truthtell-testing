import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

//Interface for news object
interface NewsObject {
    id: string;
    article: string;
    full_text: { 
        status: string,
        summary: string,
        title: string,
        text?: string,
        url: string
    };
    fact_check: {
      detailed_analysis: {
        overall_analysis: {
          truth_score: number,
          reliability_assessment: string,
          key_findings: string[]
        },
        claim_analysis: {
          claim: string,
          verification_status: string,
          confidence_level: number,
          misinformation_impact: {
            severity: number,
            affected_domains: string[],
            potential_consequences: string[],
            spread_risk: number
          }
        }[],
        source_analysis: {
          source: string,
          credibility_score: number,
          fact_checking_history: number,
          transparency_score: number,
          expertise_level: number,
          additional_metrics: {
            citation_score: number,
            peer_recognition: number,
          }
        }[]
      },
    };
    sources: string[];
}

import PusherClient from "pusher-js";

// Allows you to use Pusher inside Next.js "use client" components.
export const pusherClient = new PusherClient(
  import.meta.env.VITE_PUSHER_KEY!,
  {
    cluster: "ap2",
  }
);


const RealtimeNews = () => {
  //NewsObject state
  const [news, setNews] = useState<NewsObject[]>([]);
  // const [selectedClaims] = useState<any>(null);
  // const [showClaimsDialog, setShowClaimsDialog] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);
  const [showSources, setShowSources] = useState(false);
  const [expandedClaims, setExpandedClaims] = useState<{[key: number]: boolean}>({});
  const api_url = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    const fetchInitialNews = async () => {
      try {
        const response = await fetch(`${api_url}/all-news`);
        const data = await response.json();
        setNews([...data.content]);
        // console.log("Initial news fetched:", data);
        // setIsLoading(false);
      } catch (error) {
        console.error('Error fetching initial news:', error);
      }
    };


    fetchInitialNews();
  }, []);

  // useEffect(() => {
  //   pusherClient.subscribe("news-channel");
  //   pusherClient.bind("fact-check", (data: any) => {
  //     // console.log("Received news update:", data);
  //     setNews((prevNews) => { 
  //       const newsUpdated = [...prevNews, data];
  //       return newsUpdated;
  //     });
  //     setIsLoading(false);
  //     // console.log("Received news update:", news);
  //   });
    

  //   return () => {
  //     pusherClient.unsubscribe("news-channel");
  //   };
  // }, [])

  useEffect(() => {
    pusherClient.subscribe("news-channel");
    pusherClient.bind("fact-check", (data: any) => {
      setNews((prevNews) => { 
        const newsUpdated = [data, ...prevNews];
        return newsUpdated;
      });
      // setIsLoading(false);
    });
  
    return () => {
      pusherClient.unsubscribe("news-channel");
    };
  }, [])


  
  // return (
  //   <div className="space-y-4 mt-10 bg-black text-white">
  //     <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
  //       <div className="flex items-center space-x-1">
  //         {[...Array(5)].map((_, i) => (
  //           <div
  //             key={i}
  //             className="w-2 h-8 bg-blue-400 rounded-full animate-wave"
  //             style={{
  //               animation: `wave 1s ease-in-out infinite`,
  //               animationDelay: `${i * 0.1}s`
  //             }}
  //           />
  //         ))}
  //       </div>
  //       <span className="text-blue-400 font-medium">Fetching Latest News...</span>
  //     </div>
      
  
  //     {!isLoading && (
  //       <>
  //         <ScrollArea className="w-full whitespace-nowrap rounded-md border border-gray-800">
  //           <div className="flex w-max space-x-4 p-4">
  //             {news.map((newsItems) => (
  //               <Dialog key={newsItems.id}>
  //                 <DialogTrigger asChild>
  //                   <Card
  //                     className="w-[300px] shrink-0 bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
  //                   >
  //                     <CardHeader className="h-auto">
  //                       <CardTitle className="text-sm text-white break-words whitespace-normal">
  //                         <span className="hover:text-blue-400">
  //                           {newsItems.full_text.title}
  //                         </span>
  //                       </CardTitle>
  //                     </CardHeader>
  //                     <CardContent>
  //                       <a 
  //                         href={newsItems.full_text.url} 
  //                         target="_blank" 
  //                         rel="noopener noreferrer"
  //                         className="text-blue-400 hover:underline"
  //                       >
  //                         Original Article
  //                       </a>
  //                     </CardContent>
  //                   </Card>
  //                 </DialogTrigger>
  //                 <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
  //                   <DialogHeader>
  //                     <DialogTitle className="text-xl font-bold text-blue-400 border-b border-gray-700 pb-2">
  //                       {newsItems.full_text.title}
  //                     </DialogTitle>
  //                     <h3 className="text-lg font-semibold text-emerald-400 mb-3">Source</h3>
  //                     <a 
  //                       href={newsItems.full_text.url} 
  //                       target="_blank" 
  //                       rel="noopener noreferrer"
  //                       className="text-blue-400 hover:underline"
  //                     >
  //                       Original Article
  //                     </a>
  //                     <div className="mt-4 space-y-6">
  //                       <div className="text-sm text-gray-200">
  //                         <h3 className="text-lg font-semibold text-emerald-400 mb-3">Summary</h3>
  //                         <p>{newsItems.full_text.summary}</p>
  //                       </div>
  //                     </div>
  //                     {newsItems.full_text.text && (<div className="text-sm text-gray-200">
  //                       <div className="text-sm text-gray-200">
  //                         <h3 className="text-lg font-semibold text-emerald-400 mb-3">Full Article</h3>
  //                         <p className="whitespace-pre-wrap">{newsItems.full_text.text}</p>
  //                       </div>
  //                     </div>)}
  //                   </DialogHeader>
  //                 </DialogContent>
  //               </Dialog>
  //             ))}
  //           </div>
  //           <ScrollBar orientation="horizontal" className="bg-gray-800" />
  //         </ScrollArea>
  
  //         <ScrollArea className="w-full whitespace-nowrap rounded-md border border-gray-800">
  //           <div className="flex w-max space-x-4 p-4">
  //             {news.map((newsItems) => (
  //               <Dialog key={newsItems.id}>
  //                 <DialogTrigger asChild>
  //                   <Card className="w-[300px] shrink-0 cursor-pointer hover:bg-gray-800 transition-colors bg-gray-900 border-gray-800">
  //                     <CardHeader>
  //                       <CardTitle className="text-sm line-clamp-2 text-white">
  //                         {newsItems.full_text.title}
  //                       </CardTitle>
  //                     </CardHeader>
  //                     <CardContent>
  //                       <div className="space-y-2 max-h-[200px] overflow-y-auto">
  //                         <p
  //                           className={`text-sm font-semibold mb-2 ${
  //                             newsItems.fact_check.detailed_analysis.overall_analysis.truth_score >= 0.75
  //                               ? "text-emerald-400"
  //                               : newsItems.fact_check.detailed_analysis.overall_analysis.truth_score < 0.75
  //                               ? "text-amber-400"
  //                               : "text-rose-400"
  //                           }`}
  //                         >
  //                           Truth Score: {newsItems.fact_check.detailed_analysis.overall_analysis.truth_score}
  //                         </p>
  //                         <p className="text-sm text-gray-200 line-clamp-1">
  //                           Reliability: {newsItems.fact_check.detailed_analysis.overall_analysis.reliability_assessment}
  //                         </p>
  //                         <div className="mt-2">
  //                           <p className="text-sm font-medium text-gray-200">Key Findings:</p>
  //                           <ul className="list-disc pl-4 text-xs text-gray-400">
  //                             {newsItems.fact_check.detailed_analysis.overall_analysis.key_findings.slice(0, 2).map((finding, index) => (
  //                               <li key={index} className="line-clamp-1">{finding}</li>
  //                             ))}
  //                           </ul>
  //                         </div>
  //                         {/* <div className="mt-2">
  //                           <p className="text-sm font-medium text-gray-200">Patterns:</p>
  //                           <ul className="list-disc pl-4 text-xs text-gray-400">
  //                             {newsItems.fact_check.detailed_analysis.overall_analysis.patterns_identified.slice(0, 2).map((pattern, index) => (
  //                               <li key={index} className="line-clamp-1">{pattern}</li>
  //                             ))}
  //                           </ul>
  //                         </div> */}
  //                       </div>
  //                     </CardContent>
  //                   </Card>
  //                 </DialogTrigger>
  //                 <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
  //                   <DialogHeader>
  //                     <DialogTitle className="text-xl font-bold text-blue-400 border-b border-gray-700 pb-2">
  //                       {newsItems.full_text.title}
  //                     </DialogTitle>
  //                   </DialogHeader>
  //                   <div className="mt-4">
  //                     <div className="space-y-2">
  //                       <p
  //                         className={`text-sm font-semibold mb-2 ${
  //                           newsItems.fact_check.detailed_analysis.overall_analysis.truth_score >= 0.75
  //                             ? "text-emerald-400"
  //                             : newsItems.fact_check.detailed_analysis.overall_analysis.truth_score < 0.75
  //                             ? "text-amber-400"
  //                             : "text-rose-400"
  //                         }`}
  //                       >
  //                         Truth Score: {newsItems.fact_check.detailed_analysis.overall_analysis.truth_score}
  //                       </p>
  //                       <p className="text-sm text-gray-200">
  //                         Reliability: {newsItems.fact_check.detailed_analysis.overall_analysis.reliability_assessment}
  //                       </p>
  //                       <div className="mt-2">
  //                         <p className="text-sm font-medium text-gray-200">Key Findings:</p>
  //                         <ul className="list-disc pl-4 text-xs text-gray-400">
  //                           {newsItems.fact_check.detailed_analysis.overall_analysis.key_findings.map((finding, index) => (
  //                             <li key={index}>{finding}</li>
  //                           ))}
  //                         </ul>
  //                       </div>
  //                       {/* <div className="mt-2">
  //                         <p className="text-sm font-medium text-gray-200">Patterns Identified:</p>
  //                         <ul className="list-disc pl-4 text-xs text-gray-400">
  //                           {newsItems.fact_check.detailed_analysis.overall_analysis.patterns_identified.map((pattern, index) => (
  //                             <li key={index}>{pattern}</li>
  //                           ))}
  //                         </ul>
  //                       </div> */}
  //                     </div>

  //                     <div className="mt-6">
  //                       <button 
  //                         className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
  //                         onClick={() => setShowSources(!showSources)}
  //                       >
  //                         {showSources ? 'Hide Sources' : 'Show Sources'}
  //                       </button>
                        
  //                       {showSources && (
  //                         <div className="mt-4 bg-gray-800 p-4 rounded-md">
  //                           <h4 className="text-emerald-400 font-medium mb-2">Sources</h4>
  //                           <ul className="list-disc pl-4 text-gray-300">
  //                             {newsItems.sources?.map((url, index) => (
  //                               <li key={index} className="mb-2">
  //                                 <a 
  //                                   href={url}
  //                                   target="_blank"
  //                                   rel="noopener noreferrer" 
  //                                   className="text-blue-400 hover:underline"
  //                                 >
  //                                   {url}
  //                                 </a>
  //                               </li>
  //                             ))}
  //                           </ul>
  //                         </div>
  //                       )}
  //                     </div>


  //                     <div className="mt-6">
  //                       <button 
  //                         className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
  //                         onClick={() => {
  //                           setSelectedClaims(newsItems.fact_check.detailed_analysis.claim_analysis);
  //                           setShowClaimsDialog(true);
  //                         }}
  //                       >
  //                         View Detailed Claim Analysis
  //                       </button>
  //                     </div>

  //                   </div>
  //                 </DialogContent>
  //               </Dialog>
  //             ))}
  //           </div>
  //           <ScrollBar orientation="horizontal" className="bg-gray-800" />
  //         </ScrollArea>
  
  return (
    <div className="space-y-4 mt-10 bg-black text-white min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-8 bg-blue-400 rounded-full animate-wave"
                style={{
                  animation: `wave 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
          <span className="text-blue-400 font-medium">Fetching Latest News...</span>
        </div>
      
        <div className="container mx-auto px-4 space-y-4">
          {news.map((newsItem) => (
            <Card 
              key={newsItem.id} 
              className="p-6 bg-gray-900 border-gray-800"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  {newsItem.full_text.title}
                </h3>
                
                <p className="text-gray-300 text-sm">
                  {newsItem.full_text.summary}
                </p>

                <div className="flex space-x-4">
                  <a 
                    href={newsItem.full_text.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Open Article
                  </a>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
                        View Analysis
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-blue-400 border-b border-gray-700 pb-2">
                          {newsItem.full_text.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Overall Analysis */}
                        <div className="space-y-6">
                          <h3 className="text-lg font-bold text-emerald-400 border-b border-gray-700 pb-2">
                            Overall Analysis
                          </h3>
                          
                          <div>
                            <p className={`text-lg font-semibold ${
                              newsItem.fact_check.detailed_analysis.overall_analysis.truth_score >= 0.75
                                ? "text-emerald-400"
                                : newsItem.fact_check.detailed_analysis.overall_analysis.truth_score < 0.75
                                ? "text-amber-400"
                                : "text-rose-400"
                            }`}>
                              Truth Score: {newsItem.fact_check.detailed_analysis.overall_analysis.truth_score}
                            </p>
                            <p className="text-gray-200 mt-2">
                              Reliability: {newsItem.fact_check.detailed_analysis.overall_analysis.reliability_assessment}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-emerald-400 font-medium mb-2">Key Findings:</h4>
                            <ul className="list-disc pl-4 text-gray-300">
                              {newsItem.fact_check.detailed_analysis.overall_analysis.key_findings.map((finding, index) => (
                                <li key={index}>{finding}</li>
                              ))}
                            </ul>
                          </div>

                          {/* put claim analysis part here */}
                            <div className="space-y-6">
                                                            
                              <div>
                                {/* Collapsible Claims Section */}
                                <div className="space-y-4">
                                  {newsItem.fact_check.detailed_analysis.claim_analysis.map((claim, index) => (
                                    <div key={index} className="border border-gray-700 rounded-md overflow-hidden">
                                      <button 
                                        className="w-full px-4 py-3 bg-gray-800 text-left hover:bg-gray-700 transition-colors flex justify-between items-center"
                                        onClick={() => {
                                          // Toggle this specific claim's expanded state
                                          const newExpandedClaims = {...expandedClaims};
                                          newExpandedClaims[index] = !newExpandedClaims[index];
                                          setExpandedClaims(newExpandedClaims);
                                        }}
                                      >
                                        <div>
                                          <h3 className="font-medium text-white">Claim Analysis</h3>
                                          <p className={`text-sm mt-1 ${
                                            claim.verification_status === "Verified" 
                                              ? "text-emerald-400" 
                                              : claim.verification_status === "Partially Verified" 
                                              ? "text-amber-400" 
                                              : "text-rose-400"
                                          }`}>
                                            {claim.verification_status} - Confidence: {claim.confidence_level}
                                          </p>
                                        </div>
                                        <span>{expandedClaims[index] ? '▲' : '▼'}</span>
                                      </button>
                                      
                                      {expandedClaims[index] && (
                                        <div className="p-4 bg-gray-900">
                                            <div className="bg-gray-900 space-y-4">
                                              <p className="font-medium text-white">{claim.claim}</p>
                                            </div>
                                            
                                            <div className="bg-gray-900 space-y-4">
                                              <br />
                                            </div>
                                          <div className="space-y-4">
                                            <div>
                                              <h4 className="text-emerald-400 font-medium mb-2">Misinformation Impact</h4>
                                              <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                  <p className="text-gray-400 text-sm">Severity:</p>
                                                  <p className="text-gray-200">{claim.misinformation_impact.severity}</p>
                                                </div>
                                                <div>
                                                  <p className="text-gray-400 text-sm">Spread Risk:</p>
                                                  <p className="text-gray-200">{claim.misinformation_impact.spread_risk}</p>
                                                </div>
                                              </div>
                                              
                                              <div className="mt-2">
                                                <p className="text-gray-400 text-sm">Affected Domains:</p>
                                                <ul className="list-disc pl-4 text-gray-300">
                                                  {claim.misinformation_impact.affected_domains.map((domain, i) => (
                                                    <li key={i}>{domain}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                              
                                              <div className="mt-2">
                                                <p className="text-gray-400 text-sm">Potential Consequences:</p>
                                                <ul className="list-disc pl-4 text-gray-300">
                                                  {claim.misinformation_impact.potential_consequences.map((consequence, i) => (
                                                    <li key={i}>{consequence}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                          </div>
                          
                        </div>

                        {/* Right Column - Source Analysis */}
                          <div>
                            <button 
                              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex justify-between items-center"
                              onClick={() => setShowSources(!showSources)}
                            >
                              <span>{showSources ? 'Hide Sources' : 'Show Sources'}</span>
                              <span>{showSources ? '▲' : '▼'}</span>
                            </button>
                            
                            {showSources && (
                              <div className="bg-gray-800 p-4 rounded-md mt-2">
                                <h4 className="text-emerald-400 font-medium mb-2">Sources Analysis</h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm text-left text-gray-300">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                      <tr>
                                        <th className="px-4 py-2">Source</th>
                                        <th className="px-4 py-2">Credibility</th>
                                        <th className="px-4 py-2">Fact Checking</th>
                                        <th className="px-4 py-2">Transparency</th>
                                        <th className="px-4 py-2">Expertise</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {newsItem.fact_check.detailed_analysis.source_analysis && newsItem.fact_check.detailed_analysis.source_analysis.map((source, index) => (
                                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                                          <td className="px-4 py-2">
                                            <a 
                                              href={newsItem.sources[index] || "#"}
                                              target="_blank"
                                              rel="noopener noreferrer" 
                                              className="text-blue-400 hover:underline"
                                            >
                                              {source.source}
                                            </a>
                                          </td>
                                          <td className={`px-4 py-2 ${
                                            source.credibility_score > 0.7 ? "text-emerald-400" : 
                                            source.credibility_score > 0.4 ? "text-amber-400" : "text-rose-400"
                                          }`}>
                                            {source.credibility_score.toFixed(2)}
                                          </td>
                                          <td className="px-4 py-2">{source.fact_checking_history.toFixed(2)}</td>
                                          <td className="px-4 py-2">{source.transparency_score.toFixed(2)}</td>
                                          <td className="px-4 py-2">{source.expertise_level.toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="mt-4">
                                  <h4 className="text-emerald-400 font-medium mb-2">Source URLs</h4>
                                  <ul className="list-disc pl-4 text-gray-300">
                                    {newsItem.sources?.map((url, index) => (
                                      <li key={index} className="mb-2">
                                        <a 
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer" 
                                          className="text-blue-400 hover:underline"
                                        >
                                          {url}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                </div>
              </div>
            </Card>
          ))}
        </div>
    </div>
  );    
};

export default RealtimeNews;