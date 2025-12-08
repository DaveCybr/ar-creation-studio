// src/pages/Analytics.tsx
// Comprehensive analytics dashboard
import { useState } from "react";
import { motion } from "framer-motion";
import { GridBackground } from "@/components/GridBackground";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Clock,
  Globe,
  Smartphone,
  Download,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(187, 100%, 50%)",
  "hsl(270, 60%, 50%)",
  "hsl(215, 20%, 65%)",
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7days");

  // Mock data
  const stats = [
    {
      label: "Total Views",
      value: "45,231",
      change: "+12.5%",
      trend: "up",
      icon: Eye,
    },
    {
      label: "Unique Users",
      value: "12,847",
      change: "+8.2%",
      trend: "up",
      icon: Users,
    },
    {
      label: "Avg. Session",
      value: "2m 34s",
      change: "-3.1%",
      trend: "down",
      icon: Clock,
    },
    {
      label: "Active Projects",
      value: "24",
      change: "+4",
      trend: "up",
      icon: Globe,
    },
  ];

  const viewsData = [
    { date: "Mon", views: 1200, users: 850 },
    { date: "Tue", views: 1800, users: 1200 },
    { date: "Wed", views: 1600, users: 1100 },
    { date: "Thu", views: 2200, users: 1500 },
    { date: "Fri", views: 2800, users: 1900 },
    { date: "Sat", views: 3200, users: 2200 },
    { date: "Sun", views: 2400, users: 1700 },
  ];

  const deviceData = [
    { name: "iOS", value: 45 },
    { name: "Android", value: 38 },
    { name: "Other", value: 17 },
  ];

  const topProjects = [
    { name: "Product Launch AR", views: 8543, change: 15.2 },
    { name: "Museum Tour", views: 6721, change: 8.7 },
    { name: "Real Estate Demo", views: 5432, change: -2.3 },
    { name: "Fashion Catalog", views: 4321, change: 12.1 },
    { name: "Educational AR", views: 3210, change: 5.4 },
  ];

  const locationData = [
    { country: "Indonesia", views: 12543, percentage: 28 },
    { country: "United States", views: 9821, percentage: 22 },
    { country: "Singapore", views: 7654, percentage: 17 },
    { country: "Japan", views: 6543, percentage: 15 },
    { country: "Others", views: 8670, percentage: 18 },
  ];

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
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track your AR performance and user engagement
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px] glass border-border/50">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 border border-border/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Views Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl p-6 border border-border/50"
            >
              <h3 className="font-display font-semibold text-lg mb-6">
                Views & Users
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={viewsData}>
                    <defs>
                      <linearGradient
                        id="colorViews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(187, 100%, 50%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(187, 100%, 50%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorUsers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(270, 60%, 50%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(270, 60%, 50%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="hsl(187, 100%, 50%)"
                      fillOpacity={1}
                      fill="url(#colorViews)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(270, 60%, 50%)"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Device Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-xl p-6 border border-border/50"
            >
              <h3 className="font-display font-semibold text-lg mb-6">
                Device Distribution
              </h3>
              <div className="h-80 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Tables Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-xl p-6 border border-border/50"
            >
              <h3 className="font-display font-semibold text-lg mb-6">
                Top Performing Projects
              </h3>
              <div className="space-y-4">
                {topProjects.map((project, index) => (
                  <div
                    key={project.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.views.toLocaleString()} views
                        </p>
                      </div>
                    </div>
                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${
                        project.change > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {project.change > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(project.change)}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Geographic Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-xl p-6 border border-border/50"
            >
              <h3 className="font-display font-semibold text-lg mb-6">
                Geographic Distribution
              </h3>
              <div className="space-y-4">
                {locationData.map((location) => (
                  <div key={location.country} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{location.country}</span>
                      <span className="text-muted-foreground">
                        {location.views.toLocaleString()} views
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${location.percentage}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
