import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AudioDeepfakeDetection() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<{prediction: string, confidence: number} | null>(null);
    const [loading, setLoading] = useState(false);
    const api_url = import.meta.env.VITE_API_URL;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('audio_file', file);

        try {
            const response = await fetch(`${api_url}/detect-audio`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.status === 'success') {
                setResult(data.content);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 bg-black text-white flex items-center justify-center">
            <Card className="w-full max-w-2xl bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-center text-white">
                            Audio Deepfake Detection
                        </h2>
                        
                        <div className="flex flex-col items-center space-y-4">
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-300
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-gray-800 file:text-white
                                    hover:file:bg-gray-700
                                    cursor-pointer"
                            />
                            
                            <Button 
                                onClick={handleSubmit}
                                disabled={!file || loading}
                                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? 'Analyzing...' : 'Analyze Audio'}
                            </Button>
                        </div>

                        {result && (
                            <div className="mt-6 p-4 rounded-lg bg-gray-800">
                                <h3 className="text-lg font-semibold mb-2 text-white">
                                    Results:
                                </h3>
                                <p className="text-white">
                                    Prediction: <span className={`font-bold ${result.prediction === 'real' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {result.prediction.toUpperCase()}
                                    </span>
                                </p>
                                <p className="text-white">
                                    Confidence: {(result.confidence * 100).toFixed(2)}%
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

