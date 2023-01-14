import subprocess
import json
import sys

from typing import List

def _only_named_subs(subs: dict):
    # subtitles have a lot of url's that the frontend won't use, so let's just remove those
    return {
        # big dict of subtitle ids eg. en, de, fr 
        sub_name: (
            # make it so its just the name of the sub
            formats[0].get("name") or sub_name # sometimes subs don't have name, weird...
        ) for sub_name, formats in subs.items()
    }

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
    try:
        data = json.loads(data.decode('utf-8'))
    except Exception as e:
        print(f'could not decode json of {id}: {e}')
        return None

    subs = data.get("subtitles")

    out = {
        "title": data["fulltitle"],
        "author": {
            "name": data["channel"],
            # "subscribers": data["channel_follower_count"] --- Removed from yt-dlp json response :(
        },
        "thumbnail": data['thumbnail'],
        # "likes": data["like_count"], --- Removed from yt-dlp json response :(
        "views": data["view_count"],
        "formats": [],
        "subs": _only_named_subs(
            subs if isinstance(subs, dict) else {}
        )
    }

    for f in data['formats']:
        f_out = {
            "id": f["format_id"],
            "note": f.get("format_note") or f"Format #{f['format_id']}",
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
