import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GridBackground } from "@/components/GridBackground";
import { Navbar } from "@/components/Navbar";
import { QRCodeCard } from "@/components/QrCodeCard";
import { api, Project, ProjectAnalytics } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Pencil,
  Eye,
  Video,
  Image,
  Box,
  Loader2,
  TrendingUp,
  Users,
  Clock,
  Smartphone,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const contentTypeIcons = {
  video: Video,
  image: Image,
  "3d_model": Box,
};

const COLORS = [
  "hsl(187, 100%, 50%)",
  "hsl(270, 60%, 50%)",
  "hsl(215, 20%, 65%)",
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const [projectRes, analyticsRes] = await Promise.all([
        api.getProject(id!),
        api.getProjectAnalytics(id!),
      ]);
      setProject(projectRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat proyek",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const ContentIcon = contentTypeIcons[project.contentType] || Box;

  const deviceData = analytics
    ? [
        { name: "iOS", value: analytics.deviceBreakdown?.ios || 0 },
        { name: "Android", value: analytics.deviceBreakdown?.android || 0 },
        { name: "Other", value: analytics.deviceBreakdown?.other || 0 },
      ]
    : [];

  return (
    <div className="min-h-screen relative">
      <GridBackground />
      <Navbar />

      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto">
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass rounded-2xl overflow-hidden border border-border/50"
              >
                {/* Target Image */}
                <div className="aspect-video relative bg-muted">
                  {project.targetImageUrl ? (
                    <img
                      src={project.targetImageUrl}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ContentIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <Badge
                    variant={
                      project.status === "active" ? "default" : "secondary"
                    }
                    className="absolute top-4 left-4"
                  >
                    {project.status}
                  </Badge>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h1 className="font-display text-2xl font-bold mb-2">
                        {project.name}
                      </h1>
                      {project.description && (
                        <p className="text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <Button variant="glow" asChild>
                      <Link to={`/projects/${project.id}/edit`}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {(project.viewCount || 0).toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ContentIcon className="w-4 h-4" />
                      {project.contentType.replace("_", " ")}
                    </span>
                    <span>Tracking: {project.trackingQuality}</span>
                    {project.autoPlay && (
                      <Badge variant="outline">Auto Play</Badge>
                    )}
                    {project.loopContent && (
                      <Badge variant="outline">Loop</Badge>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Analytics */}
              {analytics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="space-y-6"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Total Views",
                        value: analytics?.totalViews || 0,
                        icon: TrendingUp,
                      },
                      {
                        label: "Unique Users",
                        value: analytics?.uniqueUsers || 0,
                        icon: Users,
                      },
                      {
                        label: "Avg Duration",
                        value: analytics?.avgSessionDuration
                          ? `${Math.round(analytics.avgSessionDuration)}s`
                          : "0s",
                        icon: Clock,
                      },
                      {
                        label: "Devices",
                        value: analytics?.deviceBreakdown
                          ? Object.values(analytics.deviceBreakdown).reduce(
                              (a, b) => a + b,
                              0
                            )
                          : 0,
                        icon: Smartphone,
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="glass rounded-xl p-4 border border-border/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {stat.label}
                          </span>
                        </div>
                        <p className="font-display text-2xl font-bold">
                          {typeof stat.value === "number"
                            ? stat.value.toLocaleString()
                            : stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Views Chart */}
                    <div className="glass rounded-xl p-6 border border-border/50">
                      <h3 className="font-display font-semibold mb-4">
                        Views Over Time
                      </h3>
                      <div className="h-64">
                        {analytics?.dailyViews &&
                        analytics.dailyViews.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.dailyViews}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                              />
                              <XAxis
                                dataKey="date"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                              />
                              <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="views"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <p className="text-sm">No data available yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Device Chart */}
                    <div className="glass rounded-xl p-6 border border-border/50">
                      <h3 className="font-display font-semibold mb-4">
                        Device Breakdown
                      </h3>
                      <div className="h-64">
                        {deviceData.length > 0 &&
                        deviceData.some((d) => d.value > 0) ? (
                          <>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={deviceData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {deviceData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    background: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-6 mt-4">
                              {deviceData.map((entry, index) => (
                                <div
                                  key={entry.name}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ background: COLORS[index] }}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {entry.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <p className="text-sm">No device data yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* QR Code */}
              <QRCodeCard
                url={project.qrCode.url}
                shortCode={project.qrCode.shortCode}
                projectName={project.name}
              />

              {/* Settings */}
              <div className="glass rounded-xl p-6 border border-border/50">
                <h3 className="font-display font-semibold mb-4">Settings</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tracking Quality
                    </span>
                    <span className="capitalize">
                      {project.trackingQuality}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auto Play</span>
                    <span>{project.autoPlay ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loop Content</span>
                    <span>{project.loopContent ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
