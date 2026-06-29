import axios, { AxiosInstance } from "axios"

// Point to our backend proxy to avoid browser CORS issues with Judge0
const instance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
})

export default instance

