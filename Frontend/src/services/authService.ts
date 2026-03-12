// src/services/authService.ts
import api from './api'
import axios from 'axios'

export const login = async (email: string, password: string) => {
    try {
        const response = await api.post('/auth/login', { email, password })
        // auth_token  → HttpOnly cookie set by the server (invisible to JS)
        // user_role, user_id, user_status → readable cookies set by the server
        return response.data  // { success, role, userId, status }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.error) {
            throw new Error(error.response.data.error)
        }
        throw new Error('Invalid email or password')
    }
}

export const signUp = async (name: string, email: string, phone: string, role: string, password: string) => {
    try {
        const response = await api.post('/auth/register', { name, email, phone, role, password })
        return response.data  // { userId, message }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.error) {
            throw new Error(error.response.data.error)
        }
        throw new Error('Registration failed. Email may already be in use.')
    }
}

export const logout = () => {
    // Server expires all cookies (auth_token, user_role, user_id, user_status)
    api.post('/auth/logout').catch(() => {})
}
