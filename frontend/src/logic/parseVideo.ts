export interface VideoURL {
    raw: string,
    id: string
}

const WATCHV_REGEX = /^((www\.|music\.))?youtube.com$/;
const HTTP_REGEX = /^(https?):\/\//;

export function parseVideoURL(input: string): VideoURL {
    let url;
    
    try {
        if (!HTTP_REGEX.test(input)) {
            input = "https://" + input;
        }
        url = new URL(input);
    } catch {
        // silent error
        throw "";
    }

    let id = "";

    console.log(input, url.host)

    if (WATCHV_REGEX.test(url.host)) {
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
        throw "Your URL must be from YouTube or from YouTube Music!";
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