import os
from fastapi import FastAPI, Response, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.background import BackgroundTasks
from util.sub import download_subs
from util.meta import query_meta

from util.stream import stream_from_yt

app = FastAPI()

@app.get("/dl/{video_id}")
async def api_dl(
    video_id: str,   # the video's ID (watch?v=<this>)
    f: str = "best", # format 
    sl: str = None,  # subtitle language to embed
):
    if "+" in f or sl is not None:
        # video will have to be remuxed into matroska
        media_type = "video/mkv"
        headers = {
            "Content-Disposition": f"attachment;filename={video_id}.mkv"
        }
    else:
        # video can be sent as-is
        media_type = None
        headers = None

    return StreamingResponse(
        stream_from_yt(video_id, f, sl),
        # if remuxed, specify matroska, otherwise just let it guess filetype
        media_type = media_type,
        headers=headers
    )

@app.get("/meta/{video_id}")
async def api_meta(video_id: str):
    meta = query_meta(video_id)

    if meta is None:
        raise HTTPException(
            status_code=400, 
            detail="Could not get meta for requested Video ID!"
        )

    return JSONResponse(meta)


def _remove_file(path: str) -> None:
    if not (
        path.endswith('.vtt')
        or path.endswith('.srt')
        or path.endswith('.ass')
    ):
        # don't delete weird files
        # better safe than sorry
        return
    os.remove(path)

@app.get("/sub/{video_id}")
async def api_sub(background_tasks: BackgroundTasks, video_id: str, l: str = "en", f: str = "vtt"):
    if f not in ["vtt", "ass", "srt"] and not (l == "live_chat" and f == "json"):
        raise HTTPException(
            status_code=400,
            detail="Invalid subtitle format, valid options are: vtt, ass, srt"
        )

    sub_file = download_subs(video_id, l, f)

    background_tasks.add_task(_remove_file, sub_file)

    return FileResponse(
        sub_file,
        filename=f"{video_id}.{l}.{f}"
    )