import { useState, useEffect, useRef } from "react";
import {
  Camera,
  Loader2,
  AlertCircle,
  Info,
  X,
  Volume2,
  VolumeX,
  Check,
} from "lucide-react";

export default function ARViewer() {
  const [state, setState] = useState("loading");
  const [project, setProject] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cleanupRef = useRef(null);
  const initTimeoutRef = useRef(null);
  const videoElementRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        setState("loading");

        const originalWarn = console.warn;
        console.warn = function (...args) {
          if (args[0]?.includes?.("core:a-assets:warn")) return;
          originalWarn.apply(console, args);
        };

        await loadARLibraries();

        const mockProject = {
          id: "1",
          name: "Demo AR Project",
          description: "Scan HIRO marker to see AR content",
          targetImageUrl:
            "https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png",
          contentUrl:
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          contentType: "video",
          autoPlay: true,
          loopContent: true,
          trackingQuality: "medium",
        };

        setProject(mockProject);
        setState("permission");
      } catch (err) {
        console.error("Failed to initialize:", err);
        setError(err.message || "Failed to load AR experience");
        setState("error");
      }
    };

    init();

    return () => {
      cleanup();
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  const loadARLibraries = async () => {
    if ((window as any).AFRAME && (window as any).THREEx) {
      console.log("✅ AR libraries already loaded");
      return;
    }

    try {
      console.log("📦 Loading A-Frame...");
      if (!document.getElementById("aframe-script")) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.id = "aframe-script";
          script.src = "https://aframe.io/releases/1.6.0/aframe.min.js";
          script.onload = () => {
            console.log("✅ A-Frame 1.6.0 loaded");
            resolve();
          };
          script.onerror = () => reject(new Error("Failed to load A-Frame"));
          document.head.appendChild(script);
        });
      }

      console.log("📦 Loading AR.js...");
      if (!document.getElementById("arjs-script")) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.id = "arjs-script";
          script.src =
            "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js";
          script.onload = () => {
            console.log("✅ AR.js master loaded");
            resolve();
          };
          script.onerror = () => reject(new Error("Failed to load AR.js"));
          document.head.appendChild(script);
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✅ AR libraries ready");
    } catch (err) {
      console.error("❌ Failed to load AR libraries:", err);
      throw err;
    }
  };

  const startAR = async () => {
    console.log("🎬 Starting AR...");
    setState("loading");

    try {
      console.log("📹 Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      console.log("✅ Camera access granted");
      stream.getTracks().forEach((track) => track.stop());

      setState("scanning");
      initTimeoutRef.current = setTimeout(() => {
        initializeAR();
      }, 150);
    } catch (err) {
      console.error("❌ Camera permission error:", err);
      setError(
        "Camera access denied. Please allow camera permissions and try again."
      );
      setState("error");
    }
  };

  const initializeAR = async () => {
    if (!containerRef.current || !project || !(window as any).AFRAME) {
      console.error("❌ Prerequisites not ready");
      setError("AR environment not ready. Please try again.");
      setState("error");
      return;
    }

    cleanup();

    try {
      console.log("🏗️ Building AR scene...");

      const scene = document.createElement("a-scene");
      scene.setAttribute("embedded", "");
      scene.setAttribute(
        "arjs",
        "sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; sourceWidth: 640; sourceHeight: 480; displayWidth: 640; displayHeight: 480; videoTexture: true;"
      );
      scene.setAttribute("vr-mode-ui", "enabled: false");
      scene.setAttribute(
        "renderer",
        "logarithmicDepthBuffer: true; precision: medium; antialias: true; alpha: true;"
      );
      scene.setAttribute("device-orientation-permission-ui", "enabled: false");

      scene.style.width = "100%";
      scene.style.height = "100%";
      scene.style.position = "absolute";
      scene.style.top = "0";
      scene.style.left = "0";
      scene.style.zIndex = "1";

      const marker = document.createElement("a-marker");
      marker.setAttribute("preset", "hiro");
      marker.setAttribute("emitevents", "true");
      marker.setAttribute("id", "marker");

      let content;

      if (project.contentType === "image") {
        content = document.createElement("a-image");
        content.setAttribute("src", project.contentUrl);
        content.setAttribute("rotation", "-90 0 0");
        content.setAttribute("width", "1.5");
        content.setAttribute("height", "1.5");
        content.setAttribute("position", "0 0 0");
        content.setAttribute("material", "transparent: false; alphaTest: 0.5;");
      } else if (project.contentType === "video") {
        const assets = document.createElement("a-assets");

        const video = document.createElement("video");
        video.id = "ar-video";
        video.src = project.contentUrl;
        video.setAttribute("crossorigin", "anonymous");
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.loop = project.loopContent;
        video.muted = isMuted;
        video.autoplay = false;
        video.preload = "auto";

        videoElementRef.current = video;

        assets.appendChild(video);
        scene.appendChild(assets);

        content = document.createElement("a-plane");
        content.setAttribute("src", "#ar-video");
        content.setAttribute("rotation", "-90 0 0");
        content.setAttribute("width", "2");
        content.setAttribute("height", "1.5");
        content.setAttribute("position", "0 0 0");
      } else {
        content = document.createElement("a-box");
        content.setAttribute("position", "0 0.5 0");
        content.setAttribute("material", "color: #00D4FF");
        content.setAttribute(
          "animation",
          "property: rotation; to: 0 360 0; loop: true; dur: 10000"
        );
      }

      marker.appendChild(content);
      scene.appendChild(marker);

      const camera = document.createElement("a-entity");
      camera.setAttribute("camera", "");
      scene.appendChild(camera);

      scene.addEventListener("arjs-error", (e) => {
        console.error("AR.js Error:", e);
        setError("AR tracking error. Please reload the page.");
        setState("error");
      });

      const onMarkerFound = () => {
        console.log("🎯 Marker found!");
        setIsTracking(true);
        setState("tracking");

        if (videoElementRef.current && videoElementRef.current.paused) {
          videoElementRef.current.play().catch((err) => {
            console.error("Autoplay error:", err);
          });
        }
      };

      const onMarkerLost = () => {
        console.log("👻 Marker lost!");
        setIsTracking(false);
        setState("scanning");

        if (videoElementRef.current && !videoElementRef.current.paused) {
          videoElementRef.current.pause();
        }
      };

      marker.addEventListener("markerFound", onMarkerFound);
      marker.addEventListener("markerLost", onMarkerLost);

      const onSceneLoaded = () => {
        console.log("🎬 Scene loaded and ready");

        setTimeout(() => {
          const arVideo = (document.querySelector(
            "video[data-aframe-canvas]"
          ) || document.querySelector("video")) as HTMLVideoElement;

          if (arVideo) {
            console.log("✅ Found AR video element");

            arVideo.style.display = "block";
            arVideo.style.position = "absolute";
            arVideo.style.top = "0";
            arVideo.style.left = "0";
            arVideo.style.width = "100%";
            arVideo.style.height = "100%";
            arVideo.style.objectFit = "cover";
            arVideo.style.zIndex = "0";
            arVideo.style.visibility = "visible";

            if (arVideo.paused) {
              arVideo
                .play()
                .catch((e) => console.warn("Video play warning:", e));
            }

            console.log("Video dimensions:", {
              videoWidth: arVideo.videoWidth,
              videoHeight: arVideo.videoHeight,
              clientWidth: arVideo.clientWidth,
              clientHeight: arVideo.clientHeight,
            });
          } else {
            console.warn("⚠️ AR video element not found!");
          }

          const canvas = document.querySelector(
            "canvas.a-canvas"
          ) as HTMLCanvasElement;
          if (canvas) {
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.zIndex = "2";
            console.log("✅ Canvas positioned");
          }

          if (!(window as any).ARController) {
            console.warn("ARController not found, but continuing...");
          }
        }, 1500);
      };

      scene.addEventListener("loaded", onSceneLoaded);

      const errorHandler = (event: any) => {
        if (
          event.message?.includes("changeMatrixMode") ||
          event.message?.includes("Cannot read properties of undefined")
        ) {
          console.warn(
            "AR.js initialization warning - suppressed:",
            event.message
          );
          event.preventDefault();
          event.stopPropagation();
          return true;
        }
      };
      window.addEventListener("error", errorHandler, true);

      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(scene);
      sceneRef.current = scene;

      console.log("✅ AR scene initialized");

      cleanupRef.current = () => {
        console.log("🧹 Cleaning up AR scene...");
        window.removeEventListener("error", errorHandler);
        marker.removeEventListener("markerFound", onMarkerFound);
        marker.removeEventListener("markerLost", onMarkerLost);
        scene.removeEventListener("loaded", onSceneLoaded);

        if (videoElementRef.current) {
          videoElementRef.current.pause();
          videoElementRef.current.src = "";
          videoElementRef.current = null;
        }

        if ((scene as any).renderer) {
          (scene as any).renderer.dispose();
        }
      };
    } catch (err) {
      console.error("❌ Failed to initialize AR:", err);
      setError("Failed to initialize AR scene: " + err.message);
      setState("error");
    }
  };

  const cleanup = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
    sceneRef.current = null;
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoElementRef.current) {
      videoElementRef.current.muted = newMuted;
    }
  };

  const handleBack = () => {
    cleanup();
    setState("permission");
  };

  if (state === "loading") {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-lg">Loading AR Experience...</p>
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
          <p className="mb-6 text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (state === "permission" && project) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-md text-center text-white my-8">
          <div className="mb-6 relative">
            <div className="aspect-video rounded-2xl overflow-hidden border-2 border-gray-700 bg-gray-800">
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <Camera className="w-16 h-16 mb-4 text-blue-400" />
                <p className="text-sm text-gray-400 mb-2">Scan HIRO marker</p>
                <a
                  href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 underline hover:text-blue-300"
                >
                  Download marker →
                </a>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-gray-400 mb-6">{project.description}</p>
          )}

          <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left border border-gray-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Tips untuk Tracking Stabil
            </h3>
            <ol className="space-y-2 text-sm text-gray-400">
              <li>✅ Tampilkan marker di layar komputer/tablet</li>
              <li>✅ Ukuran marker minimal 10x10 cm di layar</li>
              <li>✅ Pencahayaan harus terang & merata</li>
              <li>✅ Jarak ideal 30-50 cm dari kamera</li>
              <li>✅ Jaga kamera tetap stabil</li>
            </ol>
          </div>

          <button
            onClick={startAR}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-500/30 active:scale-95"
          >
            <Camera className="w-5 h-5 inline mr-2" />
            Start AR Experience
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {state === "scanning" && !isTracking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            className="text-center text-white"
            style={{ textShadow: "0 0 10px rgba(0,0,0,0.8)" }}
          >
            <div className="relative w-64 h-64 mx-auto mb-6">
              <div className="absolute inset-0 border-2 border-dashed border-blue-500/50 rounded-2xl animate-pulse" />
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-blue-500" />
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-blue-500" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-blue-500" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-blue-500" />
            </div>

            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="font-medium">Scanning...</span>
            </div>
            <p className="text-white/60 text-sm mt-2">
              Point camera at HIRO marker
            </p>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent z-20">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AR</span>
            </div>
            <span className="font-bold">AR System</span>
          </div>

          {isTracking && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-sm">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Tracking</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              {project?.contentType === "video" && isTracking && (
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
            </div>
          </div>
        </div>
      </div>

      {showInfo && project && (
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-black/90 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto z-30">
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
              <p className="text-white/50 mb-1">Status</p>
              <p className="text-white">
                {isTracking ? "✅ Tracking Active" : "🔍 Searching..."}
              </p>
            </div>
            {project.contentType === "video" && (
              <div>
                <p className="text-white/50 mb-1">Video</p>
                <p className="text-white">
                  {isTracking ? "▶️ Auto-playing" : "⏸️ Waiting for marker"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 Video will autoplay when marker is detected
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
