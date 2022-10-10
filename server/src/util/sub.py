import os
import subprocess
import tempfile

def download_subs(vid_id: str, lang: str, sub_format: str = "vtt"):
    """
    Slap yt-dlp to download subtitles from YouTube
    """

    sub_dest = tempfile.mktemp()

    if len(lang.split(',')) != 1:
        # stop people from putting , in the name
        raise ValueError("invalid subtitle lang")

    args = [
        "yt-dlp", vid_id,
        "-o", sub_dest,
        "--no-download",
        "--write-subs",
        "--sub-langs", lang
    ]

    if lang == 'live_chat':
        sub_format = 'json'

    if sub_format != "vtt" and sub_format in ["srt", "ass"]:
        args += [
            "--convert-subs", sub_format
        ]

    proc = subprocess.Popen(
        args,
        stdin=subprocess.DEVNULL,
    )

    proc.wait()


    if not os.path.isfile(sub_dest + f'.{lang}.{sub_format}'):
        # wrong subs
        os.remove(sub_dest + f'.en.{sub_format}')
        return ''

    return sub_dest + f'.{lang}.{sub_format}'
