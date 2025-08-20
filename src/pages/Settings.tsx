import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { VFLogoUpload } from '@/components/settings/VFLogoUpload';
import { Palette, Moon, Sun } from 'lucide-react';

export function Settings() {
  const { themeConfig, setTheme, availableThemes } = useTheme();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        {/* Theme Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Theme Selection
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableThemes.map((theme) => (
              <button
                key={theme}
                onClick={() => setTheme(theme)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  themeConfig.name === theme
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  {theme === 'light' && <Sun className="w-6 h-6" />}
                  {theme === 'dark' && <Moon className="w-6 h-6" />}
                  {theme === 'vf' && (
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 via-pink-500 to-pink-600" />
                  )}
                  {theme === 'fibreflow' && (
                    <div className="w-6 h-6 rounded bg-blue-600" />
                  )}
                </div>
                <div className="text-sm font-medium capitalize">{theme}</div>
              </button>
            ))}
          </div>
          
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Current Theme: <strong className="capitalize">{themeConfig.name}</strong>
          </p>
        </div>

        {/* Logo Upload - Available for all themes */}
        <VFLogoUpload />
        
        {/* Additional Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" className="rounded mr-3" defaultChecked />
              <span>Enable animations</span>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" className="rounded mr-3" defaultChecked />
              <span>Show tooltips</span>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" className="rounded mr-3" />
              <span>Compact mode</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}