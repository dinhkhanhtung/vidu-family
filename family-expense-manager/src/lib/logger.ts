type LogLevel = "info" | "warn" | "error"

function baseLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const entry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...meta
    }
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
        JSON.stringify(entry)
    )
}

export function getRequestIdFromHeaders(headers: Headers): string | undefined {
    return headers.get("x-request-id") || undefined
}

export function logInfo(message: string, meta?: Record<string, unknown>) {
    baseLog("info", message, meta)
}

export function logWarn(message: string, meta?: Record<string, unknown>) {
    baseLog("warn", message, meta)
}

export function logError(message: string, meta?: Record<string, unknown>) {
    baseLog("error", message, meta)
}


