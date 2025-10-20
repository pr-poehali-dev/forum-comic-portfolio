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

  getById: async (id: number): Promise<{ comic: ComicDetail }> => {
    const response = await fetch(`${API_URLS.comics}?id=${id}`);
    return response.json();
  },

  getByUser: async (userId: number): Promise<{ comics: Comic[] }> => {
    const response = await fetch(`${API_URLS.comics}?user_id=${userId}`);
    return response.json();
  },

  create: async (
    data: {
      user_id: number;
      title: string;
      description?: string;
      genre?: string | null;
      cover_url?: string;
      pages: { page_number: number; image_url: string; caption?: string }[];
    }
  ) => {
    const response = await fetch(API_URLS.comics, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

export const interactionsApi = {
  like: async (userId: number, comicId: number) => {
    const response = await fetch(API_URLS.interactions, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'like', user_id: userId, comic_id: comicId }),
    });
    return response.json();
  },

  unlike: async (userId: number, comicId: number) => {
    const response = await fetch(API_URLS.interactions, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'unlike', user_id: userId, comic_id: comicId }),
    });
    return response.json();
  },

  rate: async (userId: number, comicId: number, rating: number) => {
    const response = await fetch(API_URLS.interactions, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'rate', user_id: userId, comic_id: comicId, rating }),
    });
    return response.json();
  },

  addComment: async (userId: number, comicId: number, content: string) => {
    const response = await fetch(API_URLS.interactions, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'comment', user_id: userId, comic_id: comicId, content }),
    });
    return response.json();
  },

  getComments: async (comicId: number): Promise<{ comments: Comment[] }> => {
    const response = await fetch(`${API_URLS.interactions}?action=comments&comic_id=${comicId}`);
    return response.json();
  },
};

export interface ChatMessage {
  id: number;
  user_id: number;
  message: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
}

export const chatApi = {
  getMessages: async (): Promise<{ messages: ChatMessage[] }> => {
    const response = await fetch(API_URLS.chat);
    return response.json();
  },

  sendMessage: async (userId: number, message: string) => {
    const response = await fetch(API_URLS.chat, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, message }),
    });
    return response.json();
  },
};