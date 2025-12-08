import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GridBackground } from '@/components/GridBackground';
import { Navbar } from '@/components/Navbar';
import { 
  Box, 
  Smartphone, 
  Zap, 
  BarChart3, 
  QrCode, 
  Upload,
  ArrowRight,
  Play
} from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Easy Upload',
    description: 'Upload target images and AR content with just a few clicks. Support for images, videos, and 3D models.',
  },
  {
    icon: QrCode,
    title: 'QR Code Sharing',
    description: 'Automatically generate QR codes for each project. Share your AR experiences instantly.',
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform',
    description: 'Works on iOS and Android devices. No app download required with WebAR support.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track views, engagement, and device statistics. Understand your audience better.',
  },
  {
    icon: Zap,
    title: 'High Performance',
    description: 'Optimized tracking engine for smooth AR experiences. Low latency content delivery.',
  },
  {
    icon: Box,
    title: '3D Support',
    description: 'Full support for 3D models with animations. Create immersive experiences.',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen relative">
      <GridBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Platform AR Generasi Berikutnya
              </span>
            </motion.div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Buat Pengalaman{' '}
              <span className="gradient-text">Augmented Reality</span>{' '}
              yang Menakjubkan
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Platform lengkap untuk membuat, mengelola, dan membagikan konten AR. 
              Upload target image, tambahkan konten multimedia, dan bagikan melalui QR code.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Mulai Gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/demo">
                  <Play className="w-5 h-5 mr-2" />
                  Lihat Demo
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl">
              {/* Main preview card */}
              <div className="glass rounded-2xl p-2 border border-border/50 shadow-2xl">
                <div className="bg-muted rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
                  {/* Mock dashboard preview - hidden on mobile for cleaner look */}
                  <div className="absolute inset-2 md:inset-4 flex gap-2 md:gap-4">
                    <div className="w-32 md:w-64 glass rounded-lg p-2 md:p-4 space-y-2 md:space-y-3 hidden sm:block">
                      <div className="h-3 md:h-4 w-3/4 bg-primary/20 rounded" />
                      <div className="space-y-1 md:space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-8 md:h-12 bg-muted-foreground/10 rounded-lg flex items-center gap-1 md:gap-2 px-2 md:px-3">
                            <div className="w-5 h-5 md:w-8 md:h-8 rounded bg-primary/20" />
                            <div className="flex-1 space-y-0.5 md:space-y-1">
                              <div className="h-1.5 md:h-2 w-3/4 bg-foreground/20 rounded" />
                              <div className="h-1.5 md:h-2 w-1/2 bg-muted-foreground/20 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 glass rounded-lg p-2 md:p-4 flex items-center justify-center">
                      <div className="text-center">
                        <Box className="w-10 h-10 md:w-16 md:h-16 text-primary mx-auto mb-2 md:mb-4 animate-float" />
                        <p className="text-muted-foreground text-xs md:text-base">AR Preview Area</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-4 lg:-left-8 top-1/4 glass rounded-xl p-3 md:p-4 border border-primary/30 hidden sm:block"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Views Today</p>
                    <p className="font-display font-bold text-base md:text-lg">12,847</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-4 lg:-right-8 bottom-1/4 glass rounded-xl p-3 md:p-4 border border-secondary/30 hidden sm:block"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <QrCode className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Projects</p>
                    <p className="font-display font-bold text-base md:text-lg">24</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Fitur <span className="gradient-text">Lengkap</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk membuat dan mengelola pengalaman AR profesional
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group glass rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(187_100%_50%/0.1)]"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative glass rounded-3xl p-12 text-center overflow-hidden border border-border/50"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Siap Membuat Pengalaman AR?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Mulai gratis hari ini. Tidak perlu kartu kredit.
              </p>
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Mulai Sekarang
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Box className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">AR System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 AR System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
