// src/components/AdvancedFilters.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal, X } from "lucide-react";

interface FilterState {
  status: string[];
  contentType: string[];
  trackingQuality: string[];
  dateRange: "all" | "7days" | "30days" | "90days";
  minViews: string;
  maxViews: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (
    key: "status" | "contentType" | "trackingQuality",
    value: string
  ) => {
    setLocalFilters((prev) => {
      const current = prev[key];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      status: [],
      contentType: [],
      trackingQuality: [],
      dateRange: "all",
      minViews: "",
      maxViews: "",
    };
    setLocalFilters(defaultFilters);
    onReset();
  };

  const activeFiltersCount =
    localFilters.status.length +
    localFilters.contentType.length +
    localFilters.trackingQuality.length +
    (localFilters.dateRange !== "all" ? 1 : 0) +
    (localFilters.minViews ? 1 : 0) +
    (localFilters.maxViews ? 1 : 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filter
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="glass border-border/50 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Lanjutan</SheetTitle>
          <SheetDescription>
            Atur filter untuk menemukan proyek yang Anda cari
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Status */}
          <div className="space-y-3">
            <Label className="text-base">Status</Label>
            <div className="space-y-2">
              {[
                { value: "active", label: "Active" },
                { value: "disabled", label: "Disabled" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={localFilters.status.includes(option.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("status", option.value)
                    }
                  />
                  <label
                    htmlFor={`status-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Content Type */}
          <div className="space-y-3">
            <Label className="text-base">Tipe Konten</Label>
            <div className="space-y-2">
              {[
                { value: "image", label: "Image" },
                { value: "video", label: "Video" },
                { value: "3d_model", label: "3D Model" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`content-${option.value}`}
                    checked={localFilters.contentType.includes(option.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("contentType", option.value)
                    }
                  />
                  <label
                    htmlFor={`content-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Quality */}
          <div className="space-y-3">
            <Label className="text-base">Kualitas Tracking</Label>
            <div className="space-y-2">
              {[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tracking-${option.value}`}
                    checked={localFilters.trackingQuality.includes(
                      option.value
                    )}
                    onCheckedChange={() =>
                      toggleArrayFilter("trackingQuality", option.value)
                    }
                  />
                  <label
                    htmlFor={`tracking-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label htmlFor="dateRange" className="text-base">
              Periode
            </Label>
            <Select
              value={localFilters.dateRange}
              onValueChange={(value) => updateFilter("dateRange", value)}
            >
              <SelectTrigger id="dateRange" className="bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-border/50">
                <SelectItem value="all">Semua Waktu</SelectItem>
                <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                <SelectItem value="90days">90 Hari Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Views Range */}
          <div className="space-y-3">
            <Label className="text-base">Jumlah Views</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="minViews"
                  className="text-xs text-muted-foreground"
                >
                  Minimal
                </Label>
                <Input
                  id="minViews"
                  type="number"
                  placeholder="0"
                  value={localFilters.minViews}
                  onChange={(e) => updateFilter("minViews", e.target.value)}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="maxViews"
                  className="text-xs text-muted-foreground"
                >
                  Maksimal
                </Label>
                <Input
                  id="maxViews"
                  type="number"
                  placeholder="∞"
                  value={localFilters.maxViews}
                  onChange={(e) => updateFilter("maxViews", e.target.value)}
                  className="bg-muted/50"
                />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <SheetClose asChild>
            <Button
              variant="hero"
              onClick={handleApply}
              className="w-full sm:w-auto"
            >
              Terapkan Filter
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
