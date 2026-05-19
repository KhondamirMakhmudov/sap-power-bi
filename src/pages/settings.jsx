'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Input } from '@/components/ui';
import { Save, Moon, Sun, Eye, EyeOff, Bell, Lock } from 'lucide-react';

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dataExport, setDataExport] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and dashboard settings</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" placeholder="John Doe" />
            <Input label="Email" placeholder="john@example.com" />
            <Input label="Company" placeholder="Your Company" />
            <Input label="Role" placeholder="Analytics Manager" />
          </div>
          <Button variant="primary" className="mt-6">
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
        </Card>

        {/* Display Settings */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Display Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-600" />}
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-600">Enable dark theme for better visibility at night</p>
                </div>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-14 h-8 rounded-full transition-colors ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Compact View</p>
                  <p className="text-sm text-gray-600">Display more information per screen</p>
                </div>
              </div>
              <button className="w-14 h-8 rounded-full bg-gray-300">
                <div className="w-6 h-6 rounded-full bg-white translate-x-1" />
              </button>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Get alerts about important metrics</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-14 h-8 rounded-full transition-colors ${
                  notifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Email Alerts</p>
                  <p className="text-sm text-gray-600">Receive daily and weekly email reports</p>
                </div>
              </div>
              <button
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-14 h-8 rounded-full transition-colors ${
                  emailAlerts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  emailAlerts ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Data & Privacy</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Data Export</p>
                  <p className="text-sm text-gray-600">Allow exporting your analytics data</p>
                </div>
              </div>
              <button
                onClick={() => setDataExport(!dataExport)}
                className={`w-14 h-8 rounded-full transition-colors ${
                  dataExport ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  dataExport ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="font-semibold text-red-900 mb-2">Danger Zone</p>
              <p className="text-sm text-red-800 mb-4">Permanently delete your account and all associated data</p>
              <Button variant="danger" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </Card>

        {/* API Keys */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">API Keys</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-between">
              <code className="text-sm font-mono text-gray-900">sk_live_••••••••••••••••</code>
              <Button variant="outline" size="sm">
                Copy
              </Button>
            </div>
            <Button variant="secondary" size="md">
              Generate New Key
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
