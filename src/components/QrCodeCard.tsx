// src/components/QRCodeCard.tsx
import { useRef } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy, Download, ExternalLink, Share2 } from "lucide-react";

interface QRCodeCardProps {
  url: string;
  shortCode: string;
  projectName: string;
}

export function QRCodeCard({ url, shortCode, projectName }: QRCodeCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const copyShortCode = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Berhasil",
      description: "Link telah disalin ke clipboard",
    });
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    // Convert SVG to canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${projectName
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase()}_qr.png`;
          link.click();
          URL.revokeObjectURL(url);

          toast({
            title: "Berhasil",
            description: "QR Code telah diunduh",
          });
        }
      });
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: projectName,
          text: `Check out my AR project: ${projectName}`,
          url: url,
        });
        toast({
          title: "Berhasil",
          description: "Link telah dibagikan",
        });
      } catch (error) {
        // User cancelled or share failed
        console.log("Share cancelled");
      }
    } else {
      // Fallback to copy
      copyShortCode();
    }
  };

  return (
    <div className="glass rounded-xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold">QR Code</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={shareQRCode}
          className="h-8 w-8"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {/* QR Code Display */}
      <div
        ref={qrRef}
        className="w-full aspect-square max-w-[240px] mx-auto mb-4 bg-white p-4 rounded-xl"
      >
        <QRCode
          value={url}
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox={`0 0 256 256`}
          level="H"
        />
      </div>

      {/* Short Code */}
      <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/30">
        <p className="text-xs text-muted-foreground mb-1">Short Link:</p>
        <p className="font-mono text-sm text-foreground break-all">{url}</p>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button variant="glow" className="flex-1" onClick={copyShortCode}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="glass" size="icon" onClick={downloadQRCode}>
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Buka AR Experience
          </a>
        </Button>
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          Scan QR code ini dengan smartphone untuk melihat AR experience
        </p>
      </div>
    </div>
  );
}
