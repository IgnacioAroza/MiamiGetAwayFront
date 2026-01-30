import axios from 'axios'
import config from '../config'

const api = axios.create({
    baseURL: config.API_URL,
    // Deja que Axios determine automáticamente el Content-Type según el payload.
    // Esto es clave para que FormData se envíe como multipart/form-data con boundary.
    withCredentials: true
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('adminToken')
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/admin/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api
