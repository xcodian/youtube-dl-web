import os
import subprocess
import tempfile


def download_subs(id: str, lang: str, format: str = "vtt"):
    sub_dest = tempfile.mktemp()

    if (len(lang.split(',')) != 1):
        # stop people from putting , in the name
        raise ValueError("invalid subtitle lang")

    args = [
        "yt-dlp", id,
        "-o", sub_dest,
        "--no-download",
        "--write-subs",
        "--sub-langs", lang
    ]

    if lang == 'live_chat':
        format = 'json'

    if format != "vtt" and format in ["srt", "ass"]:
        args += [
            "--convert-subs", format
        ]
    
    proc = subprocess.Popen(
        args,
        stdin=subprocess.DEVNULL,
    )

    proc.wait()


    if not os.path.isfile(sub_dest + f'.{lang}.{format}'):
        # wrong subs
        os.remove(sub_dest + f'.en.{format}')
        return ''

    return sub_dest + f'.{lang}.{format}'