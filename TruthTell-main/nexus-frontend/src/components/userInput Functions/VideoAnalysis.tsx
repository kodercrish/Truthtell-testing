import { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

export default function VideoAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setAnalysis('');
    }
  };

  const formatAnalysisText = (text: string) => {
    let parts = text.split('**');
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <h3 key={index} className="text-lg font-semibold text-emerald-400 my-3">
            {part}
          </h3>
        );
      }
      
      const subParts = part.split('*');
      return subParts.map((subPart, subIndex) => {
        if (subIndex % 2 === 1) {
          return (
            <h4 key={`${index}-${subIndex}`} className="text-md font-medium text-blue-400 my-2">
              {subPart}
            </h4>
          );
        }
        return (
          <p key={`${index}-${subIndex}`} className="text-sm text-gray-200 mb-4">
            {subPart}
          </p>
        );
      });
    });
  };

  const analyzeVideo = async () => {
    if (!file) return;

    setLoading(true);
    setAnalysis('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analyze-video`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing video:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <input
          type="file"
          accept="video/mp4"
          onChange={handleFileUpload}
          className="p-2 border rounded-lg"
        />
        <div className="flex justify-center">
          <Button
            onClick={analyzeVideo}
            disabled={!file || loading}
            type="submit"
            className="w-64 bg-blue-600 hover:bg-blue-700 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : 'Analyze Video'}
          </Button>
        </div>
      </div>

      {analysis && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Analysis Results:</h3>
          <div className="whitespace-pre-wrap">
            {formatAnalysisText(analysis)}
          </div>
        </div>
      )}
    </div>
  );
}
