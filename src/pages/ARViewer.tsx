import { useEffect } from "react";

export default function ARViewer() {
  useEffect(() => {
    // Hide any app chrome when viewing AR
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black">
      <iframe
        src="/src/pages/index.html"
        className="w-full h-full border-0"
        allow="camera; microphone; accelerometer; gyroscope"
        allowFullScreen
        title="AR Video Player"
      />
    </div>
  );
}
