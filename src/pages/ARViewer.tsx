import { useState, useEffect, useRef } from "react";
import {
  Camera,
  Loader2,
  AlertCircle,
  Info,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Check,
} from "lucide-react";

// Mock project data untuk demo
const MOCK_PROJECT = {
  id: "1",
  name: "Demo AR Project",
  description: "Scan marker untuk melihat konten AR",
  targetImageUrl:
    "https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png",
  contentUrl: "https://cdn.aframe.io/a-painter/images/a-painter-logo.png",
  contentType: "image",
  autoPlay: true,
  loopContent: true,
  trackingQuality: "medium",
};

type ViewerState = "loading" | "permission" | "scanning" | "tracking" | "error";

export default function ARViewer() {
  const [state, setState] = useState<ViewerState>("loading");
  const [project] = useState(MOCK_PROJECT);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState<string>("");
  const [isTracking, setIsTracking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    // Load A-Frame and AR.js
    const loadScripts = async () => {
      try {
        // Load A-Frame
        if (!document.getElementById("aframe-script")) {
          const aframeScript = document.createElement("script");
          aframeScript.id = "aframe-script";
          aframeScript.src = "https://aframe.io/releases/1.4.2/aframe.min.js";
          document.head.appendChild(aframeScript);

          await new Promise((resolve) => {
            aframeScript.onload = resolve;
          });
        }

        // Load AR.js
        if (!document.getElementById("arjs-script")) {
          const arjsScript = document.createElement("script");
          arjsScript.id = "arjs-script";
          arjsScript.src =
            "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js";
          document.head.appendChild(arjsScript);

          await new Promise((resolve) => {
            arjsScript.onload = resolve;
          });
        }

        // Small delay to ensure AR.js is fully initialized
        await new Promise((resolve) => setTimeout(resolve, 500));

        setState("permission");
      } catch (err) {
        console.error("Failed to load AR libraries:", err);
        setError("Gagal memuat library AR");
        setState("error");
      }
    };

    loadScripts();

    return () => {
      // Cleanup
      if (sceneRef.current) {
        const scene = sceneRef.current;
        if (scene.renderer) {
          scene.renderer.dispose();
        }
      }
    };
  }, []);

  const startAR = () => {
    setState("loading");

    // Small delay to show loading
    setTimeout(() => {
      setState("scanning");
      initializeAR();
    }, 500);
  };

  const initializeAR = () => {
    if (!containerRef.current) return;

    // Create A-Frame scene
    const scene = document.createElement("a-scene");
    scene.setAttribute("embedded", "");
    scene.setAttribute(
      "arjs",
      "sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
    );
    scene.setAttribute("vr-mode-ui", "enabled: false");
    scene.style.width = "100%";
    scene.style.height = "100%";

    // Create marker
    const marker = document.createElement("a-marker");
    marker.setAttribute("preset", "hiro");
    marker.setAttribute("emitevents", "true");
    marker.setAttribute("id", "marker");

    // Create content based on type
    let content;
    if (project.contentType === "image") {
      // Create image content
      content = document.createElement("a-image");
      content.setAttribute("src", project.contentUrl);
      content.setAttribute("rotation", "-90 0 0");
      content.setAttribute("width", "2");
      content.setAttribute("height", "2");
      content.setAttribute("position", "0 0 0");
    } else if (project.contentType === "video") {
      // Create video asset
      const assets = document.createElement("a-assets");
      const video = document.createElement("video");
      video.id = "ar-video";
      video.src = project.contentUrl;
      video.setAttribute("crossorigin", "anonymous");
      video.loop = project.loopContent;
      video.muted = isMuted;
      if (project.autoPlay) {
        video.setAttribute("autoplay", "");
      }
      assets.appendChild(video);
      scene.appendChild(assets);

      // Create video content
      content = document.createElement("a-video");
      content.setAttribute("src", "#ar-video");
      content.setAttribute("rotation", "-90 0 0");
      content.setAttribute("width", "2");
      content.setAttribute("height", "2");
      content.setAttribute("position", "0 0 0");
    } else {
      // Default to plane for 3D models
      content = document.createElement("a-box");
      content.setAttribute("position", "0 0.5 0");
      content.setAttribute("color", "#00D4FF");
      content.setAttribute(
        "animation",
        "property: rotation; to: 0 360 0; loop: true; dur: 10000"
      );
    }

    marker.appendChild(content);

    // Add camera
    const camera = document.createElement("a-entity");
    camera.setAttribute("camera", "");
    scene.appendChild(camera);

    // Add marker to scene
    scene.appendChild(marker);

    // Clear container and add scene
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(scene);
    sceneRef.current = scene;

    // Listen for marker events
    marker.addEventListener("markerFound", () => {
      console.log("Marker found!");
      setIsTracking(true);
      setState("tracking");
    });

    marker.addEventListener("markerLost", () => {
      console.log("Marker lost!");
      setIsTracking(false);
      setState("scanning");
    });

    // Error handling
    scene.addEventListener("camera-error", (err: any) => {
      console.error("Camera error:", err);
      setError("Gagal mengakses kamera");
      setState("error");
    });
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const video = document.getElementById("ar-video") as HTMLVideoElement;
    if (video) {
      video.muted = !isMuted;
    }
  };

  const handleBack = () => {
    // In real app, use navigate(-1)
    window.history.back();
  };

  if (state === "loading") {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Loading AR Experience...</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md text-center text-white">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="mb-6">{error || "Terjadi kesalahan saat memuat AR"}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (state === "permission") {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md text-center text-white">
          {/* Preview */}
          <div className="mb-6 relative">
            <div className="aspect-video rounded-2xl overflow-hidden border-2 border-gray-700 bg-gray-800">
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <Camera className="w-16 h-16 mb-4 text-blue-400" />
                <p className="text-sm text-gray-400">
                  Scan HIRO marker untuk demo
                </p>
                <a
                  href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs text-blue-400 underline"
                >
                  Download marker →
                </a>
              </div>
            </div>
          </div>

          {/* Info */}
          <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-gray-400 mb-6">{project.description}</p>
          )}

          {/* Instructions */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left border border-gray-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Cara Menggunakan
            </h3>
            <ol className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </span>
                <span>Download dan print HIRO marker</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </span>
                <span>Izinkan akses kamera</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </span>
                <span>Arahkan kamera ke marker</span>
              </li>
            </ol>
          </div>

          {/* Start Button */}
          <button
            onClick={startAR}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-500/30"
          >
            <Camera className="w-5 h-5 inline mr-2" />
            Mulai AR Experience
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* AR Scene Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Scanning Overlay */}
      {state === "scanning" && !isTracking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
          <div className="text-center text-white">
            {/* Scanning Frame */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              <div className="absolute inset-0 border-2 border-dashed border-blue-500/50 rounded-2xl" />
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-blue-500" />
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-blue-500" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-blue-500" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-blue-500" />

              {/* Scanning Line */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"
                style={{ top: "50%" }}
              />
            </div>

            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="font-medium">Scanning for marker...</span>
            </div>
            <p className="text-white/60 text-sm mt-2">
              Arahkan kamera ke HIRO marker
            </p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute inset-x-0 top-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AR</span>
            </div>
            <span className="font-bold">AR System</span>
          </div>

          {isTracking && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Tracking</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              {project.contentType === "video" && (
                <button
                  onClick={toggleMute}
                  className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition flex items-center justify-center"
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
              )}

              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition flex items-center justify-center"
              >
                <Info className="w-6 h-6" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition flex items-center justify-center"
              >
                <Maximize2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto z-20">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-xl font-bold text-white">{project.name}</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="text-white hover:bg-white/10 p-1 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {project.description && (
            <p className="text-white/70 text-sm mb-6">{project.description}</p>
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
              <p className="text-white capitalize">{project.trackingQuality}</p>
            </div>
            <div>
              <p className="text-white/50 mb-1">Status</p>
              <p className="text-white">
                {isTracking ? "✅ Tracking Active" : "🔍 Searching..."}
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 Tip: Keep the marker flat and well-lit for best tracking
              performance
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
