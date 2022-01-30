export interface VideoURL {
    raw: string,
    id: string
}

export function parseVideoURL(input: string): VideoURL {
    let url;
    
    try {
        url = new URL(input);
    } catch {
        // silent error
        throw "";
    }

    if (url.host != "www.youtube.com") {
        throw "Your URL must be from www.youtube.com!";
    }

    const params = url.searchParams;
    
    if (!params.has("v")) {
        throw "Your URL must contain the watch?v part!";
    }

    const id = params.get("v")!;

    console.log(id);

    return {
        raw: url.toString(),
        id: id,
    }
}

export interface VideoMeta {
    title: string,
    author: Author,
    thumbnail: string,
    likes: number,
    views: number,
    formats: Array<Format>
}

export interface Author {
    name: string,
    subscribers: number
}

export interface Format {
    id: string,
    note: string,
    audio?: AudioSourceMeta,
    video?: VideoSourceMeta
}

export interface AudioSourceMeta {
    samples: number,
    rate: number,
    codec: string
}

export interface VideoSourceMeta {
    width: number,
    height: number,
    fps: number,
    codec: string
}

export function getDownloadLink(
    id: string,
    videoFrom: Format | "none",
    audioFrom: Format | "none",
): string {
    let f = `/api/dl/${id}?f=`;

    if (audioFrom == "none") {
        // only download video
        f += (videoFrom as Format).id 
    } else {
        if (videoFrom == "none") {
            // no video, only audio, no need to add +
            f += audioFrom.id
        } else {
            // download with + since there is a specific video and specific audio
            f += videoFrom.id + "%2B" + audioFrom.id
        }
    }
    
    return f
}