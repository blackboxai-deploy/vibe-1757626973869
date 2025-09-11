"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AppSettings } from "@/types/video";
import { StorageService } from "@/lib/storage";
import { toast } from "sonner";

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadSettings = () => {
      const currentSettings = StorageService.getAppSettings();
      setSettings(currentSettings);
      setIsLoading(false);
    };

    loadSettings();
  }, []);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    if (!settings) return;
    
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    setHasChanges(true);
  };

  const saveSettings = () => {
    if (!settings) return;
    
    StorageService.saveAppSettings(settings);
    setHasChanges(false);
    toast.success("Settings saved successfully!");
  };

  const resetSettings = () => {
    // Clear stored settings to get defaults
    StorageService.saveAppSettings({} as AppSettings);
    const freshSettings = StorageService.getAppSettings();
    setSettings(freshSettings);
    setHasChanges(true);
    toast.info("Settings reset to defaults");
  };

  const exportData = () => {
    const data = StorageService.exportHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Data exported successfully!");
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (StorageService.importHistory(content)) {
        toast.success("Data imported successfully!");
      } else {
        toast.error("Failed to import data. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      StorageService.clearAllData();
      toast.success("All data cleared");
      // Reload settings
      const freshSettings = StorageService.getAppSettings();
      setSettings(freshSettings);
      setHasChanges(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Prompt Settings */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white">AI System Prompt</CardTitle>
          <p className="text-gray-400 text-sm">
            Customize how the AI interprets your video generation requests. This prompt is prepended to all your requests.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">System Prompt</Label>
            <Textarea
              value={settings.systemPrompt}
              onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
              className="min-h-[120px] bg-black/20 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Enter your custom system prompt..."
            />
            <p className="text-xs text-gray-500">
              The system prompt helps guide the AI's understanding of your video generation style and preferences.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Default Settings */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white">Default Generation Settings</CardTitle>
          <p className="text-gray-400 text-sm">
            Set your preferred default values for new video generations.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-300">Default Aspect Ratio</Label>
              <Select 
                value={settings.defaultAspectRatio} 
                onValueChange={(value: any) => handleSettingChange('defaultAspectRatio', value)}
              >
                <SelectTrigger className="bg-black/20 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                  <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                  <SelectItem value="4:3">Classic (4:3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Default Quality</Label>
              <Select 
                value={settings.defaultQuality} 
                onValueChange={(value: any) => handleSettingChange('defaultQuality', value)}
              >
                <SelectTrigger className="bg-black/20 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="high">High Quality</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Default Duration: {settings.defaultDuration}s</Label>
            <Slider
              value={[settings.defaultDuration]}
              onValueChange={(value) => handleSettingChange('defaultDuration', value[0])}
              max={30}
              min={3}
              step={1}
              className="py-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white">App Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Auto-download completed videos</Label>
              <p className="text-xs text-gray-500">Automatically download videos when generation completes</p>
            </div>
            <Switch
              checked={settings.autoDownload}
              onCheckedChange={(checked) => handleSettingChange('autoDownload', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">History Size Limit: {settings.maxHistoryItems} videos</Label>
            <Slider
              value={[settings.maxHistoryItems]}
              onValueChange={(value) => handleSettingChange('maxHistoryItems', value[0])}
              max={500}
              min={10}
              step={10}
              className="py-2"
            />
            <p className="text-xs text-gray-500">
              Maximum number of videos to keep in history (older videos will be automatically removed)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white">Data Management</CardTitle>
          <p className="text-gray-400 text-sm">
            Import, export, or clear your video generation data.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={exportData}
              variant="outline"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              Export Data
            </Button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                id="import-file"
              />
              <Button
                onClick={() => document.getElementById('import-file')?.click()}
                variant="outline"
                className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                Import Data
              </Button>
            </div>
            
            <Button
              onClick={clearAllData}
              variant="destructive"
              className="bg-red-600/20 border-red-500/20 hover:bg-red-600/30 text-red-400"
            >
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      {hasChanges && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-white font-medium">You have unsaved changes</p>
              <div className="space-x-2">
                <Button
                  onClick={resetSettings}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  Reset
                </Button>
                <Button
                  onClick={saveSettings}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}