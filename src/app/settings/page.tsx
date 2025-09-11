import { SettingsPanel } from "@/components/SettingsPanel";

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Customize your AI video generation experience. Configure defaults, manage data, and personalize your workflow.
            </p>
          </div>
          
          <SettingsPanel />
        </div>
      </div>
    </div>
  );
}