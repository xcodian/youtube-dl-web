import { Format } from "./parseVideo"

function _trigger_download(url: string) {
    const a = document.createElement('a')

    a.href = url
    a.download = ""

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

export function download(
    id: string,
    videoFrom: Format | "none",
    audioFrom: Format | "none", 
    downloadSubs: boolean,
    subLanguage: string, 
    subFormat: string
) { 
    let url = getDownloadLink(id, videoFrom, audioFrom);

    if (downloadSubs) {
        if (subLanguage == "live_chat") {
            subFormat = "json"
        }
        
        if (subFormat == "embed") {
            url += `&sl=${subLanguage}`;
        } else {
            _trigger_download(
                getSubLink(id, subLanguage, subFormat)
            );
        }
    }

    
    _trigger_download(url)
}

export function getDownloadLink(
    id: string,
    videoFrom: Format | "none",
    audioFrom: Format | "none",
): string {
    let f = `/api/dl/?video_id=${id}?f=`;

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

export function getSubLink(
    id: string,
    subLang: string,
    subFormat: string
): string {
    return `/api/sub/${id}?l=${subLang}&f=${subFormat}`
}
