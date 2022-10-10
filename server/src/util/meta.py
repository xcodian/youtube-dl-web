import subprocess
import json

def _only_named_subs(subs: dict):
    """
    subtitles have a lot of url's that the frontend won't use, so let's just remove those
    """

    return {
        # big dict of subtitle ids eg. en, de, fr
        sub_name: (
            # make it so its just the name of the sub
            formats[0].get("name") or sub_name # sometimes subs don't have name, weird...
        ) for sub_name, formats in subs.items()
    }

def query_meta(vid_id: str) -> dict:
    """
    Get yt-dlp to go to YouTube and slap out some video info
    """

    with subprocess.Popen(
        [
            # request to download json meta with id
            "yt-dlp", "-j", vid_id
        ],
        stdin = subprocess.DEVNULL,
        stdout = subprocess.PIPE,
        stderr = subprocess.DEVNULL
    ) as proc:

        data = b''
        while True:
            data_chunk = proc.stdout.read(4096) # read 4096b at a time

            if len(data_chunk) == 0:
                break

            data += data_chunk
        try:
            data: dict = json.loads(data.decode('utf-8'))
        except Exception as error:
            print(f'could not decode json of {vid_id}: {error}')
            return None

    subs = data.get("subtitles")

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
        "subs": _only_named_subs(
            subs if isinstance(subs, dict) else {}
        )
    }

    for media_format in data['formats']:
        f_out = {
            "id": media_format["format_id"],
            "note": media_format.get("format_note") or f"Format #{media_format['format_id']}",
        }

        if media_format.get("asr") is not None:
            f_out["audio"] = {
                "samples": media_format["asr"],
                "rate": media_format["abr"],
                "codec": media_format["acodec"]
            }

        if media_format["resolution"] != "audio only":
            f_out["video"] = {
                "width": media_format["width"],
                "height": media_format["height"],
                "fps": media_format.get("fps") or 0,
                "codec": media_format["vcodec"]
            }


        out["formats"].append(f_out)

    return out
