/**
 * VelocityDemo Component - Showcase of VELOCITY theme components
 * Features: Interactive demo of glassmorphism, neon effects, animations
 */

import React, { useState } from 'react';
import { 
  GlassCard, 
  VelocityButton, 
  VelocityInput, 
  VelocitySpinner,
  PageTransition 
} from '@/components/ui';
import { motion } from 'framer-motion';

export const VelocityDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [spinnerType, setSpinnerType] = useState<'circular' | 'dots' | 'pulse' | 'wave' | 'orbit' | 'matrix'>('orbit');

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <PageTransition type="matrix" className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            VELOCITY THEME
          </h1>
          <p className="text-white/70 text-lg">
            Premium high-tech UI components with glassmorphism and neon effects
          </p>
        </motion.div>

        {/* Glass Cards Section */}
        <motion.section 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Glass Morphism Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard variant="subtle" elevation={2}>
              <h3 className="text-lg font-medium text-white mb-2">Subtle Glass</h3>
              <p className="text-white/70">
                Minimal transparency with light backdrop blur for subtle depth.
              </p>
            </GlassCard>

            <GlassCard variant="glow" elevation={4}>
              <h3 className="text-lg font-medium text-white mb-2">Glow Effect</h3>
              <p className="text-white/70">
                Enhanced with blue glow effects for premium feel.
              </p>
            </GlassCard>

            <GlassCard variant="holographic" elevation={6}>
              <h3 className="text-lg font-medium text-white mb-2">Holographic</h3>
              <p className="text-white/70">
                Multi-color gradient with holographic shimmer effects.
              </p>
            </GlassCard>
          </div>
        </motion.section>

        {/* Buttons Section */}
        <motion.section 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Premium Buttons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <VelocityButton variant="glass-primary">
              Glass Primary
            </VelocityButton>

            <VelocityButton variant="neon">
              Neon Glow
            </VelocityButton>

            <VelocityButton variant="gradient">
              Gradient
            </VelocityButton>

            <VelocityButton variant="holographic">
              Holographic
            </VelocityButton>

            <VelocityButton variant="neon-purple">
              Purple Neon
            </VelocityButton>

            <VelocityButton variant="shimmer">
              Shimmer Effect
            </VelocityButton>

            <VelocityButton variant="pulse">
              Pulse Animation
            </VelocityButton>

            <VelocityButton 
              variant="glass-success"
              loading={loading}
              onClick={handleLoadingDemo}
            >
              {loading ? 'Loading...' : 'Load Demo'}
            </VelocityButton>
          </div>
        </motion.section>

        {/* Forms Section */}
        <motion.section 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Floating Label Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard variant="medium" padding="lg">
              <div className="space-y-4">
                <VelocityInput
                  label="Glass Input"
                  variant="glass"
                  placeholder="Enter your text"
                  value={inputValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                />

                <VelocityInput
                  label="Neon Input"
                  variant="neon"
                  placeholder="Neon glow effect"
                />

                <VelocityInput
                  label="Error State"
                  variant="glass"
                  error="This field has an error"
                  placeholder="Error demo"
                />

                <VelocityInput
                  label="Success State"
                  variant="glass"
                  success="Input validated successfully"
                  placeholder="Success demo"
                />
              </div>
            </GlassCard>

            <GlassCard variant="neon" padding="lg">
              <div className="space-y-4">
                <VelocityInput
                  label="Holographic Input"
                  variant="holographic"
                  placeholder="Holographic effect"
                />

                <VelocityInput
                  label="Purple Neon"
                  variant="neon-purple"
                  placeholder="Purple neon glow"
                />

                <div className="flex gap-3">
                  <VelocityButton variant="neon" size="sm">
                    Submit
                  </VelocityButton>
                  <VelocityButton variant="glass" size="sm">
                    Cancel
                  </VelocityButton>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.section>

        {/* Spinners Section */}
        <motion.section 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Loading Animations</h2>
          <GlassCard variant="glow" padding="lg">
            <div className="space-y-6">
              <div className="flex gap-4 flex-wrap justify-center">
                {(['circular', 'dots', 'pulse', 'wave', 'orbit', 'matrix'] as const).map((type) => (
                  <VelocityButton
                    key={type}
                    variant={spinnerType === type ? 'neon' : 'glass'}
                    size="sm"
                    onClick={() => setSpinnerType(type)}
                  >
                    {type}
                  </VelocityButton>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
                <div className="text-center space-y-2">
                  <VelocitySpinner type={spinnerType} variant="neon" size="lg" />
                  <p className="text-white/70 text-sm">Neon</p>
                </div>

                <div className="text-center space-y-2">
                  <VelocitySpinner type={spinnerType} variant="neon-purple" size="lg" />
                  <p className="text-white/70 text-sm">Purple</p>
                </div>

                <div className="text-center space-y-2">
                  <VelocitySpinner type={spinnerType} variant="neon-pink" size="lg" />
                  <p className="text-white/70 text-sm">Pink</p>
                </div>

                <div className="text-center space-y-2">
                  <VelocitySpinner type={spinnerType} variant="holographic" size="lg" />
                  <p className="text-white/70 text-sm">Holographic</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <GlassCard variant="subtle" className="inline-block">
            <p className="text-white/50 text-sm">
              VELOCITY Theme - Premium UI Components for FibreFlow
            </p>
          </GlassCard>
        </motion.footer>
      </div>
    </PageTransition>
  );
};