import { VideoGeneration, VideoHistory, AppSettings } from '@/types/video';

const STORAGE_KEYS = {
  VIDEO_HISTORY: 'video-generation-history',
  APP_SETTINGS: 'app-settings'
} as const;

export class StorageService {
  static getVideoHistory(): VideoHistory {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VIDEO_HISTORY);
      if (!stored) {
        return {
          generations: [],
          totalCount: 0,
          lastUpdated: new Date().toISOString()
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading video history:', error);
      return {
        generations: [],
        totalCount: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  static saveVideoHistory(history: VideoHistory): void {
    try {
      history.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.VIDEO_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving video history:', error);
    }
  }

  static addVideoGeneration(video: VideoGeneration): void {
    const history = this.getVideoHistory();
    history.generations.unshift(video); // Add to beginning
    history.totalCount = history.generations.length;
    
    // Limit history size (keep last 100 generations)
    const maxItems = this.getAppSettings().maxHistoryItems;
    if (history.generations.length > maxItems) {
      history.generations = history.generations.slice(0, maxItems);
      history.totalCount = maxItems;
    }
    
    this.saveVideoHistory(history);
  }

  static updateVideoGeneration(id: string, updates: Partial<VideoGeneration>): void {
    const history = this.getVideoHistory();
    const index = history.generations.findIndex(v => v.id === id);
    
    if (index !== -1) {
      history.generations[index] = { ...history.generations[index], ...updates };
      this.saveVideoHistory(history);
    }
  }

  static deleteVideoGeneration(id: string): void {
    const history = this.getVideoHistory();
    history.generations = history.generations.filter(v => v.id !== id);
    history.totalCount = history.generations.length;
    this.saveVideoHistory(history);
  }

  static searchVideoHistory(query: string): VideoGeneration[] {
    const history = this.getVideoHistory();
    const lowercaseQuery = query.toLowerCase();
    
    return history.generations.filter(video => 
      video.prompt.toLowerCase().includes(lowercaseQuery) ||
      video.id.toLowerCase().includes(lowercaseQuery)
    );
  }

  static getAppSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (!stored) {
        return this.getDefaultSettings();
      }
      const settings = JSON.parse(stored);
      return { ...this.getDefaultSettings(), ...settings };
    } catch (error) {
      console.error('Error loading app settings:', error);
      return this.getDefaultSettings();
    }
  }

  static saveAppSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  }

  private static getDefaultSettings(): AppSettings {
    return {
      systemPrompt: 'Generate a high-quality, cinematic video based on the following description. Focus on smooth motion, good lighting, and engaging visuals.',
      defaultDuration: 5,
      defaultAspectRatio: '16:9',
      defaultQuality: 'high',
      autoDownload: false,
      maxHistoryItems: 100
    };
  }

  static exportHistory(): string {
    const history = this.getVideoHistory();
    return JSON.stringify(history, null, 2);
  }

  static importHistory(data: string): boolean {
    try {
      const history: VideoHistory = JSON.parse(data);
      
      // Validate the data structure
      if (!history.generations || !Array.isArray(history.generations)) {
        throw new Error('Invalid history format');
      }
      
      this.saveVideoHistory(history);
      return true;
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }

  static clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.VIDEO_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.APP_SETTINGS);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}