import axios, { AxiosInstance } from "axios"

const groqBaseUrl = "https://api.groq.com/openai/v1"

const instance: AxiosInstance = axios.create({
    baseURL: groqBaseUrl,
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
})

export default instance
