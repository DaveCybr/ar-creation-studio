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

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        if (!document.getElementById("aframe-script")) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.id = "aframe-script";
            script.src = "https://aframe.io/releases/1.3.0/aframe.min.js";
            script.onload = resolve as any;
            script.onerror = () => reject(new Error("Failed to load A-Frame"));
            document.head.appendChild(script);
          });
          console.log("✅ A-Frame loaded");
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (!document.getElementById("arjs-script")) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.id = "arjs-script";
            script.src =
              "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.js";
            script.onload = resolve as any;
            script.onerror = () => reject(new Error("Failed to load AR.js"));
            document.head.appendChild(script);
          });
          console.log("✅ AR.js loaded");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        setState("permission");
      } catch (err: any) {
        console.error("Failed to load:", err);
        setError(err.message);
        setState("error");
      }
    };

    loadScripts();

    // AGGRESSIVE fix for responsive styles
    const fixResponsiveStyles = () => {
      const body = document.body;
      const html = document.documentElement;

      body.style.cssText =
        "width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; position: fixed !important; top: 0 !important; left: 0 !important;";
      html.style.cssText =
        "width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important;";

      const arjsVideo = document.getElementById("arjs-video");
      if (arjsVideo) {
        (arjsVideo as HTMLVideoElement).style.cssText =
          "width: 100vw !important; height: 100vh !important; margin: 0 !important; object-fit: cover !important; position: absolute !important; top: 0 !important; left: 0 !important; z-index: -2 !important;";
      }

      const allVideos = document.querySelectorAll("video");
      allVideos.forEach((vid) => {
        if (vid.id === "arjs-video") {
          vid.style.cssText =
            "width: 100vw !important; height: 100vh !important; margin: 0 !important; object-fit: cover !important; position: absolute !important; top: 0 !important; left: 0 !important; z-index: -2 !important;";
        }
      });
    };

    // Use MutationObserver instead of aggressive interval
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const target = mutation.target;

          if (target === document.body) {
            if (
              document.body.style.marginLeft !== "0px" ||
              document.body.style.marginTop !== "0px" ||
              document.body.style.width !== "100vw"
            ) {
              document.body.style.cssText =
                "width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; position: fixed !important; top: 0 !important; left: 0 !important;";
            }
          }

          const arjsVideo = document.getElementById("arjs-video");
          if (target === arjsVideo && arjsVideo) {
            if (
              (arjsVideo as HTMLVideoElement).style.marginLeft !== "0px" ||
              (arjsVideo as HTMLVideoElement).style.marginTop !== "0px"
            ) {
              (arjsVideo as HTMLVideoElement).style.cssText =
                "width: 100vw !important; height: 100vh !important; margin: 0 !important; object-fit: cover !important; position: absolute !important; top: 0 !important; left: 0 !important; z-index: -2 !important;";
            }
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        document.body.style.cssText =
          "width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; position: fixed !important; top: 0 !important; left: 0 !important;";

        const arjsVideo = document.getElementById("arjs-video");
        if (arjsVideo) {
          (arjsVideo as HTMLVideoElement).style.cssText =
            "width: 100vw !important; height: 100vh !important; margin: 0 !important; object-fit: cover !important; position: absolute !important; top: 0 !important; left: 0 !important; z-index: -2 !important;";
        }
      }, 300);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const startAR = async () => {
    try {
      setState("loading");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log("✅ Camera permission granted");
      streamRef.current = stream;

      setState("scanning");

      setTimeout(() => {
        setupARScene(stream);
      }, 300);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Camera access denied. Please allow camera permissions.");
      setState("error");
    }
  };

  const setupARScene = (stream?: MediaStream) => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    if (stream) {
      const videoFallback = document.createElement("video");
      videoFallback.id = "camera-fallback";
      videoFallback.autoplay = true;
      videoFallback.playsInline = true;
      videoFallback.muted = true;
      videoFallback.srcObject = stream;
      videoFallback.style.cssText =
        "position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;";
      containerRef.current.appendChild(videoFallback);
      videoFallback
        .play()
        .catch((e) => console.warn("Fallback video play error:", e));
      console.log("✅ Camera fallback video added");
    }

    const arContainer = document.createElement("div");
    arContainer.id = "ar-container-div";
    arContainer.style.cssText =
      "position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;";

    arContainer.innerHTML = `
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
          smoothCount="20"
          smoothTolerance="0.05"
          smoothThreshold="10"
        >
          <a-plane
            width="1."
            height="1.6"
            position="0 0.4 0"
            rotation="-90 0 0"
            material="src: #ar-video; shader: flat; side: double;"
          ></a-plane>
        </a-marker>

        <a-entity camera></a-entity>
      </a-scene>
    `;

    containerRef.current.appendChild(arContainer);

    let markerLostTimeout: NodeJS.Timeout | null = null;

    setTimeout(() => {
      const marker = document.querySelector("a-marker");
      const video = document.querySelector("#ar-video");

      if (marker && video) {
        videoRef.current = video as HTMLVideoElement;

        marker.addEventListener("markerFound", () => {
          console.log("🎯 Marker found!");

          if (markerLostTimeout) {
            clearTimeout(markerLostTimeout);
            markerLostTimeout = null;
          }

          setIsTracking(true);
          if ((video as HTMLVideoElement).paused) {
            (video as HTMLVideoElement)
              .play()
              .catch((e) => console.warn("Play error:", e));
          }
        });

        marker.addEventListener("markerLost", () => {
          console.log("👻 Marker lost!");

          markerLostTimeout = setTimeout(() => {
            setIsTracking(false);
            if (!(video as HTMLVideoElement).paused) {
              (video as HTMLVideoElement).pause();
            }
          }, 2000);
        });

        console.log("✅ AR scene ready");
      }

      setTimeout(() => {
        const arjsVideo = document.querySelector(
          "video[autoplay][playsinline]:not(#camera-fallback):not(#ar-video)"
        ) as HTMLVideoElement;
        if (arjsVideo) {
          arjsVideo.style.cssText =
            "position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important; z-index: 0 !important; display: block !important;";
          console.log("✅ AR.js webcam video styled");
        }

        const canvas = document.querySelector(
          "canvas.a-canvas"
        ) as HTMLCanvasElement;
        if (canvas) {
          canvas.style.cssText =
            "position: absolute !important; z-index: 1 !important; background: transparent !important;";
          console.log("✅ Canvas styled");
        }
      }, 1000);
    }, 1500);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleBack = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const videos = document.querySelectorAll("video");
    videos.forEach((vid) => {
      if (vid.srcObject) {
        const stream = vid.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    });

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
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="max-w-md w-full text-center text-white py-4 sm:py-0">
          <div className="mb-4 sm:mb-8">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl">
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

          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">
            🎥 AR Video Player
          </h1>
          <p className="text-sm sm:text-lg mb-4 sm:mb-8 opacity-90 px-2">
            Arahkan kamera ke marker HIRO untuk memutar video dalam Augmented
            Reality
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4 sm:mb-8 text-left mx-1 sm:mx-0">
            <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Info className="w-4 h-4 flex-shrink-0" />
              Tips untuk AR
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm opacity-90">
              <li>✅ Download marker HIRO dari link di bawah</li>
              <li>✅ Tampilkan marker di layar atau print</li>
              <li>✅ Pencahayaan harus terang & merata</li>
              <li>✅ Jarak ideal 30-50 cm dari kamera</li>
            </ul>
          </div>

          <button
            onClick={startAR}
            className="w-full py-3 sm:py-4 bg-white text-purple-600 rounded-xl font-bold text-base sm:text-lg transition hover:bg-gray-100 shadow-xl mb-3 sm:mb-4"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            Mulai AR Experience
          </button>

          <a
            href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm underline opacity-90 hover:opacity-100"
          >
            Download Marker HIRO →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      <style>{`
        * { box-sizing: border-box; }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          width: 100vw !important;
          height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
        }
        video {
          margin: 0 !important;
          margin-left: 0 !important;
          margin-top: 0 !important;
        }
        #arjs-video {
          width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
          object-fit: cover !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          z-index: -2 !important;
        }
      `}</style>

      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {state === "scanning" && !isTracking && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <div
            className="text-center text-white px-4"
            style={{ textShadow: "0 0 10px rgba(0,0,0,0.8)" }}
          >
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-4 sm:mb-6">
              <div className="absolute inset-0 border-2 border-dashed border-blue-500/50 rounded-2xl animate-pulse" />
              <div className="absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-blue-500" />
              <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-blue-500" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-blue-500" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-blue-500" />
            </div>
            <div className="flex items-center gap-2 justify-center text-sm sm:text-base">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-400" />
              <span className="font-medium">Scanning for HIRO marker...</span>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 p-3 sm:p-6 bg-gradient-to-b from-black/80 to-transparent z-20">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-[10px] sm:text-xs font-bold">
                AR
              </span>
            </div>
            <span className="font-bold text-sm sm:text-base">
              AR Video Player
            </span>
          </div>

          {isTracking && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-sm">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <span className="text-xs sm:text-sm font-medium">Playing</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition flex items-center justify-center"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {isTracking && (
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition flex items-center justify-center"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>
              )}

              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition flex items-center justify-center"
              >
                <Info className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showInfo && (
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-black/90 backdrop-blur-md sm:border-l border-white/10 p-4 sm:p-6 overflow-y-auto z-30">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              AR Video Player
            </h3>
            <button
              onClick={() => setShowInfo(false)}
              className="text-white hover:bg-white/10 p-1.5 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4 text-sm text-white">
            <div>
              <p className="text-white/50 mb-1 text-xs sm:text-sm">Status</p>
              <p className="text-sm">
                {isTracking ? "✅ Video Playing" : "🔍 Searching for marker..."}
              </p>
            </div>
            <div>
              <p className="text-white/50 mb-1 text-xs sm:text-sm">Video</p>
              <p className="text-sm">Big Buck Bunny (Demo)</p>
            </div>
            <div>
              <p className="text-white/50 mb-1 text-xs sm:text-sm">Audio</p>
              <p className="text-sm">{isMuted ? "🔇 Muted" : "🔊 Unmuted"}</p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 Video akan otomatis play saat marker HIRO terdeteksi
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
