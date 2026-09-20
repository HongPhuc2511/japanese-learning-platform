import axios from "axios"

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000/";

export const endpoints = {
    'register': "/api/auth/register/",
    'login': "/api/auth/login/",
    'refresh': "/api/auth/refresh/",
    'current-user': "/api/auth/me/",
}

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: BASE_URL
});