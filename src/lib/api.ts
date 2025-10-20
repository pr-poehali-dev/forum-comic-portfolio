const API_URLS = {
  auth: 'https://functions.poehali.dev/10389a26-945a-4ab5-806b-ba01ebcf01fe',
  comics: 'https://functions.poehali.dev/23b2c094-896b-430e-9523-65493669efda',
  interactions: 'https://functions.poehali.dev/9b238a76-9884-4453-a1d3-5e747873be63',
  chat: 'https://functions.poehali.dev/75200214-3304-4483-8f85-3500669d42f1',
};

export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface Comic {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  genre?: string;
  cover_url?: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  avg_rating: number;
  likes_count: number;
  comments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ComicPage {
  id: number;
  comic_id: number;
  page_number: number;
  image_url: string;
  caption?: string;
}

export interface ComicDetail extends Comic {
  pages: ComicPage[];
}

export interface Comment {
  id: number;
  user_id: number;
  comic_id: number;
  content: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  user_id: number;
  content: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
}

export const authApi = {
  register: async (username: string, email: string, password: string, display_name?: string) => {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, email, password, display_name }),
    });
    return response.json();
  },

  login: async (username: string, password: string) => {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password }),
    });
    return response.json();
  },
};

export const comicsApi = {
  getAll: async (): Promise<{ comics: Comic[] }> => {
    const response = await fetch(API_URLS.comics);
    return response.json();
  },

  getById: async (id: number, token?: string | null): Promise<{ comic: ComicDetail; comments: Comment[]; user_liked: boolean; user_rating: number }> => {
    const headers: Record<string, string> = {};
    if (token) headers['X-Auth-Token'] = token;
    const response = await fetch(`${API_URLS.comics}?id=${id}`, { headers });
    return response.json();
  },

  getByUser: async (userId: number): Promise<{ comics: Comic[] }> => {
    const response = await fetch(`${API_URLS.comics}?user_id=${userId}`);
    return response.json();
  },

  create: async (
    data: {
      title: string;
      description?: string;
      genre?: string | null;
      cover_url?: string;
      pages: { page_number: number; image_url: string }[];
    },
    token: string
  ) => {
    const response = await fetch(API_URLS.comics, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  toggleLike: async (comicId: number, token: string) => {
    const response = await fetch(API_URLS.interactions, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ action: 'toggle_like', comic_id: comicId }),
    });
    return response.json();
  },

  rate: async (comicId: number, rating: number, token: string) => {
    const response = await fetch(API_URLS.interactions, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ action: 'rate', comic_id: comicId, rating }),
    });
    return response.json();
  },

  addComment: async (comicId: number, content: string, token: string) => {
    const response = await fetch(API_URLS.interactions, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ action: 'comment', comic_id: comicId, content }),
    });
    return response.json();
  },
};

export const chatApi = {
  getMessages: async (token: string): Promise<{ messages: Message[] }> => {
    const response = await fetch(API_URLS.chat, {
      headers: { 'X-Auth-Token': token },
    });
    return response.json();
  },

  sendMessage: async (content: string, token: string) => {
    const response = await fetch(API_URLS.chat, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ content }),
    });
    return response.json();
  },
};
