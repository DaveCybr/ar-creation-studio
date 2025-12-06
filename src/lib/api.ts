const BASE_URL = "https://ar-backend-production-0c8c.up.railway.app/api/v1";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  targetImageUrl: string;
  contentUrl: string;
  contentType: 'image' | 'video' | '3d_model';
  status: 'active' | 'disabled';
  viewCount: number;
  qrCode: {
    shortCode: string;
    url: string;
  };
  trackingQuality: 'low' | 'medium' | 'high';
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
  expiresAt: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
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
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  private async refreshAccessToken(): Promise<void> {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      this.logout();
      throw new Error('Session expired');
    }

    const data = await response.json();
    this.setTokens(data.data.accessToken, data.data.refreshToken);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Auth endpoints
  async register(email: string, password: string, fullName: string): Promise<ApiResponse<AuthTokens & { user: User }>> {
    const response = await this.request<AuthTokens & { user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthTokens & { user: User }>> {
    const response = await this.request<AuthTokens & { user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // Upload endpoints
  async getPresignedUrl(
    fileType: 'target' | 'content',
    mimeType: string,
    fileSize: number
  ): Promise<ApiResponse<PresignedUrlResponse>> {
    return this.request<PresignedUrlResponse>('/upload/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ fileType, mimeType, fileSize }),
    });
  }

  async confirmUpload(fileKey: string): Promise<ApiResponse<void>> {
    return this.request<void>('/upload/confirm', {
      method: 'POST',
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
    contentType: 'image' | 'video' | '3d_model';
    contentSize: number;
    contentMimeType: string;
    contentDuration?: number;
    trackingQuality?: 'low' | 'medium' | 'high';
    autoPlay?: boolean;
    loopContent?: boolean;
  }): Promise<ApiResponse<Project>> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProjects(params?: {
    status?: 'active' | 'disabled';
    contentType?: 'image' | 'video' | '3d_model';
    search?: string;
    sortBy?: 'created_at' | 'view_count' | 'name';
    sortOrder?: 'asc' | 'desc';
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
    return this.request<{ projects: Project[]; total: number }>(
      `/projects${query ? `?${query}` : ''}`
    );
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${projectId}`);
  }

  async updateProject(
    projectId: string,
    updates: Partial<{
      name: string;
      description: string;
      trackingQuality: 'low' | 'medium' | 'high';
      autoPlay: boolean;
      loopContent: boolean;
      status: 'active' | 'disabled';
    }>
  ): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async getProjectAnalytics(projectId: string): Promise<ApiResponse<ProjectAnalytics>> {
    return this.request<ProjectAnalytics>(`/projects/${projectId}/analytics`);
  }
}

export const api = new ApiClient();
export type { User, Project, ProjectAnalytics, AuthTokens, PresignedUrlResponse };
