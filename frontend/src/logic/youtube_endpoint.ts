export function extractIDFromWatchV(full_url: string): string | null {
    try {
        const url = new URL(full_url);
        if (url.pathname != "/watch") return null;

        const id = url.searchParams.get("v");

        if (id != null && id.length > 0) {
            return "https://www.youtube.com/watch?v=" + id;
        }    
    } catch {}

    return null;
}