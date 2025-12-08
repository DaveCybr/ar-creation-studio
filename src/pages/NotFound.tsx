import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/GridBackground";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen relative">
      <GridBackground />

      <main className="relative flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          {/* 404 Number */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="font-display text-8xl md:text-9xl font-bold gradient-text mb-4">
              404
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full" />
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl font-bold mb-2">
              Oops! Halaman Tidak Ditemukan
            </h2>
            <p className="text-muted-foreground">
              Halaman yang Anda cari tidak ada atau telah dipindahkan.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Kembali ke Home
              </Link>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </motion.div>

          {/* Decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-12"
          >
            <Search className="w-16 h-16 text-muted-foreground/20 mx-auto" />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
