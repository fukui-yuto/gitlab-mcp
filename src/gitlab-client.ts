/**
 * GitLab REST API v4 クライアント
 * Personal Access Token (PRIVATE-TOKEN) で認証
 */

export interface GitLabClientConfig {
  baseUrl: string;
  token: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export class GitLabApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
  ) {
    super(`GitLab API Error ${status} ${statusText}: ${body}`);
    this.name = "GitLabApiError";
  }
}

export class GitLabClient {
  private baseUrl: string;
  private token: string;

  constructor(config: GitLabClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.token = config.token;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      params?: Record<string, string | number | boolean | undefined>;
      body?: Record<string, unknown>;
    },
  ): Promise<T> {
    const url = new URL(`/api/v4${path}`, this.baseUrl);

    if (options?.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      "PRIVATE-TOKEN": this.token,
    };

    const init: RequestInit = { method, headers };

    if (options?.body) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }

    const response = await fetch(url.toString(), init);

    if (!response.ok) {
      const body = await response.text();
      throw new GitLabApiError(response.status, response.statusText, body);
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    return this.request<T>("GET", path, { params });
  }

  async post<T>(
    path: string,
    body?: Record<string, unknown>,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    return this.request<T>("POST", path, { body, params });
  }

  async put<T>(
    path: string,
    body?: Record<string, unknown>,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    return this.request<T>("PUT", path, { body, params });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
}
