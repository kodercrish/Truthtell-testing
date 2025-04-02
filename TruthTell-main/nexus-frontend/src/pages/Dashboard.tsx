import RealtimeNews from "@/components/RealtimeNews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserInput from "@/components/UserInput";
// import DeepfakeDetection from "./deepfake";
import Navbar from "@/components/navbar";
import Broadcasts from "@/components/Broadcasts";
import DeepfakeDetection from "@/components/DeepfakeDetection";

export default function Dashboard() {
  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-black text-white pt-12">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-white">
          Nexus of Truth Dashboard
        </h1>
        <Tabs defaultValue="realtime-news" className="w-full">
          <TabsList className="grid w-full grid-cols-5 gap-4 mb-8 rounded-lg h-auto bg-slate-800">
            <TabsTrigger
              value="realtime-news"
              className="p-3 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
            >
              Realtime News Checking
            </TabsTrigger>
            <TabsTrigger
              value="broadcasts"
              className="p-3 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
            >
              Broadcasts 
            </TabsTrigger>
            <TabsTrigger
              value="user-based"
              className="p-3 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
            >
              User Reports
            </TabsTrigger>
            <TabsTrigger
              value="nlp-model"
              className="p-3 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
            >
              NLP Model and Knowledge Graph
            </TabsTrigger>
            <TabsTrigger
              value="deepfake-detection"
              className="p-3 bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-blue-600"
            >
              Deepfake Detection
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="realtime-news">
              <RealtimeNews />
            </TabsContent>
            <TabsContent value="broadcasts">
              <Broadcasts />
            </TabsContent>
            <TabsContent value="deepfake-detection">
              <DeepfakeDetection />
            </TabsContent>
            <TabsContent value="user-based">
              <div className="text-gray-400">
                <UserInput />
              </div>
            </TabsContent>
            <TabsContent value="nlp-model">
              <div className="w-full h-[800px]">
                <iframe
                  src="https://heheboi0769-nexus-nlp-model.hf.space/"
                  className="w-full h-full"
                  frameBorder="0"
                  title="TruthTell NLP Model"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
    </>
  );
}
