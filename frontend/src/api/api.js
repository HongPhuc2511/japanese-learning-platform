import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000/";

export const endpoints = {
    'register': "/api/auth/register/",
    'login': "/api/auth/login/",
    'refresh': "/api/auth/refresh/",
    'current-user': "/api/auth/me/",
    'courses': "/api/courses/",
    'lessons': "/api/lessons/",
    'vocabulary': "/api/vocabulary/",
    'kanji': "/api/kanji/",
    'grammar': "/api/grammar/",
    'quizzes': "/api/quizzes/",
    'progress': "/api/progress/",
    'bookmarks': "/api/bookmarks/",
    'flashcards': "/api/flashcards/",
    'quiz-results': "/api/quiz-results/",
}

export const authApi = axios.create({
    baseURL: BASE_URL,
});

authApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; 

            const refreshToken = localStorage.getItem('refresh');
            if (!refreshToken) {
                forceLogout();
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(BASE_URL + endpoints['refresh'], {
                    refresh: refreshToken,
                });
                localStorage.setItem('access', res.data.access);
                originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                return authApi(originalRequest); 
            } catch (refreshError) {
                forceLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

function forceLogout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

export default axios.create({
    baseURL: BASE_URL
});