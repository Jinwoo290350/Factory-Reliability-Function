/**
 * API Helper Functions
 * Connects Next.js frontend to Python FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  company_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    username: string;
    company_name?: string;
  };
}

export interface Machine {
  id: string;
  name: string;
  sequence_number: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Component {
  id: string;
  component_id?: string;  // Natural ID like "1.1 Compressors"
  component_name: string;
  machine_name: string;
  sub_component?: string;  // Fixed: was sup_component, should be sub_component
  failure_mode?: string;
  failure_hours?: number;
  machine_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface MachineCreate {
  name: string;
}

export interface ComponentCreate {
  component_id?: string;  // Natural ID like "1.1 Compressors"
  machine_name: string;
  component_name: string;
  sub_component?: string;  // Fixed: was sup_component, should be sub_component
  failure_mode?: string;
  failure_hours?: number;
  machine_id?: string;
}

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

// Helper function to set auth token
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

// Helper function to remove auth token
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Add auth header if token exists and not already set
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    let errorDetails;

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
      errorDetails = errorData;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiError(response.status, errorMessage, errorDetails);
  }

  // Handle empty responses
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return {} as T;
}

// ==================== Auth APIs ====================

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  // Save token to localStorage
  if (response.access_token) {
    setAuthToken(response.access_token);
  }

  return response;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  // Save token to localStorage
  if (response.access_token) {
    setAuthToken(response.access_token);
  }

  return response;
}

export function logout(): void {
  removeAuthToken();
}

// ==================== Machine APIs ====================

export async function getMachines(): Promise<Machine[]> {
  return apiRequest<Machine[]>("/machines", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function getMachine(id: string): Promise<Machine> {
  return apiRequest<Machine>(`/machines/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function createMachine(data: MachineCreate): Promise<Machine> {
  return apiRequest<Machine>("/machines", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

export async function updateMachine(id: string, data: Partial<MachineCreate>): Promise<Machine> {
  return apiRequest<Machine>(`/machines/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

export async function deleteMachine(id: string): Promise<void> {
  return apiRequest<void>(`/machines/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

// ==================== Component APIs ====================

export async function getComponents(machineId?: string): Promise<Component[]> {
  const url = machineId ? `/components?machine_id=${machineId}` : "/components";
  return apiRequest<Component[]>(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function getComponent(id: string): Promise<Component> {
  return apiRequest<Component>(`/components/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function createComponent(data: ComponentCreate): Promise<Component> {
  return apiRequest<Component>("/components", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

export async function updateComponent(id: string, data: Partial<ComponentCreate>): Promise<Component> {
  return apiRequest<Component>(`/components/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

export async function deleteComponent(id: string): Promise<void> {
  return apiRequest<void>(`/components/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

// ==================== CSV Upload API ====================

export interface CsvUploadResponse {
  message: string;
  filename: string;
  machines_created: number;
  components_created: number;
  csv_upload_id: string;
}

export async function uploadCSV(file: File): Promise<CsvUploadResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError(401, "Not authenticated");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/csv/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Upload failed: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

// ==================== Health Check ====================

export async function healthCheck(): Promise<{ status: string }> {
  return apiRequest<{ status: string }>("/", {
    method: "GET",
  });
}
