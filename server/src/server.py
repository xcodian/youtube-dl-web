from fastapi import FastAPI, Response, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from util.meta import query_meta

from util.stream import stream_from_yt

app = FastAPI()

@app.get("/dl/{video_id}")
async def main(video_id: str, f: str = "best"):
    if "+" in f:
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
        stream_from_yt(video_id, f),
        # if remuxed, specify matroska, otherwise just let it guess filetype
        media_type = media_type,
        headers=headers
    )

@app.get("/meta/{video_id}")
async def main(video_id: str):
    meta = query_meta(video_id)

    if meta is None:
        raise HTTPException(
            status_code=400, 
            detail="Could not get meta for requested Video ID!"
        )

    return JSONResponse(meta)