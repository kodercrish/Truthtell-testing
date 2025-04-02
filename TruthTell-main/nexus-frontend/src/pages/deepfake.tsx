import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DetectionResult {
  CNN_Prediction: string;
  Metadata_Analysis: string;
  Artifact_Analyis: string;
  Noise_Pattern_Analysis: string;
  Symmetry_Analysis: {
    Vertical_Symmetry: number;
    Horizontal_Symmetry: number;
  };
  Final_Prediction: string;
  Confidence_Score: number;
}


export default function DeepfakeDetection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video">("image");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024;
    const validTypes = fileType === "image"
      ? ["image/jpeg", "image/png"]
      : ["video/mp4"];

    if (!validTypes.includes(file.type)) {
      setError(`Please upload a valid ${fileType} file`);
      return;
    }
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const endpoint = fileType === "video"
        ? "http://localhost:8000/analyze-video"
        : "http://localhost:8000/analyze-deepfake";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await response.json();
      setResult(data.results);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Deepfake Detection</h1>
      {/* <Card className="bg-slate-950 border-slate-800"> */}
      {/* <CardContent className="space-y-6"> */}
      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-4 mb-8 bg-gray-900 p-4 rounded-lg h-auto">
          <TabsTrigger
            value="image"
            onClick={() => {
              setFileType("image");
              setSelectedFile(null);
              setResult(null); // Clear previous results
            }}
            className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
          >
            Image Upload
          </TabsTrigger>

          <TabsTrigger
            value="video"
            onClick={() => {
              setFileType("video");
              setSelectedFile(null);
              setResult(null); // Clear previous results
            }}
            className="p-2 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
          >
            Video Upload
          </TabsTrigger>

        </TabsList>

        <TabsContent value="image" className="flex flex-col items-center">
          <Input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileSelect}
            className="bg-slate-900 border-slate-800 text-slate-50 w-64"
          />
          {selectedFile && selectedFile.type.startsWith('image') && (
            <div className="mt-4">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="mx-auto max-h-[300px] rounded-lg object-contain border border-slate-800"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="video" className="flex flex-col items-center">
          <Input
            type="file"
            accept="video/mp4"
            onChange={handleFileSelect}
            className="bg-slate-900 border-slate-800 text-slate-50 w-64"
          />
          {selectedFile && selectedFile.type.startsWith('video') && (
            <p className="text-sm text-slate-400 mt-4">
              Selected Video: {selectedFile.name}
            </p>
          )}
        </TabsContent>

        <div className="flex justify-center">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-32 mt-4 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </div>

      </Tabs>

      {loading && <Progress value={30} className="w-64 bg-slate-800 mt-4 mx-auto" />}

      {error && (
        <Alert variant="destructive" className="bg-red-900 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-4 max-w-2xl mx-auto mt-4">
          <Alert
            variant={result.Final_Prediction === "Fake" ? "destructive" : "default"}
            className={
              result.Final_Prediction === "Fake"
                ? "bg-red-900 border-red-800"
                : "bg-green-900 border-green-800"
            }
          >
            <AlertTitle className="text-slate-50">
              {result.Final_Prediction === "Fake"
                ? "Potential deepfake detected"
                : "No deepfake detected"}
            </AlertTitle>
          </Alert>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h3 className="font-semibold text-slate-50">Detection Results</h3>
            <p className="text-slate-200">Classification: {result.Final_Prediction}</p>
          </div>

          {fileType === "image" && (
            <>
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <h3 className="font-semibold text-slate-50">CNN Analysis</h3>
                <p className="text-slate-200">Result: {result.CNN_Prediction}</p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <h3 className="font-semibold text-slate-50">Metadata Analysis</h3>
                <p className="text-slate-200">Findings: {result.Metadata_Analysis}</p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <h3 className="font-semibold text-slate-50">Noise Pattern Analysis</h3>
                <p className="text-slate-200">Results: {result.Noise_Pattern_Analysis}</p>
              </div>
            </>
          )}
        </div>
      )}
      {/* </CardContent> */}
      {/* </Card> */}
    </div>
  );
}