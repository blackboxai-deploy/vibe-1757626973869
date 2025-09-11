import { VideoGallery } from "@/components/VideoGallery";

export default function HistoryPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Video History
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Browse and manage all your AI-generated videos. Search, filter, and download your creations.
            </p>
          </div>
          
          <VideoGallery 
            showSearch={true}
            maxItems={50}
            title="All Generated Videos"
          />
        </div>
      </div>
    </div>
  );
}