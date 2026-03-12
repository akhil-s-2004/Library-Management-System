// Reads a cookie value by name. Returns null if not found.
export const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : null
}

// Writes a readable (non-HttpOnly) cookie from the browser side.
export const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
}
