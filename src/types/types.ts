export interface UserSuggestion {
    userId: string;
    name: string;
    profileImage?: string;
    userType?: string;
  }
  
  export interface SearchParams {
    term: string;
    type?: string;
    limit?: number;
  }
  
  export interface PaginationParams {
    page: number;
    limit: number;
  }
  
  export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
  }