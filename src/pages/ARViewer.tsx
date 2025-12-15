import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Loader2,
  AlertCircle,
  Info,
  X,
  Volume2,
  VolumeX,
  Check,
  RotateCcw,
} from "lucide-react";
import * as THREE from "three";

interface MindARThreeInstance {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  addAnchor: (index: number) => {
    group: THREE.Group;
    onTargetFound: () => void;
    onTargetLost: () => void;
  };
  start: () => Promise<void>;
  stop: () => void;
}

interface MindARImageModule {
  MindARThree: new (config: {
    container: HTMLElement;
    imageTargetSrc: string;
    uiLoading?: string;
    uiScanning?: string;
    uiError?: string;
  }) => MindARThreeInstance;
}

declare global {
  interface Window {
    THREE: typeof THREE;
    MINDAR: {
      IMAGE: MindARImageModule;
    };
  }
}

type ARState = "loading" | "permission" | "scanning" | "error";

export default function ARViewer() {
  const [state, setState] = useState<ARState>("loading");
  const [isTracking, setIsTracking] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mindarRef = useRef<MindARThreeInstance | null>(null);

  // Load MindAR and Three.js scripts
  useEffect(() => {
    const loadScripts = async () => {
      try {
        setLoadingProgress(10);

        // Load Three.js first
        if (!window.THREE) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/three@0.160.0/build/three.min.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Three.js"));
            document.head.appendChild(script);
          });
          console.log("✅ Three.js loaded");
        }
        setLoadingProgress(40);

        // Load MindAR Image Tracking
        if (!window.MINDAR?.IMAGE) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load MindAR"));
            document.head.appendChild(script);
          });
          console.log("✅ MindAR loaded");
        }
        setLoadingProgress(70);

        // Small delay to ensure scripts are fully initialized
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoadingProgress(100);

        setState("permission");
      } catch (err: unknown) {
        console.error("Failed to load scripts:", err);
        setError(err instanceof Error ? err.message : "Failed to load AR libraries");
        setState("error");
      }
    };

    loadScripts();

    return () => {
      // Cleanup on unmount
      if (mindarRef.current) {
        try {
          mindarRef.current.stop();
        } catch (e) {
          console.warn("Error stopping MindAR:", e);
        }
      }
    };
  }, []);

  const startAR = useCallback(async () => {
    if (!containerRef.current || !window.MINDAR?.IMAGE || !window.THREE) {
      setError("AR libraries not loaded properly");
      setState("error");
      return;
    }

    try {
      setState("loading");
      setLoadingProgress(0);

      // Request camera permission first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      
      // Stop the test stream - MindAR will handle camera
      stream.getTracks().forEach((track) => track.stop());
      
      console.log("✅ Camera permission granted");
      setLoadingProgress(30);

      // Clear container
      containerRef.current.innerHTML = "";

      // Create MindAR instance with demo target
      const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: containerRef.current,
        imageTargetSrc: "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind",
        uiLoading: "no",
        uiScanning: "no",
        uiError: "no",
      });

      mindarRef.current = mindarThree;
      const { renderer, scene, camera } = mindarThree;

      // Configure renderer for better quality
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = window.THREE.SRGBColorSpace;

      setLoadingProgress(50);

      // Create video element for portrait video
      const video = document.createElement("video");
      video.src = "https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-happily-in-front-of-a-pink-background-42296-large.mp4";
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("webkit-playsinline", "true");
      video.preload = "auto";

      videoRef.current = video;

      // Wait for video metadata
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Failed to load video"));
        video.load();
      });

      console.log(`📹 Video loaded: ${video.videoWidth}x${video.videoHeight}`);
      setLoadingProgress(70);

      // Create video texture
      const videoTexture = new window.THREE.VideoTexture(video);
      videoTexture.minFilter = window.THREE.LinearFilter;
      videoTexture.magFilter = window.THREE.LinearFilter;
      videoTexture.colorSpace = window.THREE.SRGBColorSpace;
      videoTexture.generateMipmaps = false;

      // Target dimensions (card.mind target is ~1:0.55 aspect ratio)
      const targetWidth = 1;
      const targetHeight = 0.55;

      // Video dimensions
      const videoAspect = video.videoWidth / video.videoHeight;
      const targetAspect = targetWidth / targetHeight;

      // Calculate plane size for COVER mode (fill entire target, crop excess)
      let planeWidth: number;
      let planeHeight: number;

      if (videoAspect > targetAspect) {
        // Video is wider - match height, crop sides
        planeHeight = targetHeight;
        planeWidth = targetHeight * videoAspect;
      } else {
        // Video is taller - match width, crop top/bottom
        planeWidth = targetWidth;
        planeHeight = targetWidth / videoAspect;
      }

      // Create plane geometry for video
      const geometry = new window.THREE.PlaneGeometry(planeWidth, planeHeight);
      const material = new window.THREE.MeshBasicMaterial({
        map: videoTexture,
        side: window.THREE.DoubleSide,
        toneMapped: false,
      });

      const videoPlane = new window.THREE.Mesh(geometry, material);

      // Create clipping mask to match target size
      // Use a group with proper positioning
      const anchor = mindarThree.addAnchor(0);
      
      // Add video plane to anchor group
      anchor.group.add(videoPlane);

      // Handle target found/lost events
      anchor.onTargetFound = () => {
        console.log("🎯 Target found!");
        setIsTracking(true);
        if (video.paused) {
          video.play().catch((e) => console.warn("Video play error:", e));
        }
      };

      anchor.onTargetLost = () => {
        console.log("👻 Target lost");
        // Delay to prevent flickering
        setTimeout(() => {
          setIsTracking(false);
        }, 500);
      };

      setLoadingProgress(90);

      // Start MindAR
      await mindarThree.start();

      console.log("✅ MindAR started");
      setLoadingProgress(100);
      setState("scanning");

      // Animation loop
      renderer.setAnimationLoop(() => {
        // Update video texture
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          videoTexture.needsUpdate = true;
        }
        renderer.render(scene, camera);
      });

    } catch (err: unknown) {
      console.error("AR start error:", err);
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera permissions and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to start AR experience");
      }
      setState("error");
    }
  }, []);

  const stopAR = useCallback(() => {
    if (mindarRef.current) {
      try {
        mindarRef.current.stop();
        mindarRef.current.renderer.setAnimationLoop(null);
      } catch (e) {
        console.warn("Error stopping MindAR:", e);
      }
      mindarRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current = null;
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    setIsTracking(false);
    setState("permission");
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  // Loading screen
  if (state === "loading") {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-xs px-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-cyan-400" />
          <p className="text-lg mb-4">Loading AR Experience...</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">{loadingProgress}%</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (state === "error") {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md text-center text-white">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="mb-6 text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium transition flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Permission screen
  if (state === "permission") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-cyan-900 to-gray-900 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-md w-full text-center text-white py-4">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-4 shadow-2xl shadow-cyan-500/30">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <path d="M50 10L90 90H10L50 10Z" fill="white" fillOpacity="0.9"/>
                <circle cx="50" cy="50" r="15" fill="white"/>
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            AR Video Player
          </h1>
          <p className="text-base mb-6 text-gray-300">
            MindAR + Three.js powered experience
          </p>

          {/* Tips */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-cyan-300">
              <Info className="w-4 h-4" />
              Cara Penggunaan
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">1.</span>
                Download atau tampilkan target card di bawah
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">2.</span>
                Tekan tombol "Mulai AR" dan izinkan akses kamera
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">3.</span>
                Arahkan kamera ke target card
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">4.</span>
                Video akan muncul di atas target!
              </li>
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={startAR}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl font-bold text-lg transition shadow-xl shadow-cyan-500/30 mb-4 flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Mulai AR Experience
          </button>

          {/* Target download */}
          <a
            href="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.png"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
          >
            📥 Download Target Card Image
          </a>
        </div>
      </div>
    );
  }

  // Scanning/AR view
  return (
    <div className="fixed inset-0 bg-black">
      {/* AR Container */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ width: "100vw", height: "100vh" }}
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold">
                AR
              </div>
              <span className="text-white text-sm font-medium">AR Video Player</span>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
            isTracking 
              ? "bg-green-500/80 text-white" 
              : "bg-yellow-500/80 text-black"
          }`}>
            {isTracking ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Playing
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                Scanning...
              </>
            )}
          </div>
        </div>

        {/* Scanning guide */}
        {!isTracking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Animated corners */}
              <div className="w-48 h-48 relative">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg animate-pulse" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg animate-pulse" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg animate-pulse" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-400 rounded-br-lg animate-pulse" />
              </div>
              <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white text-sm whitespace-nowrap bg-black/50 px-3 py-1 rounded-full">
                Point at target card
              </p>
            </div>
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-4 pointer-events-auto">
          <button
            onClick={stopAR}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={toggleMute}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Info panel */}
        {showInfo && (
          <div className="absolute bottom-24 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 text-white text-sm pointer-events-auto">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-cyan-300">Info</h4>
              <button onClick={() => setShowInfo(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-1 text-gray-300">
              <li>• Powered by MindAR + Three.js</li>
              <li>• Using demo target (card.mind)</li>
              <li>• Video: Portrait mode, cover fit</li>
              <li>• Optimized for Android</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
