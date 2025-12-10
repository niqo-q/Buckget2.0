import { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Moon, Globe, Shield, Percent, ChevronRight, Check, ArrowLeft } from 'lucide-react';

interface SettingsPageProps {
  onBack?: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'en',
    tier: 'steady',
    savePercentage: 10,
  });

  const tiers = [
    { id: 'power', name: 'Power Save', percentage: 20, description: 'Limit spending, maximize savings' },
    { id: 'steady', name: 'Steady Flow', percentage: 10, description: 'Balanced approach' },
    { id: 'freedom', name: 'Total Freedom', percentage: 5, description: 'Light savings, full flexibility' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ms', name: 'Bahasa Malaysia' },
    { code: 'zh', name: '中文' },
  ];

  return (
    <div className="min-h-screen p-6 text-white">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        )}
        <h1
          className="text-4xl mb-2"
          style={{ fontFamily: '"Momo Trust Display", sans-serif', fontWeight: 800 }}
        >
          Settings
        </h1>
        <p className="text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>
          Customize your BuckGet experience
        </p>
      </motion.div>

      {/* Savings Tier Selection */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-sm text-white/70 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Savings Tier
        </h2>
        <div className="space-y-3">
          {tiers.map((tier, index) => (
            <motion.button
              key={tier.id}
              onClick={() => setSettings({ ...settings, tier: tier.id, savePercentage: tier.percentage })}
              className={`w-full p-4 rounded-2xl text-left transition-all ${
                settings.tier === tier.id
                  ? 'bg-[#FEFF09] text-[#0F172A]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {tier.name}
                  </p>
                  <p className={`text-sm ${settings.tier === tier.id ? 'text-[#0F172A]/60' : 'text-white/60'}`}>
                    {tier.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      settings.tier === tier.id ? 'bg-[#0F172A]/10' : 'bg-white/10'
                    }`}
                    style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}
                  >
                    {tier.percentage}%
                  </span>
                  {settings.tier === tier.id && (
                    <div className="w-6 h-6 bg-[#0F172A] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#FEFF09]" />
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-sm text-white/70 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Preferences
        </h2>
        <div className="bg-white rounded-3xl overflow-hidden">
          {/* Notifications */}
          <div className="flex items-center justify-between p-4 border-b border-[#0F172A]/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#2820FF]/10 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#2820FF]" />
              </div>
              <div>
                <p className="text-[#0F172A]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  Notifications
                </p>
                <p className="text-sm text-[#0F172A]/60">
                  Receive alerts and reminders
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
              className={`w-14 h-8 rounded-full transition-colors ${
                settings.notifications ? 'bg-[#10B981]' : 'bg-[#0F172A]/20'
              }`}
            >
              <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: settings.notifications ? 26 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 border-b border-[#0F172A]/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#0F172A]/10 rounded-full flex items-center justify-center">
                <Moon className="w-5 h-5 text-[#0F172A]" />
              </div>
              <div>
                <p className="text-[#0F172A]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  Dark Mode
                </p>
                <p className="text-sm text-[#0F172A]/60">
                  Use dark theme
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              className={`w-14 h-8 rounded-full transition-colors ${
                settings.darkMode ? 'bg-[#2820FF]' : 'bg-[#0F172A]/20'
              }`}
            >
              <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: settings.darkMode ? 26 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F97316]/10 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#F97316]" />
              </div>
              <div>
                <p className="text-[#0F172A]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  Language
                </p>
                <p className="text-sm text-[#0F172A]/60">
                  {languages.find(l => l.code === settings.language)?.name}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#0F172A]/50" />
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        className="mb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-sm text-white/70 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Security
        </h2>
        <div className="bg-white rounded-3xl overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#0F172A]/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#FF44EC]/10 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#FF44EC]" />
              </div>
              <div className="text-left">
                <p className="text-[#0F172A]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  Security Settings
                </p>
                <p className="text-sm text-[#0F172A]/60">
                  Password, 2FA, biometrics
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#0F172A]/50" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

