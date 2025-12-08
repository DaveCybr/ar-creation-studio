import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { api, Project } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
  status: z.enum(["active", "disabled"]),
});

type ProjectForm = z.infer<typeof projectSchema>;

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
  });

  const autoPlay = watch("autoPlay");
  const loopContent = watch("loopContent");
  const trackingQuality = watch("trackingQuality");
  const status = watch("status");

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const response = await api.getProject(id!);
      const proj = response.data;
      setProject(proj);

      // Set form values
      setValue("name", proj.name);
      setValue("description", proj.description || "");
      setValue("trackingQuality", proj.trackingQuality);
      setValue("autoPlay", proj.autoPlay);
      setValue("loopContent", proj.loopContent);
      setValue("status", proj.status);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat proyek",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProjectForm) => {
    if (!id) return;

    setIsSaving(true);
    try {
      await api.updateProject(id, {
        name: data.name,
        description: data.description,
        trackingQuality: data.trackingQuality,
        autoPlay: data.autoPlay,
        loopContent: data.loopContent,
        status: data.status,
      });

      toast({
        title: "Berhasil",
        description: "Proyek telah diperbarui",
      });
      navigate(`/projects/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Gagal memperbarui proyek",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <GridBackground />
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen relative">
        <GridBackground />
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32">
          <p className="text-muted-foreground mb-4">Proyek tidak ditemukan</p>
          <Button variant="glass" asChild>
            <Link to="/dashboard">Kembali ke Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

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
              <Link to={`/projects/${id}`}>
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
              Edit Proyek
            </h1>
            <p className="text-muted-foreground mb-8">
              Perbarui informasi dan pengaturan proyek Anda
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

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) =>
                      setValue("status", v as "active" | "disabled")
                    }
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-border/50">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Status "Disabled" akan menonaktifkan proyek ini dari publik
                  </p>
                </div>
              </div>

              {/* Settings */}
              <div className="glass rounded-xl p-6 border border-border/50 space-y-6">
                <h2 className="font-display font-semibold text-lg">
                  Pengaturan AR
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

              {/* Preview Info */}
              <div className="glass rounded-xl p-6 border border-border/50">
                <h3 className="font-display font-semibold mb-4">
                  Konten Proyek
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipe Konten</span>
                    <span className="capitalize">
                      {project.contentType.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Views</span>
                    <span>{project.viewCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dibuat</span>
                    <span>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * Target image dan content file tidak dapat diubah. Buat
                  proyek baru untuk menggunakan file yang berbeda.
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="glass"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate(`/projects/${id}`)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Perubahan
                    </>
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
