import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';

type Analysis = {
    fact_check_result: {
        detailed_analysis: {
            overall_analysis: {
                truth_score: number;
                reliability_assessment: string;
                key_findings: string[];
            };
            claim_analysis: Array<{
                claim: string;
                verification_status: string;
                confidence_level: string;
            }>;
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
              }[];
        };
    };
    sources: string[];
}

export default function NewsUrlAnalysis() {
    const [url, setUrl] = useState('');
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSources, setShowSources] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    //   const analyzeUrl = async () => {
    //     if (!url.trim()) return;

    //     setLoading(true);

    //     try {
    //       const response = await fetch(`${import.meta.env.VITE_API_URL}/get-fc-url`, {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //           url: url
    //         }),
    //       });
    //       const data = await response.json();
    //       setAnalysis(data.content);
    //     } catch (error) {
    //       console.error('Error analyzing URL:', error);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    // const analyzeUrl = async () => {
    //     if (!url.trim()) return;

    //     setLoading(true);

    //     try {
    //       const response = await fetch(`${import.meta.env.VITE_API_URL}/get-fc-url`, {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //           url: url
    //         }),
    //       });
    //       const data = await response.json();
    //       console.log('Response data:', data); // Add this line
    //       setAnalysis(data.content);
    //     } catch (error) {
    //       console.error('Error analyzing URL:', error);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    const analyzeUrl = async () => {
        if (!url.trim()) return;

        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/get-fc-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url
                }),
            });
            const data = await response.json();

            if (data.content === null) {
                setErrorMessage(data.status);
            } else {
                setAnalysis(data.content);
            }
        } catch (error) {
            setErrorMessage('An error occurred while analyzing the URL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4">
                <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter news article URL..."
                    type="url"
                    className="bg-gray-900 border-gray-800 text-white"
                />
                <div className="flex justify-center">
                    <Button
                        onClick={analyzeUrl}
                        disabled={!url.trim() || loading}
                        type="submit"
                        className="w-64 bg-blue-600 hover:bg-blue-700 mx-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : 'Analyze URL'}
                    </Button>
                </div>
                {errorMessage && (
                    <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                        <p className="text-red-400">{errorMessage}</p>
                    </div>
                )}
            </div>

            {analysis && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <Card className="w-full cursor-pointer hover:bg-gray-800 transition-colors bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-white">
                                Analysis Results
                                (click for detailed analysis)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className={`text-sm font-semibold ${analysis.fact_check_result.detailed_analysis.overall_analysis.truth_score >= 0.75
                                        ? "text-emerald-400"
                                        : analysis.fact_check_result.detailed_analysis.overall_analysis.truth_score < 0.75
                                            ? "text-amber-400"
                                            : "text-rose-400"
                                    }`}>
                                    Truth Score: {analysis.fact_check_result.detailed_analysis.overall_analysis.truth_score}
                                </p>
                                <p className="text-sm text-gray-200">
                                    Reliability: {analysis.fact_check_result.detailed_analysis.overall_analysis.reliability_assessment}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
                                View Analysis
                            </button>
                        </DialogTrigger>

                        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-blue-400 border-b border-gray-700 pb-2">
                                    Detailed Analysis Results
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-emerald-400 mb-3">Overall Analysis</h3>
                                    <div className="space-y-4 bg-gray-800 p-4 rounded-md">
                                        <p className="text-sm font-semibold">
                                            Truth Score: {analysis.fact_check_result.detailed_analysis.overall_analysis.truth_score}
                                        </p>
                                        <p className="text-sm">
                                            Reliability: {analysis.fact_check_result.detailed_analysis.overall_analysis.reliability_assessment}
                                        </p>
                                        <div>
                                            <p className="text-sm font-medium mb-2">Key Findings:</p>
                                            <ul className="list-disc pl-4 text-sm text-gray-300">
                                                {analysis.fact_check_result.detailed_analysis.overall_analysis.key_findings.map(
                                                    (finding, index) => (
                                                        <li key={index}>{finding}</li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* <div className="mt-6">
                                    <button
                                        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                                        onClick={() => setShowSources(!showSources)}
                                    >
                                        {showSources ? 'Hide Sources' : 'Show Sources'}
                                    </button>

                                    {showSources && (
                                        <div className="mt-4 bg-gray-800 p-4 rounded-md">
                                            <h4 className="text-emerald-400 font-medium mb-2">Sources</h4>
                                            <ul className="list-disc pl-4 text-gray-300">
                                                {analysis.sources?.map((url, index) => (
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
                                    )}
                                </div> */}
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
                                            {analysis.fact_check_result.detailed_analysis.source_analysis && analysis.fact_check_result.detailed_analysis.source_analysis.map((source, index) => (
                                                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                                                <td className="px-4 py-2">
                                                    <a 
                                                    href={analysis.sources[index] || "#"}
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
                                            {analysis.sources?.map((url, index) => (
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

                                <div>
                                    <h3 className="text-lg font-semibold text-emerald-400 mb-3">Claim Analysis</h3>
                                    <div className="space-y-4">
                                        {analysis.fact_check_result.detailed_analysis.claim_analysis.map(
                                            (claim, index) => (
                                                <div key={index} className="bg-gray-800 p-4 rounded-md">
                                                    <p className="font-medium mb-2">{claim.claim}</p>
                                                    <p className={`text-sm ${claim.verification_status === "Verified"
                                                            ? "text-emerald-400"
                                                            : claim.verification_status === "Partially Verified"
                                                                ? "text-amber-400"
                                                                : "text-rose-400"
                                                        }`}>
                                                        Status: {claim.verification_status} (Confidence: {claim.confidence_level})
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
}
