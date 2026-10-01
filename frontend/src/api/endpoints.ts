import { api } from './clients';
import type {
  Post,
  Comment,
  Group,
  GroupCreate,
  ProfileResponse,
  PostCreate,
  PostDetailResponse,
  CommentCreate,
  TokenResponse,
  LoginData,
  RegisterData,
  User,
  PaginatedResponse,
} from '../types';

export const authEndpoints = {
  login: (data: LoginData) => api.post<TokenResponse>('/auth/login', data),
  register: (data: RegisterData) => api.post<TokenResponse>('/auth/signup', data),
  me: () => api.get<User>('/auth/me'),
};

export const postEndpoints = {
  getList: (page: number = 1, q?: string) =>
    api.get<PaginatedResponse<Post>>(`/posts/?page=${page}${q ? `&q=${q}` : ''}`),

  getDetail: (postId: number) =>
    api.get<PostDetailResponse>(`/posts/${postId}`),

  create: (data: PostCreate) => api.post<Post>('/posts/', data),

  update: (postId: number, data: PostCreate) =>
    api.patch<Post>(`/posts/${postId}/`, data),

  delete: (postId: number) => api.delete(`/posts/${postId}/`),

  getFollowFeed: (page: number = 1) =>
    api.get<PaginatedResponse<Post>>(`/follow/?page=${page}`),
};

export const profileEndpoints = {
  getMyProfile: () => api.get<ProfileResponse>('/profile/me'),

  getUserProfile: (username: string) =>
    api.get<ProfileResponse>(`/profile/${username}`),

  follow: (username: string) =>
    api.post(`/profile/${username}/follow/`),

  unfollow: (username: string) =>
    api.delete(`/profile/${username}/follow/`),
};

export const commentEndpoints = {
  add: (postId: number, data: CommentCreate) =>
    api.post<Comment>(`/posts/${postId}/comments/`, data),
};

export const groupEndpoints = {
  getList: () => api.get<Group[]>('/groups/'),

  getPosts: (slug: string, page: number = 1) =>
    api.get<{ group: Group; posts: PaginatedResponse<Post> }>(
      `/groups/${slug}/?page=${page}`
    ),

  create: (data: GroupCreate) => api.post<Group>('/groups/', data),
};