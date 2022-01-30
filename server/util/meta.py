import subprocess
import json
import sys

from typing import List

def query_meta(id: str) -> dict:
    proc = subprocess.Popen(
        [
            # request to download json meta with id
            "yt-dlp", "-j", id 
        ],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL
    )

    data = b''
    while True:
        b = proc.stdout.read(4096) # read 4096b at a time

        if len(b) == 0:
            break

        data += b
    
    data = json.loads(data.decode('utf-8'))

    out = {
        "title": data["fulltitle"],
        "author": {
            "name": data["channel"],
            "subscribers": data["channel_follower_count"]
        },
        "thumbnail": data['thumbnail'],
        "likes": data["like_count"],
        "views": data["view_count"],
        "formats": [],
    }

    for f in data['formats']:
        f_out = {
            "id": f["format_id"],
            "note": f["format_note"],
        }

        if f.get("asr") != None:
            f_out["audio"] = {
                "samples": f["asr"],
                "rate": f["abr"],
                "codec": f["acodec"]
            }
        
        if f["resolution"] != "audio only": 
            f_out["video"] = {
                "width": f["width"],
                "height": f["height"],
                "fps": f.get("fps") or 0,
                "codec": f["vcodec"]
            }

        
        out["formats"].append(f_out)
    
    return out
