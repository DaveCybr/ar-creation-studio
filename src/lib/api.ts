const BASE_URL = "https://ar-backend-production-0c8c.up.railway.app/api/v1";
const BACKEND_BASE = "https://ar-backend-production-0c8c.up.railway.app";

// Helper function to convert relative URLs to absolute
function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url; // Already absolute
  }

  // In production, always use backend URL
  // In development, use relative URL (will be proxied by Vite)
  const isProduction = import.meta.env.PROD;

  if (isProduction) {
    return `${BACKEND_BASE}${url}`;
  }

  return url; // Use relative URL in dev (proxied)
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  plan_type?: string;
  storage_used?: string;
  storage_limit?: string;
  project_limit?: number;
  is_verified?: boolean;
  created_at: string;
  last_login?: string;
}

// Backend response structure
interface BackendProject {
  id: string;
  userId: string;
  name: string;
  description: string;
  targetImage: {
    url: string;
    key: string;
    hash: string;
    size: number;
    width: number | null;
    height: number | null;
  };
  content: {
    url: string;
    key: string;
    type: "image" | "video" | "3d_model";
    size: number;
    mimeType: string;
    duration: number | null;
    thumbnailUrl: string | null;
  };
  settings: {
    trackingQuality: "low" | "medium" | "high";
    autoPlay: boolean;
    loopContent: boolean;
    contentScale: number;
  };
  qrCode: {
    url: string;
    shortCode: string;
    shortUrl: string;
  };
  stats: {
    viewCount: number;
    scanCount: number;
    uniqueViewers: number;
  };
  status: "active" | "disabled";
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  lastViewedAt: string | null;
  expiresAt: string | null;
}

// Frontend-friendly structure
interface Project {
  id: string;
  name: string;
  description: string;
  targetImageUrl: string;
  contentUrl: string;
  contentType: "image" | "video" | "3d_model";
  status: "active" | "disabled";
  viewCount: number;
  qrCode: {
    shortCode: string;
    url: string;
  };
  trackingQuality: "low" | "medium" | "high";
  autoPlay: boolean;
  loopContent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectAnalytics {
  totalViews: number;
  uniqueUsers: number;
  avgSessionDuration: number;
  deviceBreakdown: {
    ios: number;
    android: number;
    other: number;
  };
  dailyViews: Array<{
    date: string;
    views: number;
  }>;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

interface UploadFileResponse {
  fileKey: string;
  fileUrl: string;
  uploaded: boolean;
}

interface ConfirmUploadResponse {
  fileKey: string;
  fileUrl: string;
  verified: boolean;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem("accessToken");
    this.refreshToken = localStorage.getItem("refreshToken");
  }

  // Transform backend project to frontend format
  private transformProject(backendProject: BackendProject): Project {
    return {
      id: backendProject.id,
      name: backendProject.name,
      description: backendProject.description,
      targetImageUrl: toAbsoluteUrl(backendProject.targetImage.url),
      contentUrl: toAbsoluteUrl(backendProject.content.url),
      contentType: backendProject.content.type,
      status: backendProject.status,
      viewCount: backendProject.stats.viewCount,
      qrCode: {
        shortCode: backendProject.qrCode.shortCode,
        url: backendProject.qrCode.shortUrl,
      },
      trackingQuality: backendProject.settings.trackingQuality,
      autoPlay: backendProject.settings.autoPlay,
      loopContent: backendProject.settings.loopContent,
      createdAt: backendProject.createdAt,
      updatedAt: backendProject.updatedAt,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.refreshToken) {
      await this.refreshAccessToken();
      return this.request(endpoint, options);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred");
    }

    return data;
  }

  private async refreshAccessToken(): Promise<void> {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      this.logout();
      throw new Error("Session expired");
    }

    const data = await response.json();
    this.setTokens(data.data.accessToken, data.data.refreshToken);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Auth endpoints
  async register(
    email: string,
    password: string,
    fullName: string
  ): Promise<ApiResponse<AuthTokens>> {
    const response = await this.request<AuthTokens>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
    });
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response;
  }

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthTokens>> {
    const response = await this.request<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/me");
  }

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // Upload endpoints
  async getPresignedUrl(
    fileType: "target" | "content",
    mimeType: string,
    fileSize: number
  ): Promise<ApiResponse<PresignedUrlResponse>> {
    return this.request<PresignedUrlResponse>("/upload/presigned-url", {
      method: "POST",
      body: JSON.stringify({ fileType, mimeType, fileSize }),
    });
  }

  async uploadFile(
    file: File,
    uploadUrl: string
  ): Promise<ApiResponse<UploadFileResponse>> {
    const formData = new FormData();
    formData.append("file", file);

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const baseUrl = BASE_URL.replace(/\/api\/v1$/, "");
    const fullUrl = uploadUrl.startsWith("http")
      ? uploadUrl
      : `${baseUrl}${uploadUrl}`;

    const response = await fetch(fullUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    if (response.status === 401 && this.refreshToken) {
      await this.refreshAccessToken();
      return this.uploadFile(file, uploadUrl);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    return data;
  }

  async confirmUpload(
    fileKey: string
  ): Promise<ApiResponse<ConfirmUploadResponse>> {
    return this.request<ConfirmUploadResponse>("/upload/confirm", {
      method: "POST",
      body: JSON.stringify({ fileKey }),
    });
  }

  // Project endpoints
  async createProject(projectData: {
    name: string;
    description?: string;
    targetImageKey: string;
    targetImageSize: number;
    contentKey: string;
    contentType: "image" | "video" | "3d_model";
    contentSize: number;
    contentMimeType: string;
    contentDuration?: number;
    trackingQuality?: "low" | "medium" | "high";
    autoPlay?: boolean;
    loopContent?: boolean;
  }): Promise<ApiResponse<Project>> {
    const response = await this.request<BackendProject>("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
    return {
      success: response.success,
      data: this.transformProject(response.data),
      message: response.message,
    };
  }

  async getProjects(params?: {
    status?: "active" | "disabled";
    contentType?: "image" | "video" | "3d_model";
    search?: string;
    sortBy?: "created_at" | "view_count" | "name";
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ projects: Project[]; total: number }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const response = await this.request<{
      projects: BackendProject[];
      pagination: { total: number };
    }>(`/projects${query ? `?${query}` : ""}`);

    return {
      success: response.success,
      data: {
        projects: response.data.projects.map((p) => this.transformProject(p)),
        total: response.data.pagination.total,
      },
      message: response.message,
    };
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    const response = await this.request<BackendProject>(
      `/projects/${projectId}`
    );
    return {
      success: response.success,
      data: this.transformProject(response.data),
      message: response.message,
    };
  }

  async updateProject(
    projectId: string,
    updates: Partial<{
      name: string;
      description: string;
      trackingQuality: "low" | "medium" | "high";
      autoPlay: boolean;
      loopContent: boolean;
      status: "active" | "disabled";
    }>
  ): Promise<ApiResponse<Project>> {
    const response = await this.request<BackendProject>(
      `/projects/${projectId}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
    return {
      success: response.success,
      data: this.transformProject(response.data),
      message: response.message,
    };
  }

  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  async getProjectAnalytics(
    projectId: string
  ): Promise<ApiResponse<ProjectAnalytics>> {
    return this.request<ProjectAnalytics>(`/projects/${projectId}/analytics`);
  }
}

export const api = new ApiClient();
export type {
  User,
  Project,
  BackendProject,
  ProjectAnalytics,
  AuthTokens,
  PresignedUrlResponse,
  UploadFileResponse,
  ConfirmUploadResponse,
};
