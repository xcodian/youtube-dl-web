import mimetypes
import os

import magic

from fastapi import FastAPI, HTTPException
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
    stream = stream_from_yt(video_id, f, sl)  
    first_chunk = await stream.__anext__() # peek first chunk

    # guess filetype
    m = magic.Magic(mime=True, uncompress=True)
    mime_type = m.from_buffer(first_chunk)

    # guess extension based on mimetype
    ext = mimetypes.guess_extension(mime_type) or '.mkv' # fallback to mkv I guess
    
    print(f"[{video_id}]: download type: {mime_type} ({ext})")
    
    headers = {
        "Content-Disposition": f"attachment;filename={query_meta(video_id)['title']}{ext}"
    }

    async def joined_stream():
        # attach the first chunk back to the generator
        yield first_chunk

        # pass on the rest
        async for chunk in stream:
            yield chunk

    # pass that to the user
    return StreamingResponse(
        joined_stream(),
        media_type = mime_type,
        headers = headers
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