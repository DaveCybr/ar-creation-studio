import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GridBackground } from "@/components/GridBackground";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Lock,
  Loader2,
  Shield,
  Database,
  Calendar,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const passwordSchema = z
  .object({
    oldPassword: z.string().min(6, "Password minimal 6 karakter"),
    newPassword: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitPassword = async (data: PasswordForm) => {
    setIsLoading(true);
    try {
      await api.changePassword(data.oldPassword, data.newPassword);
      toast({
        title: "Berhasil",
        description: "Password telah diubah",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Gagal mengubah password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
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

  return (
    <div className="min-h-screen relative">
      <GridBackground />
      <Navbar />

      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-3xl font-bold mb-2">
              Profil Saya
            </h1>
            <p className="text-muted-foreground mb-8">
              Kelola informasi akun dan keamanan Anda
            </p>

            <Tabs defaultValue="account" className="space-y-6">
              <TabsList className="glass border border-border/50">
                <TabsTrigger value="account">Akun</TabsTrigger>
                <TabsTrigger value="security">Keamanan</TabsTrigger>
                <TabsTrigger value="usage">Penggunaan</TabsTrigger>
              </TabsList>

              {/* Account Tab */}
              <TabsContent value="account">
                <div className="glass rounded-xl p-6 border border-border/50 space-y-6">
                  <div>
                    <h2 className="font-display font-semibold text-lg mb-4">
                      Informasi Akun
                    </h2>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nama Lengkap</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            value={user.full_name}
                            disabled
                            className="pl-10 bg-muted/50 border-border/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            value={user.email}
                            disabled
                            className="pl-10 bg-muted/50 border-border/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Tanggal Bergabung</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            value={new Date(user.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                            disabled
                            className="pl-10 bg-muted/50 border-border/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <div className="glass rounded-xl p-6 border border-border/50 space-y-6">
                  <div>
                    <h2 className="font-display font-semibold text-lg mb-4">
                      Ubah Password
                    </h2>

                    <form
                      onSubmit={handleSubmit(onSubmitPassword)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="oldPassword">Password Lama</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="oldPassword"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 bg-muted/50 border-border/50"
                            {...register("oldPassword")}
                          />
                        </div>
                        {errors.oldPassword && (
                          <p className="text-sm text-destructive">
                            {errors.oldPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Password Baru</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 bg-muted/50 border-border/50"
                            {...register("newPassword")}
                          />
                        </div>
                        {errors.newPassword && (
                          <p className="text-sm text-destructive">
                            {errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Konfirmasi Password Baru
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 bg-muted/50 border-border/50"
                            {...register("confirmPassword")}
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-sm text-destructive">
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <Button type="submit" variant="hero" disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Ubah Password
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              </TabsContent>

              {/* Usage Tab */}
              <TabsContent value="usage">
                <div className="glass rounded-xl p-6 border border-border/50 space-y-6">
                  <div>
                    <h2 className="font-display font-semibold text-lg mb-4">
                      Penggunaan
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Database className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Storage</p>
                            <p className="text-sm text-muted-foreground">
                              {user.storage_used || "0 MB"} /{" "}
                              {user.storage_limit || "1 GB"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-display font-bold text-primary">
                            {(
                              (parseFloat(user.storage_used || "0") /
                                parseFloat(user.storage_limit || "1000")) *
                              100
                            ).toFixed(0)}
                            %
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-secondary" />
                          <div>
                            <p className="font-medium">Paket</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {user.plan_type || "Starter"}
                            </p>
                          </div>
                        </div>
                        <Button variant="glow" size="sm">
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
