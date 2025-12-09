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
  const [isTracking, setIsTracking] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Load A-Frame
        if (!document.getElementById("aframe-script")) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.id = "aframe-script";
            script.src = "https://aframe.io/releases/1.3.0/aframe.min.js";
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load A-Frame"));
            document.head.appendChild(script);
          });
          console.log("✅ A-Frame loaded");
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Load AR.js
        if (!document.getElementById("arjs-script")) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.id = "arjs-script";
            script.src =
              "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.js";
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load AR.js"));
            document.head.appendChild(script);
          });
          console.log("✅ AR.js loaded");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        setState("permission");
      } catch (err) {
        console.error("Failed to load:", err);
        setError(err.message);
        setState("error");
      }
    };

    loadScripts();
  }, []);

  const startAR = async () => {
    try {
      setState("loading");

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      stream.getTracks().forEach((track) => track.stop());

      setState("scanning");

      // Wait for container to be ready
      setTimeout(() => {
        setupARScene();
      }, 500);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied. Please allow camera permissions.");
      setState("error");
    }
  };

  const setupARScene = () => {
    if (!containerRef.current) return;

    const sceneHTML = `
      <a-scene
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true; alpha: true;"
        style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"
      >
        <a-assets>
          <video
            id="ar-video"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            preload="auto"
            loop
            muted
            playsinline
            webkit-playsinline
            crossorigin="anonymous"
            style="display: none;"
          ></video>
        </a-assets>

        <a-marker
          preset="hiro"
          emitevents="true"
          smooth="true"
          smoothCount="10"
          smoothTolerance="0.01"
          smoothThreshold="5"
        >
          <a-plane
            width="2"
            height="1.125"
            position="0 0 0.01"
            rotation="-90 0 0"
            material="src: #ar-video; shader: flat; side: double;"
          ></a-plane>
        </a-marker>

        <a-entity camera></a-entity>
      </a-scene>
    `;

    containerRef.current.innerHTML = sceneHTML;

    // Setup event listeners after scene is loaded
    setTimeout(() => {
      const marker = document.querySelector("a-marker");
      const video = document.querySelector("#ar-video");

      if (marker && video) {
        const videoElement = video as HTMLVideoElement;
        videoRef.current = videoElement;

        marker.addEventListener("markerFound", () => {
          console.log("🎯 Marker found!");
          setIsTracking(true);
          if (videoElement.paused) {
            videoElement.play().catch((e) => console.warn("Play error:", e));
          }
        });

        marker.addEventListener("markerLost", () => {
          console.log("👻 Marker lost!");
          setIsTracking(false);
          if (!videoElement.paused) {
            videoElement.pause();
          }
        });

        // Force webcam video to be visible
        setTimeout(() => {
          const webcamVideos = document.querySelectorAll("video");
          webcamVideos.forEach((vid) => {
            // Skip AR content video
            if (vid.id !== "ar-video") {
              vid.style.display = "block";
              vid.style.position = "absolute";
              vid.style.top = "0";
              vid.style.left = "0";
              vid.style.width = "100%";
              vid.style.height = "100%";
              vid.style.objectFit = "cover";
              vid.style.zIndex = "0";
              console.log("✅ Webcam video visible");
            }
          });

          const canvas = document.querySelector(
            "canvas.a-canvas"
          ) as HTMLCanvasElement;
          if (canvas) {
            canvas.style.position = "absolute";
            canvas.style.zIndex = "1";
            console.log("✅ Canvas layered");
          }
        }, 500);

        console.log("✅ AR scene ready");
      }
    }, 1000);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleBack = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
    setState("permission");
    setIsTracking(false);
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

  if (state === "permission") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="max-w-md text-center text-white">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-2xl p-4 shadow-2xl">
              <svg viewBox="0 0 100 100" fill="none">
                <rect
                  x="10"
                  y="10"
                  width="80"
                  height="80"
                  fill="#667eea"
                  rx="5"
                />
                <rect x="20" y="20" width="20" height="20" fill="white" />
                <rect x="60" y="20" width="20" height="20" fill="white" />
                <rect x="20" y="60" width="20" height="20" fill="white" />
                <rect x="60" y="60" width="20" height="20" fill="white" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">🎥 AR Video Player</h1>
          <p className="text-lg mb-8 opacity-90">
            Arahkan kamera ke marker HIRO untuk memutar video dalam Augmented
            Reality
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 text-left">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Tips untuk AR
            </h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>✅ Download marker HIRO dari link di bawah</li>
              <li>✅ Tampilkan marker di layar atau print</li>
              <li>✅ Pencahayaan harus terang & merata</li>
              <li>✅ Jarak ideal 30-50 cm dari kamera</li>
            </ul>
          </div>

          <button
            onClick={startAR}
            className="w-full py-4 bg-white text-purple-600 rounded-xl font-bold text-lg transition hover:bg-gray-100 shadow-xl mb-4"
          >
            <Camera className="w-5 h-5 inline mr-2" />
            Mulai AR Experience
          </button>

          <a
            href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline opacity-90 hover:opacity-100"
          >
            Download Marker HIRO →
          </a>
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
              <span className="font-medium">Scanning for HIRO marker...</span>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent z-20">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AR</span>
            </div>
            <span className="font-bold">AR Video Player</span>
          </div>

          {isTracking && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-sm">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Video Playing</span>
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
              {isTracking && (
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

      {showInfo && (
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-black/90 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto z-30">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-xl font-bold text-white">AR Video Player</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="text-white hover:bg-white/10 p-1 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-sm text-white">
            <div>
              <p className="text-white/50 mb-1">Status</p>
              <p>
                {isTracking ? "✅ Video Playing" : "🔍 Searching for marker..."}
              </p>
            </div>
            <div>
              <p className="text-white/50 mb-1">Video</p>
              <p>Big Buck Bunny (Demo)</p>
            </div>
            <div>
              <p className="text-white/50 mb-1">Audio</p>
              <p>{isMuted ? "🔇 Muted" : "🔊 Unmuted"}</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 Video akan otomatis play saat marker HIRO terdeteksi
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
