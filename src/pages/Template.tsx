// src/pages/Templates.tsx
// Pre-made AR templates for quick start
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GridBackground } from "@/components/GridBackground";
import { Navbar } from "@/components/Navbar";
import {
  Search,
  Sparkles,
  ShoppingBag,
  GraduationCap,
  Building2,
  Palette,
  Zap,
  Star,
  Play,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  thumbnail: string;
  features: string[];
  isPopular: boolean;
  isPremium: boolean;
}

export default function Templates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const categories = [
    { id: "all", label: "All Templates", icon: Sparkles },
    { id: "product", label: "Product Showcase", icon: ShoppingBag },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "realestate", label: "Real Estate", icon: Building2 },
    { id: "art", label: "Art & Gallery", icon: Palette },
  ];

  const templates: Template[] = [
    {
      id: "1",
      name: "Product 360° View",
      description: "Interactive 360-degree product showcase with hotspots",
      category: "product",
      icon: ShoppingBag,
      thumbnail: "",
      features: [
        "360° rotation",
        "Zoom controls",
        "Info hotspots",
        "Multi-variant support",
      ],
      isPopular: true,
      isPremium: false,
    },
    {
      id: "2",
      name: "Educational AR Cards",
      description: "Interactive learning cards with 3D models and animations",
      category: "education",
      icon: GraduationCap,
      thumbnail: "",
      features: [
        "3D models",
        "Audio narration",
        "Quiz integration",
        "Progress tracking",
      ],
      isPopular: true,
      isPremium: false,
    },
    {
      id: "3",
      name: "Virtual Property Tour",
      description: "Immersive real estate viewing with floor plans",
      category: "realestate",
      icon: Building2,
      thumbnail: "",
      features: [
        "Floor plan overlay",
        "Room measurements",
        "Virtual staging",
        "Photo gallery",
      ],
      isPopular: false,
      isPremium: true,
    },
    {
      id: "4",
      name: "Art Gallery Experience",
      description: "Digital art exhibition with artist information",
      category: "art",
      icon: Palette,
      thumbnail: "",
      features: [
        "Artwork details",
        "Artist bio",
        "Audio guide",
        "Virtual exhibition",
      ],
      isPopular: false,
      isPremium: false,
    },
    {
      id: "5",
      name: "Quick Start Basic",
      description: "Simple AR experience for beginners",
      category: "product",
      icon: Zap,
      thumbnail: "",
      features: [
        "Easy setup",
        "Basic controls",
        "Image/video support",
        "Quick deploy",
      ],
      isPopular: true,
      isPremium: false,
    },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const confirmUseTemplate = () => {
    navigate("/projects/new", { state: { templateId: selectedTemplate?.id } });
  };

  return (
    <div className="min-h-screen relative">
      <GridBackground />
      <Navbar />

      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Start with a Template
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold mb-4">
              AR Experience Templates
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose from our collection of pre-built templates and customize
              them for your needs
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 glass border-border/50 text-lg"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.id)}
                  className="glass"
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="group glass rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_hsl(187_100%_50%/0.15)]"
              >
                {/* Thumbnail */}
                <div className="aspect-video relative bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                  <template.icon className="w-16 h-16 text-primary/30" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {template.isPopular && (
                      <Badge className="bg-primary/90 text-primary-foreground">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Popular
                      </Badge>
                    )}
                    {template.isPremium && (
                      <Badge variant="secondary" className="bg-secondary/90">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                  </div>

                  {/* Preview Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Button variant="glass" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Features:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                      {template.features.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground">
                          +{template.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="glow"
                    className="w-full"
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use Template
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">
                No templates found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      {/* Template Preview Dialog */}
      <Dialog
        open={!!selectedTemplate}
        onOpenChange={() => setSelectedTemplate(null)}
      >
        <DialogContent className="glass border-border/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedTemplate && (
                <>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <selectedTemplate.icon className="w-5 h-5 text-primary" />
                  </div>
                  {selectedTemplate.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              {/* Features List */}
              <div>
                <h4 className="font-semibold mb-3">Included Features:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTemplate.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-3 h-3 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
                <selectedTemplate.icon className="w-24 h-24 text-primary/30" />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={confirmUseTemplate}>
              Use This Template
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
