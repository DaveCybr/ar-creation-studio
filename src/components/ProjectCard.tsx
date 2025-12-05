import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Project } from '@/lib/api';
import { Eye, Video, Image, Box, QrCode, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardProps {
  project: Project;
  index: number;
  onDelete?: (id: string) => void;
}

const contentTypeIcons = {
  video: Video,
  image: Image,
  '3d_model': Box,
};

export function ProjectCard({ project, index, onDelete }: ProjectCardProps) {
  const ContentIcon = contentTypeIcons[project.contentType] || Box;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative glass rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(187_100%_50%/0.15)]"
    >
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden bg-muted">
        {project.targetImageUrl ? (
          <img
            src={project.targetImageUrl}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ContentIcon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status badge */}
        <Badge
          variant={project.status === 'active' ? 'default' : 'secondary'}
          className="absolute top-3 left-3"
        >
          {project.status}
        </Badge>

        {/* Actions */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-border/50">
              <DropdownMenuItem asChild>
                <Link to={`/projects/${project.id}/edit`}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(project.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <Link to={`/projects/${project.id}`} className="block p-4">
        <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {project.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <ContentIcon className="w-4 h-4" />
              {project.contentType.replace('_', ' ')}
            </span>
          </div>
          <Button variant="glow" size="sm" asChild>
            <Link to={`/projects/${project.id}/qr`}>
              <QrCode className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}
