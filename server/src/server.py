"""
Main API Server
"""

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
    dl_format: str = "best", # download format
    sub_lang: str = None,  # subtitle language to embed
):
    """
    Download API endpoint, stream data to end user
    """

    stream = stream_from_yt(video_id, dl_format, sub_lang)
    first_chunk = await stream.__anext__() # peek first chunk

    # guess filetype
    file_type = magic.Magic(mime=True, uncompress=True)
    mime_type = file_type.from_buffer(first_chunk)

    # guess extension based on mimetype
    ext = mimetypes.guess_extension(mime_type) or '.mkv' # fallback to mkv I guess

    print(f"[{video_id}]: download type: {mime_type} ({ext})")

    headers = {
        "Content-Disposition": f"attachment;filename={video_id}{ext}"
    }

    async def joined_stream():
        """
        Data chunk generator for the StreamingResponse
        """

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
    """
    Meta API endpoint
    """

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
async def api_sub(
    background_tasks: BackgroundTasks,
    video_id: str,
    lang: str = "en",
    sub_format: str = "vtt"
):
    """
    Subtitle API Endpoint
    """

    if sub_format not in ["vtt", "ass", "srt"] and not (lang == "live_chat" and sub_format == "json"):
        raise HTTPException(
            status_code=400,
            detail="Invalid subtitle format, valid options are: vtt, ass, srt"
        )

    sub_file = download_subs(video_id, lang, sub_format)

    background_tasks.add_task(_remove_file, sub_file)

    return FileResponse(
        sub_file,
        filename=f"{video_id}.{lang}.{sub_format}"
    )
