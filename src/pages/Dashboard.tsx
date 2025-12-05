import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GridBackground } from '@/components/GridBackground';
import { Navbar } from '@/components/Navbar';
import { ProjectCard } from '@/components/ProjectCard';
import { api, Project } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'view_count' | 'name'>('created_at');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  useEffect(() => {
    loadProjects();
  }, [sortBy, statusFilter]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.getProjects({
        sortBy,
        sortOrder: 'desc',
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setProjects(response.data.projects);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat proyek',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus proyek ini?')) return;
    
    try {
      await api.deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
      toast({
        title: 'Berhasil',
        description: 'Proyek telah dihapus',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus proyek',
        variant: 'destructive',
      });
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

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
              <h1 className="font-display text-3xl font-bold mb-1">Proyek Saya</h1>
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

              <div className="flex items-center gap-3">
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
                >
                  <SelectTrigger className="w-36 bg-muted/50 border-border/50">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as typeof sortBy)}
                >
                  <SelectTrigger className="w-40 bg-muted/50 border-border/50">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="created_at">Terbaru</SelectItem>
                    <SelectItem value="view_count">Views</SelectItem>
                    <SelectItem value="name">Nama</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center glass rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">
                {search ? 'Tidak ada hasil' : 'Belum ada proyek'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {search
                  ? 'Coba kata kunci lain'
                  : 'Mulai buat proyek AR pertama Anda'}
              </p>
              {!search && (
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
                viewMode === 'grid'
                  ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
