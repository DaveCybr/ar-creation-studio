import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GridBackground } from "@/components/GridBackground";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Upload,
  Image,
  Video,
  Box,
  Loader2,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const projectSchema = z.object({
  name: z.string().min(1, "Nama proyek wajib diisi"),
  description: z.string().optional(),
  trackingQuality: z.enum(["low", "medium", "high"]),
  autoPlay: z.boolean(),
  loopContent: z.boolean(),
});

type ProjectForm = z.infer<typeof projectSchema>;

export default function CreateProject() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [targetImage, setTargetImage] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<
    "image" | "video" | "3d_model"
  >("video");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      trackingQuality: "medium",
      autoPlay: true,
      loopContent: true,
    },
  });

  const autoPlay = watch("autoPlay");
  const loopContent = watch("loopContent");
  const trackingQuality = watch("trackingQuality");

  const handleTargetImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTargetImage(file);
    }
  };

  const handleContentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContentFile(file);
    }
  };

  const onSubmit = async (data: ProjectForm) => {
    if (!targetImage || !contentFile) {
      toast({
        title: "Error",
        description: "Target image dan content wajib diupload",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get presigned URL for target image
      console.log("📤 Getting presigned URL for target image...");
      const targetUrlRes = await api.getPresignedUrl(
        "target",
        targetImage.type,
        targetImage.size
      );
      console.log("✅ Target presigned URL:", targetUrlRes.data);

      // 2. Upload target image dengan FormData
      console.log("📤 Uploading target image...");
      await api.uploadFile(targetImage, targetUrlRes.data.uploadUrl);
      console.log("✅ Target image uploaded");

      // 3. Confirm target upload
      console.log("✅ Confirming target upload...");
      await api.confirmUpload(targetUrlRes.data.fileKey);
      console.log("✅ Target upload confirmed");

      // 4. Get presigned URL for content
      console.log("📤 Getting presigned URL for content...");
      const contentUrlRes = await api.getPresignedUrl(
        "content",
        contentFile.type,
        contentFile.size
      );
      console.log("✅ Content presigned URL:", contentUrlRes.data);

      // 5. Upload content dengan FormData
      console.log("📤 Uploading content...");
      await api.uploadFile(contentFile, contentUrlRes.data.uploadUrl);
      console.log("✅ Content uploaded");

      // 6. Confirm content upload
      console.log("✅ Confirming content upload...");
      await api.confirmUpload(contentUrlRes.data.fileKey);
      console.log("✅ Content upload confirmed");

      // 7. Create project
      console.log("📝 Creating project...");
      await api.createProject({
        name: data.name,
        description: data.description,
        targetImageKey: targetUrlRes.data.fileKey,
        targetImageSize: targetImage.size,
        contentKey: contentUrlRes.data.fileKey,
        contentType,
        contentSize: contentFile.size,
        contentMimeType: contentFile.type,
        trackingQuality: data.trackingQuality,
        autoPlay: data.autoPlay,
        loopContent: data.loopContent,
      });
      console.log("✅ Project created");

      toast({
        title: "Berhasil",
        description: "Proyek berhasil dibuat!",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Gagal membuat proyek",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <GridBackground />
      <Navbar />

      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-3xl font-bold mb-2">
              Buat Proyek Baru
            </h1>
            <p className="text-muted-foreground mb-8">
              Upload target image dan konten AR Anda
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Info */}
              <div className="glass rounded-xl p-6 border border-border/50 space-y-6">
                <h2 className="font-display font-semibold text-lg">
                  Informasi Dasar
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="name">Nama Proyek *</Label>
                  <Input
                    id="name"
                    placeholder="Masukkan nama proyek"
                    className="bg-muted/50 border-border/50"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    placeholder="Deskripsi proyek (opsional)"
                    className="bg-muted/50 border-border/50 min-h-24"
                    {...register("description")}
                  />
                </div>
              </div>

              {/* Upload Files */}
              <div className="glass rounded-xl p-6 border border-border/50 space-y-6">
                <h2 className="font-display font-semibold text-lg">
                  Upload Files
                </h2>

                {/* Target Image */}
                <div className="space-y-2">
                  <Label>Target Image *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Gambar yang akan dikenali oleh kamera AR
                  </p>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleTargetImageChange}
                    />
                    {targetImage ? (
                      <div className="flex items-center gap-3">
                        <Check className="w-6 h-6 text-primary" />
                        <span className="text-sm">{targetImage.name}</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click untuk upload target image
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Content Type */}
                <div className="space-y-2">
                  <Label>Tipe Konten</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "image", icon: Image, label: "Image" },
                      { value: "video", icon: Video, label: "Video" },
                      { value: "3d_model", icon: Box, label: "3D Model" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setContentType(type.value as typeof contentType)
                        }
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          contentType === type.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 hover:border-primary/50"
                        }`}
                      >
                        <type.icon className="w-6 h-6" />
                        <span className="text-sm font-medium">
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content File */}
                <div className="space-y-2">
                  <Label>Content File *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Konten yang akan ditampilkan di AR
                  </p>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                    <input
                      type="file"
                      accept={
                        contentType === "image"
                          ? "image/*"
                          : contentType === "video"
                          ? "video/*"
                          : ".glb,.gltf"
                      }
                      className="hidden"
                      onChange={handleContentFileChange}
                    />
                    {contentFile ? (
                      <div className="flex items-center gap-3">
                        <Check className="w-6 h-6 text-primary" />
                        <span className="text-sm">{contentFile.name}</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click untuk upload {contentType.replace("_", " ")}
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Settings */}
              <div className="glass rounded-xl p-6 border border-border/50 space-y-6">
                <h2 className="font-display font-semibold text-lg">
                  Pengaturan
                </h2>

                <div className="space-y-2">
                  <Label>Kualitas Tracking</Label>
                  <Select
                    value={trackingQuality}
                    onValueChange={(v) =>
                      setValue(
                        "trackingQuality",
                        v as "low" | "medium" | "high"
                      )
                    }
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-border/50">
                      <SelectItem value="low">Low - Performa tinggi</SelectItem>
                      <SelectItem value="medium">Medium - Seimbang</SelectItem>
                      <SelectItem value="high">
                        High - Akurasi tinggi
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Play</Label>
                    <p className="text-sm text-muted-foreground">
                      Putar konten otomatis saat terdeteksi
                    </p>
                  </div>
                  <Switch
                    checked={autoPlay}
                    onCheckedChange={(checked) => setValue("autoPlay", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Loop Content</Label>
                    <p className="text-sm text-muted-foreground">
                      Ulangi konten secara terus menerus
                    </p>
                  </div>
                  <Switch
                    checked={loopContent}
                    onCheckedChange={(checked) =>
                      setValue("loopContent", checked)
                    }
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="glass"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate("/dashboard")}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Buat Proyek"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
