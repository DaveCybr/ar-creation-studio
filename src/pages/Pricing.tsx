import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { GridBackground } from '@/components/GridBackground';
import { Button } from '@/components/ui/button';
import { Check, Zap, Building2, Rocket } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    description: 'Untuk individu dan proyek kecil',
    price: 'Gratis',
    period: '',
    icon: Zap,
    color: 'from-cyan-500 to-blue-500',
    features: [
      '3 proyek AR aktif',
      '1.000 scan/bulan',
      'Target image recognition',
      'Analytics dasar',
      'Community support',
    ],
    cta: 'Mulai Gratis',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Untuk kreator dan bisnis berkembang',
    price: 'Rp 299K',
    period: '/bulan',
    icon: Rocket,
    color: 'from-primary to-secondary',
    features: [
      '25 proyek AR aktif',
      '50.000 scan/bulan',
      'Video & 3D model support',
      'Analytics lengkap',
      'Custom branding',
      'Priority support',
      'API access',
    ],
    cta: 'Pilih Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Untuk perusahaan skala besar',
    price: 'Custom',
    period: '',
    icon: Building2,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Unlimited proyek AR',
      'Unlimited scan',
      'Dedicated infrastructure',
      'SLA 99.9% uptime',
      'Custom integration',
      'Dedicated account manager',
      'On-premise option',
      'White-label solution',
    ],
    cta: 'Hubungi Sales',
    popular: false,
  },
];

export default function Pricing() {
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
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              <span className="text-gradient">Pilih Paket</span> yang Tepat
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Mulai gratis dan upgrade sesuai kebutuhan. Semua paket termasuk 
              fitur dasar AR dengan kualitas tinggi.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-primary to-secondary rounded-full text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                      Paling Populer
                    </div>
                  </div>
                )}

                <div
                  className={`h-full glass-card rounded-2xl p-8 border transition-all duration-300 hover:border-primary/50 ${
                    plan.popular
                      ? 'border-primary/50 shadow-xl shadow-primary/10'
                      : 'border-border/50'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}
                  >
                    <plan.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Plan Info */}
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <span className="text-4xl font-display font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    variant={plan.popular ? 'hero' : 'outline'}
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link to={plan.name === 'Enterprise' ? '/contact' : '/register'}>
                      {plan.cta}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-24 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-12">
              Pertanyaan Umum
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: 'Apa itu scan dalam konteks AR?',
                  a: 'Scan adalah setiap kali pengguna mengarahkan kamera ke target image dan konten AR ditampilkan. Limit scan di-reset setiap bulan.',
                },
                {
                  q: 'Bisakah saya upgrade atau downgrade kapan saja?',
                  a: 'Ya, Anda dapat mengubah paket kapan saja. Perubahan akan berlaku di billing period berikutnya. Tidak ada biaya tersembunyi.',
                },
                {
                  q: 'Apakah ada free trial untuk paket Pro?',
                  a: 'Ya! Anda bisa mencoba semua fitur Pro selama 14 hari secara gratis. Tidak perlu kartu kredit untuk memulai.',
                },
                {
                  q: 'Format konten apa yang didukung?',
                  a: 'Kami mendukung image (JPG, PNG, WebP), video (MP4, WebM), dan 3D model (GLTF, GLB). Ukuran maksimal tergantung paket Anda.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="glass-card rounded-xl p-6 border border-border/50"
                >
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-24 text-center"
          >
            <div className="glass-card rounded-2xl p-12 max-w-4xl mx-auto border border-border/50">
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Masih Ragu?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Coba demo gratis kami untuk melihat bagaimana AR System dapat 
                mengubah cara Anda berinteraksi dengan audiens.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/demo">Lihat Demo</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/register">Mulai Gratis</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
