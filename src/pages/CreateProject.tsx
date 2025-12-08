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
import { Progress } from "@/components/ui/progress";
import { GridBackground } from "@/components/GridBackground";
import { Navbar } from "@/components/Navbar";
import { FileUploadWithPreview } from "@/components/FileUploadWithPreview";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Image, Video, Box } from "lucide-react";
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

type UploadStep =
  | "idle"
  | "uploading-target"
  | "uploading-content"
  | "creating";

export default function CreateProject() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState<UploadStep>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const getContentAccept = () => {
    switch (contentType) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "3d_model":
        return ".glb,.gltf";
      default:
        return "*";
    }
  };

  const getStepMessage = () => {
    switch (uploadStep) {
      case "uploading-target":
        return "Mengupload target image...";
      case "uploading-content":
        return "Mengupload content...";
      case "creating":
        return "Membuat proyek...";
      default:
        return "";
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
    setUploadProgress(0);

    try {
      // 1. Upload Target Image
      setUploadStep("uploading-target");
      setUploadProgress(10);

      const targetUrlRes = await api.getPresignedUrl(
        "target",
        targetImage.type,
        targetImage.size
      );

      setUploadProgress(20);
      await api.uploadFile(targetImage, targetUrlRes.data.uploadUrl);

      setUploadProgress(30);
      await api.confirmUpload(targetUrlRes.data.fileKey);

      setUploadProgress(40);

      // 2. Upload Content
      setUploadStep("uploading-content");

      const contentUrlRes = await api.getPresignedUrl(
        "content",
        contentFile.type,
        contentFile.size
      );

      setUploadProgress(50);
      await api.uploadFile(contentFile, contentUrlRes.data.uploadUrl);

      setUploadProgress(70);
      await api.confirmUpload(contentUrlRes.data.fileKey);

      setUploadProgress(80);

      // 3. Create Project
      setUploadStep("creating");

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

      setUploadProgress(100);

      toast({
        title: "Berhasil",
        description: "Proyek berhasil dibuat!",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Gagal membuat proyek",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadStep("idle");
      setUploadProgress(0);
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

            {/* Upload Progress */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4 mb-6 border border-primary/30"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    {getStepMessage()}
                  </span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </motion.div>
            )}

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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                <FileUploadWithPreview
                  accept="image/*"
                  label="Target Image *"
                  description="Gambar yang akan dikenali oleh kamera AR"
                  onFileSelect={setTargetImage}
                  maxSize={10}
                />

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
                        disabled={isLoading}
                        onClick={() => {
                          setContentType(type.value as typeof contentType);
                          setContentFile(null); // Reset file when changing type
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          contentType === type.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 hover:border-primary/50"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                <FileUploadWithPreview
                  accept={getContentAccept()}
                  label="Content File *"
                  description={`Konten ${contentType.replace(
                    "_",
                    " "
                  )} yang akan ditampilkan di AR`}
                  onFileSelect={setContentFile}
                  maxSize={contentType === "video" ? 100 : 50}
                />
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  disabled={isLoading || !targetImage || !contentFile}
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
