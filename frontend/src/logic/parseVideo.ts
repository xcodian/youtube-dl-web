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

    let id = "";

    if (url.host == "www.youtube.com") {
        // throw "Your URL must be from www.youtube.com!";
        const params = url.searchParams;
        
        if (!params.has("v")) {
            throw "Your URL must contain the watch?v part!";
        }

        id = params.get("v")!;
    } else if (url.host == "youtu.be") {
        if (url.pathname.length <= 1) {
            throw "Your URL must contain the video ID at the end!";
        }

        id = url.pathname.substring(1);
    } else {
        throw "Your URL must be from www.youtube.com or youtu.be!";
    }

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
    subs: Record<string, string>
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