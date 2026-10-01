// ==================== ПОЛЬЗОВАТЕЛИ ====================
export interface User {
  id: number;
  username: string;
  email?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_superuser?: boolean;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}


// ==================== ПАГИНАЦИЯ ====================
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  pages: number;
}


// ==================== ГРУППЫ ====================
export interface Group {
  id: number;
  title: string;
  slug: string;
  description?: string;
}

export interface GroupCreate {
  title: string;
  description: string;
  slug?: string;
}

export interface GroupDetailResponse {
  group: Group;
  posts: PaginatedResponse<Post>;
}


// ==================== ПОСТЫ ====================
export interface Post {
  id: number;
  text: string;
  image?: string;
  pub_date: string;
  author: User;
  author_id: number;       // <--- ДОБАВЛЕНО: для полного соответствия бэкенду
  group_id?: number;
  group?: Group;
  comments?: Comment[];
}

export interface PostCreate {
  text: string;
  image?: string;
  group_id?: number;
}

export interface PostDetailResponse {
  post: Post & { comments: Comment[] };
  author_post_count: number;
}


// ==================== КОММЕНТАРИИ ====================
export interface Comment {
  id: number;
  text: string;
  pub_date: string;
  author: User;
  post_id: number;
}

export interface CommentCreate {
  text: string;
}


// ==================== ПРОФИЛЬ ====================
export interface ProfileResponse {
  author: User;
  posts: PaginatedResponse<Post>;
  is_following: boolean;
  total_posts: number;
}