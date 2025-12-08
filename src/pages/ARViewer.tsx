// src/pages/ARViewer.tsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { api, Project } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Camera,
  Loader2,
  AlertCircle,
  RefreshCcw,
  Maximize2,
  Volume2,
  VolumeX,
  Info,
  X,
  ScanLine,
  Check,
} from "lucide-react";

type ViewerState = "loading" | "permission" | "scanning" | "tracking" | "error";

// Generate session ID untuk tracking
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get device info
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let osType = "other";
  let osVersion = "unknown";

  if (/iPad|iPhone|iPod/.test(ua)) {
    osType = "iOS";
    const match = ua.match(/OS (\d+)_(\d+)/);
    if (match) osVersion = `${match[1]}.${match[2]}`;
  } else if (/Android/.test(ua)) {
    osType = "Android";
    const match = ua.match(/Android (\d+\.?\d*)/);
    if (match) osVersion = match[1];
  }

  return {
    osType,
    osVersion,
    deviceModel: navigator.platform,
    userAgent: ua,
  };
};

export default function ARViewer() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Session tracking
  const sessionIdRef = useRef<string>(generateSessionId());
  const startTimeRef = useRef<number>(0);

  const [state, setState] = useState<ViewerState>("loading");
  const [project, setProject] = useState<Project | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [trackingQuality, setTrackingQuality] = useState<
    "excellent" | "good" | "poor"
  >("good");

  useEffect(() => {
    if (shortCode) {
      loadProject();
    }

    // Cleanup on unmount
    return () => {
      if (project?.id && startTimeRef.current > 0) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        trackEvent("ar_end", { trackingDuration: duration });
      }
    };
  }, [shortCode]);

  const loadProject = async () => {
    try {
      setState("loading");

      // Gunakan public endpoint dari API collection
      const response = await api.getProjectByShortCode(shortCode!);
      setProject(response.data);
      setState("permission");
    } catch (error) {
      console.error("Load project error:", error);
      toast({
        title: "Error",
        description: "AR Experience tidak ditemukan atau sudah tidak aktif",
        variant: "destructive",
      });
      setState("error");
    }
  };

  const trackEvent = async (
    eventType: "ar_start" | "ar_end" | "tracking_lost" | "content_interaction",
    additionalData: Record<string, any> = {}
  ) => {
    if (!project?.id) return;

    const deviceInfo = getDeviceInfo();

    try {
      await api.trackArEvent(project.id, {
        sessionId: sessionIdRef.current,
        eventType,
        deviceModel: deviceInfo.deviceModel,
        osType: deviceInfo.osType,
        osVersion: deviceInfo.osVersion,
        appVersion: "1.0.0",
        ...additionalData,
      });
    } catch (error) {
      // Silent fail - analytics tidak critical
      console.log("Track event failed:", error);
    }
  };

  const startCamera = async () => {
    try {
      setState("loading");
      startTimeRef.current = Date.now();

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setState("scanning");

      // Track AR start
      trackEvent("ar_start", {
        loadDuration: Date.now() - startTimeRef.current,
      });

      // Simulate tracking
      setTimeout(() => {
        setState("tracking");
      }, 2000);
    } catch (error) {
      console.error("Camera error:", error);
      toast({
        title: "Camera Error",
        description:
          "Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.",
        variant: "destructive",
      });
      setState("error");

      // Track error
      trackEvent("ar_end", {
        error: "camera_permission_denied",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Track session end
    if (startTimeRef.current > 0) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      trackEvent("ar_end", { trackingDuration: duration });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRetry = () => {
    setState("permission");
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading AR Experience...</p>
        </div>
      </div>
    );
  }

  if (state === "error" || !project) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Oops! Something Went Wrong
          </h2>
          <p className="text-muted-foreground mb-6">
            AR Experience tidak dapat dimuat. Pastikan link Anda benar dan
            proyek masih aktif.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
            <Button variant="hero" onClick={handleRetry}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (state === "permission") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          {/* Preview */}
          <div className="mb-6 relative">
            <div className="aspect-video rounded-2xl overflow-hidden border-2 border-border/50 bg-muted">
              {project.targetImageUrl ? (
                <img
                  src={project.targetImageUrl}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center"
            >
              <Camera className="w-6 h-6 text-primary" />
            </motion.div>
          </div>

          {/* Info */}
          <h1 className="font-display text-2xl font-bold mb-2">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-muted-foreground mb-6">{project.description}</p>
          )}

          {/* Instructions */}
          <div className="glass rounded-xl p-4 mb-6 border border-border/50 text-left">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Cara Menggunakan
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </span>
                <span>Izinkan akses kamera pada browser</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </span>
                <span>Arahkan kamera ke target image di atas</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </span>
                <span>Nikmati pengalaman AR Anda!</span>
              </li>
            </ol>
          </div>

          {/* Start Button */}
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={startCamera}
          >
            <Camera className="w-5 h-5 mr-2" />
            Mulai AR Experience
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Powered by AR System
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Camera Feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted={isMuted}
      />

      {/* Canvas for AR content */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Scanning Overlay */}
      <AnimatePresence>
        {state === "scanning" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="text-center">
              {/* Scanning Frame */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-2xl" />
                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-primary" />
                <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-primary" />
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-primary" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary" />

                {/* Scanning Line */}
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                />
              </div>

              <div className="flex items-center gap-2 justify-center text-white">
                <ScanLine className="w-5 h-5 animate-pulse" />
                <span className="font-medium">Scanning for target...</span>
              </div>
              <p className="text-white/60 text-sm mt-2">
                Arahkan kamera ke target image
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AR Content Display */}
      <AnimatePresence>
        {state === "tracking" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Simulated AR Content */}
            <div className="w-3/4 max-w-md aspect-video bg-gradient-to-br from-primary/40 via-secondary/40 to-accent/40 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center">
              {project.contentType === "video" && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                    <div className="w-0 h-0 border-l-8 border-l-white border-y-6 border-y-transparent ml-1" />
                  </div>
                  <p className="text-white text-sm font-medium">
                    AR Video Playing
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Controls */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-4xl mx-auto">
          {/* Tracking Status */}
          {state === "tracking" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">
                  Tracking:{" "}
                  {trackingQuality === "excellent"
                    ? "Excellent"
                    : trackingQuality === "good"
                    ? "Good"
                    : "Poor"}
                </span>
              </div>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
              onClick={() => {
                stopCamera();
                navigate("/");
              }}
            >
              <X className="w-6 h-6" />
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                onClick={() => setShowInfo(!showInfo)}
              >
                <Info className="w-6 h-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                onClick={toggleFullscreen}
              >
                <Maximize2 className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-white">
                {project.name}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setShowInfo(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {project.description && (
              <p className="text-white/70 text-sm mb-6">
                {project.description}
              </p>
            )}

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-white/50 mb-1">Content Type</p>
                <p className="text-white capitalize">
                  {project.contentType.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Tracking Quality</p>
                <p className="text-white capitalize">
                  {project.trackingQuality}
                </p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Views</p>
                <p className="text-white">
                  {project?.viewCount?.toLocaleString() ?? 0} views
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="absolute inset-x-0 top-0 p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white text-xs font-bold">AR</span>
            </div>
            <span className="font-display font-semibold">AR System</span>
          </div>

          {state === "tracking" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Target Locked</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
