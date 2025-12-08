import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GridBackground } from "@/components/GridBackground";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { DeleteProjectDialog } from "@/components/DeleteProjectDialog";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { api, Project } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  FolderOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterState {
  status: string[];
  contentType: string[];
  trackingQuality: string[];
  dateRange: "all" | "7days" | "30days" | "90days";
  minViews: string;
  maxViews: string;
}

const defaultFilters: FilterState = {
  status: [],
  contentType: [],
  trackingQuality: [],
  dateRange: "all",
  minViews: "",
  maxViews: "",
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "view_count" | "name">(
    "created_at"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "disabled"
  >("all");
  const [advancedFilters, setAdvancedFilters] =
    useState<FilterState>(defaultFilters);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    projectId: string;
    projectName: string;
  } | null>(null);

  useEffect(() => {
    loadProjects();
  }, [sortBy, statusFilter]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.getProjects({
        sortBy,
        sortOrder: "desc",
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setProjects(response.data.projects);
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

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({
      isOpen: true,
      projectId: id,
      projectName: name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog) return;

    try {
      await api.deleteProject(deleteDialog.projectId);
      setProjects(projects.filter((p) => p.id !== deleteDialog.projectId));
      toast({
        title: "Berhasil",
        description: "Proyek telah dihapus",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus proyek",
        variant: "destructive",
      });
      throw error; // Re-throw untuk handle di dialog
    }
  };

  const applyAdvancedFilters = (filters: FilterState) => {
    setAdvancedFilters(filters);
    // Implement filter logic here or pass to API
  };

  const resetAdvancedFilters = () => {
    setAdvancedFilters(defaultFilters);
  };

  // Apply filters
  const filteredProjects = projects.filter((project) => {
    // Search filter
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description?.toLowerCase().includes(search.toLowerCase());

    // Advanced filters
    const matchesStatus =
      advancedFilters.status.length === 0 ||
      advancedFilters.status.includes(project.status);

    const matchesContentType =
      advancedFilters.contentType.length === 0 ||
      advancedFilters.contentType.includes(project.contentType);

    const matchesTracking =
      advancedFilters.trackingQuality.length === 0 ||
      advancedFilters.trackingQuality.includes(project.trackingQuality);

    const matchesViews =
      (!advancedFilters.minViews ||
        project.viewCount >= parseInt(advancedFilters.minViews)) &&
      (!advancedFilters.maxViews ||
        project.viewCount <= parseInt(advancedFilters.maxViews));

    return (
      matchesSearch &&
      matchesStatus &&
      matchesContentType &&
      matchesTracking &&
      matchesViews
    );
  });

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <GridBackground />
        <Navbar />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <GridBackground />
      <Navbar />

      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="font-display text-3xl font-bold mb-1">
                Proyek Saya
              </h1>
              <p className="text-muted-foreground">
                Kelola semua proyek AR Anda di sini
              </p>
            </div>
            <Button variant="hero" asChild>
              <Link to="/projects/new">
                <Plus className="w-5 h-5 mr-2" />
                Proyek Baru
              </Link>
            </Button>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-xl p-4 mb-8 border border-border/50"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Cari proyek..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(v as typeof statusFilter)
                  }
                >
                  <SelectTrigger className="w-full sm:w-36 bg-muted/50 border-border/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border">
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as typeof sortBy)}
                >
                  <SelectTrigger className="w-full sm:w-40 bg-muted/50 border-border/50">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border">
                    <SelectItem value="created_at">Terbaru</SelectItem>
                    <SelectItem value="view_count">Views</SelectItem>
                    <SelectItem value="name">Nama</SelectItem>
                  </SelectContent>
                </Select>

                <AdvancedFilters
                  filters={advancedFilters}
                  onFiltersChange={applyAdvancedFilters}
                  onReset={resetAdvancedFilters}
                />

                <div className="flex items-center justify-center glass rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">
                {search || advancedFilters.status.length > 0
                  ? "Tidak ada hasil"
                  : "Belum ada proyek"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {search || advancedFilters.status.length > 0
                  ? "Coba ubah filter pencarian Anda"
                  : "Mulai buat proyek AR pertama Anda"}
              </p>
              {!search && advancedFilters.status.length === 0 && (
                <Button variant="hero" asChild>
                  <Link to="/projects/new">
                    <Plus className="w-5 h-5 mr-2" />
                    Buat Proyek
                  </Link>
                </Button>
              )}
            </motion.div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  : "space-y-4"
              }
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onDelete={() => handleDeleteClick(project.id, project.name)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteDialog && (
        <DeleteProjectDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog(null)}
          onConfirm={handleDeleteConfirm}
          projectName={deleteDialog.projectName}
        />
      )}
    </div>
  );
}
