import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { GridBackground } from '@/components/GridBackground';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  ScanLine, 
  Play, 
  RotateCcw, 
  Camera,
  Maximize2,
  Volume2,
  VolumeX
} from 'lucide-react';

type DemoStep = 'scan' | 'detecting' | 'playing';

export default function Demo() {
  const [step, setStep] = useState<DemoStep>('scan');
  const [isMuted, setIsMuted] = useState(false);

  const startDemo = () => {
    setStep('detecting');
    setTimeout(() => {
      setStep('playing');
    }, 2000);
  };

  const resetDemo = () => {
    setStep('scan');
  };

  return (
    <div className="min-h-screen bg-background">
      <GridBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">Demo AR Experience</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Lihat bagaimana AR System bekerja. Simulasi ini menunjukkan proses 
              scan target image hingga konten AR ditampilkan.
            </p>
          </motion.div>

          {/* Demo Container */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-6 md:p-8"
            >
              {/* Phone Mockup */}
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* Phone Frame */}
                <div className="relative">
                  <div className="w-[280px] md:w-[320px] h-[560px] md:h-[640px] bg-black rounded-[3rem] p-3 shadow-2xl shadow-primary/20 border-4 border-gray-800">
                    {/* Notch */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
                    
                    {/* Screen */}
                    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-[2.5rem] overflow-hidden relative">
                      {/* Camera View Simulation */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
                        {/* Grid overlay */}
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: `
                              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: '30px 30px'
                          }}
                        />

                        <AnimatePresence mode="wait">
                          {step === 'scan' && (
                            <motion.div
                              key="scan"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex flex-col items-center justify-center p-6"
                            >
                              {/* Target Frame */}
                              <div className="relative w-48 h-48 mb-6">
                                <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg" />
                                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-primary" />
                                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-primary" />
                                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-primary" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-primary" />
                                
                                {/* Placeholder target */}
                                <div className="absolute inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center">
                                  <Camera className="w-12 h-12 text-primary/50" />
                                </div>
                              </div>

                              <p className="text-white/70 text-sm text-center mb-2">
                                Arahkan kamera ke target image
                              </p>
                              <p className="text-primary text-xs">
                                Tap untuk mulai demo
                              </p>
                            </motion.div>
                          )}

                          {step === 'detecting' && (
                            <motion.div
                              key="detecting"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex flex-col items-center justify-center p-6"
                            >
                              {/* Scanning Animation */}
                              <div className="relative w-48 h-48 mb-6">
                                {/* Target detected */}
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-lg"
                                />
                                
                                {/* Scanning line */}
                                <motion.div
                                  initial={{ top: 0 }}
                                  animate={{ top: '100%' }}
                                  transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    ease: 'linear'
                                  }}
                                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                                />

                                {/* Corner highlights */}
                                <motion.div
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className="absolute inset-0"
                                >
                                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-primary" />
                                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-primary" />
                                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-primary" />
                                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-primary" />
                                </motion.div>
                              </div>

                              <div className="flex items-center gap-2 text-primary">
                                <ScanLine className="w-5 h-5 animate-pulse" />
                                <span className="text-sm font-medium">Mendeteksi target...</span>
                              </div>
                            </motion.div>
                          )}

                          {step === 'playing' && (
                            <motion.div
                              key="playing"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0"
                            >
                              {/* AR Content Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center p-8">
                                <motion.div
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                  className="relative w-full aspect-video bg-gradient-to-br from-primary/40 via-secondary/40 to-accent/40 rounded-xl overflow-hidden shadow-2xl shadow-primary/30"
                                >
                                  {/* Video placeholder */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div
                                      animate={{ 
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5]
                                      }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                      className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                                    >
                                      <Play className="w-8 h-8 text-white fill-white" />
                                    </motion.div>
                                  </div>

                                  {/* Video progress bar */}
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: '100%' }}
                                      transition={{ duration: 10, ease: 'linear' }}
                                      className="h-full bg-primary"
                                    />
                                  </div>

                                  {/* AR floating elements */}
                                  <motion.div
                                    animate={{ 
                                      y: [-5, 5, -5],
                                      rotate: [-2, 2, -2]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -top-4 -right-4 px-3 py-1.5 bg-primary/90 rounded-full text-xs text-white font-medium shadow-lg"
                                  >
                                    ✨ AR Active
                                  </motion.div>
                                </motion.div>
                              </div>

                              {/* AR UI Overlay */}
                              <div className="absolute bottom-8 left-4 right-4 flex justify-between items-center">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-sm">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                  <span className="text-white text-xs">Tracking: Excellent</span>
                                </div>
                                <button 
                                  onClick={() => setIsMuted(!isMuted)}
                                  className="p-2 bg-black/50 rounded-full backdrop-blur-sm"
                                >
                                  {isMuted ? (
                                    <VolumeX className="w-4 h-4 text-white" />
                                  ) : (
                                    <Volume2 className="w-4 h-4 text-white" />
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Status Bar */}
                      <div className="absolute top-8 left-6 right-6 flex justify-between items-center text-white text-xs">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            <div className="w-1 h-2 bg-white rounded-full" />
                            <div className="w-1 h-3 bg-white rounded-full" />
                            <div className="w-1 h-4 bg-white rounded-full" />
                            <div className="w-1 h-3 bg-white/50 rounded-full" />
                          </div>
                          <span className="ml-1">5G</span>
                          <div className="ml-2 w-6 h-3 border border-white rounded-sm relative">
                            <div className="absolute inset-0.5 bg-green-500 rounded-sm" style={{ width: '70%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone Glow */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full scale-150 opacity-50" />
                </div>

                {/* Instructions Panel */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      Cara Kerja AR System
                    </h2>
                    
                    <div className="space-y-3">
                      {[
                        { 
                          step: 1, 
                          title: 'Scan Target Image', 
                          desc: 'Arahkan kamera smartphone ke gambar target yang sudah dikonfigurasi.',
                          active: step === 'scan'
                        },
                        { 
                          step: 2, 
                          title: 'Deteksi & Tracking', 
                          desc: 'Sistem akan mendeteksi dan melacak posisi target secara real-time.',
                          active: step === 'detecting'
                        },
                        { 
                          step: 3, 
                          title: 'Tampilkan Konten AR', 
                          desc: 'Konten digital (video, 3D model, animasi) muncul di atas target.',
                          active: step === 'playing'
                        },
                      ].map((item) => (
                        <motion.div
                          key={item.step}
                          animate={{ 
                            scale: item.active ? 1.02 : 1,
                            opacity: item.active ? 1 : 0.6
                          }}
                          className={`flex gap-4 p-4 rounded-xl transition-colors ${
                            item.active 
                              ? 'bg-primary/10 border border-primary/30' 
                              : 'bg-muted/30'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            item.active 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {item.step}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {step === 'scan' ? (
                      <Button 
                        onClick={startDemo} 
                        className="flex-1"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Mulai Demo
                      </Button>
                    ) : (
                      <Button 
                        onClick={resetDemo} 
                        variant="outline"
                        className="flex-1"
                        size="lg"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Ulangi Demo
                      </Button>
                    )}
                    <Button variant="glass" size="lg">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Device Info */}
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Smartphone className="w-4 h-4" />
                    <span>Tersedia untuk iOS & Android</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid md:grid-cols-3 gap-6 mt-12"
            >
              {[
                {
                  icon: '🎯',
                  title: 'Image Recognition',
                  desc: 'Deteksi akurat dengan teknologi computer vision terdepan.'
                },
                {
                  icon: '⚡',
                  title: 'Real-time Tracking',
                  desc: 'Tracking posisi target dengan latensi rendah untuk pengalaman smooth.'
                },
                {
                  icon: '🎨',
                  title: 'Rich Content',
                  desc: 'Support video, 3D model, animasi, dan konten interaktif lainnya.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="glass-card p-6 rounded-2xl text-center hover:border-primary/50 transition-colors"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
