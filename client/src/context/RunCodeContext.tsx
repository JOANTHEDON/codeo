import axiosInstance from "@/api/pistonApi"
import { Language, RunContext as RunContextType } from "@/types/run"
import langMap from "lang-map"
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"
import toast from "react-hot-toast"
import { useFileSystem } from "./FileContext"

const RunCodeContext = createContext<RunContextType | null>(null)

export const useRunCode = () => {
    const context = useContext(RunCodeContext)
    if (context === null) {
        throw new Error(
            "useRunCode must be used within a RunCodeContextProvider",
        )
    }
    return context
}

const RunCodeContextProvider = ({ children }: { children: ReactNode }) => {
    const { activeFile } = useFileSystem()
    const [input, setInput] = useState<string>("")
    const [output, setOutput] = useState<string>("")
    const [isRunning, setIsRunning] = useState<boolean>(false)
    const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([])
    const [selectedLanguage, setSelectedLanguage] = useState<Language>({
        id: 71, // Python 3.8.1 default
        language: "Python (3.8.1)",
        version: "3.8.1",
        aliases: ["py", "python3"],
    })

    // Fetch supported languages from Judge0 CE
    useEffect(() => {
        const fetchSupportedLanguages = async () => {
            try {
                const res = await axiosInstance.get("/languages")
                const languages: Language[] = res.data.map(
                    (l: { id: number; name: string }) => {
                        const match = l.name.match(/^(.+?)\s*\((.+)\)$/)
                        const language = match ? match[1].trim() : l.name.trim()
                        const version = match ? match[2].trim() : ""
                        return {
                            id: l.id,
                            language: l.name,
                            version,
                            aliases:
                                langMap.extensions(language.toLowerCase()) || [
                                    language.toLowerCase().replace(/\s+/g, ""),
                                ],
                        }
                    },
                )
                setSupportedLanguages(languages)
            } catch (error) {
                toast.error("Failed to fetch supported languages")
                console.error(error)
            }
        }
        fetchSupportedLanguages()
    }, [])

    // Auto-detect language from active file extension
    useEffect(() => {
        if (supportedLanguages.length === 0 || !activeFile?.name) return
        const extension = activeFile.name.split(".").pop()?.toLowerCase()
        if (!extension) return

        const languageNames = langMap.languages(extension)
        const matched = supportedLanguages.find(
            (lang) =>
                lang.aliases.includes(extension) ||
                languageNames.some((n) =>
                    lang.language.toLowerCase().includes(n.toLowerCase()),
                ),
        )
        if (matched) setSelectedLanguage(matched)
    }, [activeFile?.name, supportedLanguages])

    const runCode = async () => {
        if (!activeFile) {
            return toast.error("Please open a file to run the code")
        }
        if (!selectedLanguage?.id) {
            return toast.error("Please select a language to run the code")
        }

        toast.loading("Running code...")
        setIsRunning(true)
        setOutput("")

        try {
            const response = await axiosInstance.post(
                "/submissions?base64_encoded=false&wait=true",
                {
                    source_code: activeFile.content || "",
                    language_id: selectedLanguage.id,
                    stdin: input,
                },
            )

            const { stdout, stderr, compile_output, message, status } =
                response.data

            if (stderr) {
                setOutput(stderr)
            } else if (compile_output) {
                setOutput(compile_output)
            } else if (message) {
                setOutput(message)
            } else {
                setOutput(stdout || `[No output] Status: ${status?.description}`)
            }

            toast.dismiss()
        } catch (error: any) {
            console.error(error)
            toast.dismiss()
            toast.error(
                error?.response?.data?.message || "Failed to run the code",
            )
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <RunCodeContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                supportedLanguages,
                selectedLanguage,
                setSelectedLanguage,
                runCode,
            }}
        >
            {children}
        </RunCodeContext.Provider>
    )
}

export { RunCodeContextProvider }
export default RunCodeContext
