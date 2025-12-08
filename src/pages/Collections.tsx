// src/pages/Collections.tsx
// Organize multiple AR projects into collections/galleries
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GridBackground } from "@/components/GridBackground";
import { Navbar } from "@/components/Navbar";
import {
  Plus,
  FolderOpen,
  Image as ImageIcon,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Collection {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  projectCount: number;
  viewCount: number;
  isPublic: boolean;
  createdAt: string;
}

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "1",
      name: "Product Catalog 2024",
      description: "AR experience untuk product launch Q1",
      projectCount: 12,
      viewCount: 1543,
      isPublic: true,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Museum Exhibition",
      description: "Interactive AR untuk museum displays",
      projectCount: 8,
      viewCount: 892,
      isPublic: false,
      createdAt: "2024-02-20",
    },
  ]);

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
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="font-display text-3xl font-bold mb-1">
                Collections
              </h1>
              <p className="text-muted-foreground">
                Organize your AR projects into themed collections
              </p>
            </div>
            <Button variant="hero">
              <Plus className="w-5 h-5 mr-2" />
              New Collection
            </Button>
          </motion.div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group glass rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_hsl(187_100%_50%/0.15)]"
              >
                {/* Thumbnail */}
                <div className="aspect-video relative bg-muted overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Layers className="w-16 h-16 text-white/50" />
                  </div>

                  {/* Actions */}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="glass"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="glass border-border/50"
                      >
                        <DropdownMenuItem>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Public Page
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Project Count Badge */}
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white text-sm font-medium">
                    {collection.projectCount} projects
                  </div>
                </div>

                {/* Content */}
                <Link
                  to={`/collections/${collection.id}`}
                  className="block p-4"
                >
                  <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {collection.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {collection.viewCount.toLocaleString()} views
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        collection.isPublic
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {collection.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Create New Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: collections.length * 0.1 }}
              className="group aspect-video glass rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_hsl(187_100%_50%/0.1)] flex flex-col items-center justify-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium mb-1">Create Collection</p>
                <p className="text-sm text-muted-foreground">
                  Organize your AR projects
                </p>
              </div>
            </motion.button>
          </div>

          {/* Empty State */}
          {collections.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">
                No Collections Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first collection to organize AR projects
              </p>
              <Button variant="hero">
                <Plus className="w-5 h-5 mr-2" />
                Create Collection
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
