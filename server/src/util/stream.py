import asyncio
import os
import select
import subprocess
import threading

from util.sub import download_subs

async def aio_dummy():
    """
    dummy event to hold up the event loop
    """

    loop = asyncio.get_running_loop()
    dummy_future = loop.create_future()
    dummy_handle = loop.call_soon(
        asyncio.futures._set_result_unless_cancelled,
        dummy_future,
        None
    )

    try:
        # execute dummy future (do nothing)
        await dummy_future
    except Exception as error:
        # future couldn't proceed
        raise error
    finally:
        # close future handle
        dummy_handle.cancel()


async def stream_from_yt(vid_id: str, dl_format: str = "best", sub_lang: str = None):
    """
    Make yt-dlp download the media and output to a pipe
    """

    print(f"[{vid_id}]: requested with format {dl_format} and subs {sub_lang}, configuring...")
    args = [
        # request to download with video ID
        "yt-dlp", vid_id,
        # output to stdout (needed for streaming)
        "-o", "-",
        # specify output format
        "-f", dl_format,
        # matroska just allows every format possible
        "--merge-output-format", "mkv"
    ]


    downloader_proc = subprocess.Popen(
        args,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL # don't fill up server logs
    )

    sub_injector_proc = None

    if sub_lang is not None:
        print(f'[{vid_id}]: embedded subtitles requested for {vid_id} in language {sub_lang}, downloading now')
        sub_fname = download_subs(vid_id, sub_lang)
        print(f'[{vid_id}]: injecting subtitles from {sub_fname} to output stream')

        f_args = [
            "ffmpeg",
            "-i", "pipe:",
            "-thread_queue_size", "512",
            "-i", sub_fname,
            "-c", "copy",
            "-c:s", "srt",
            "-f", "matroska",
            "pipe:"
        ]

        sub_injector_proc = subprocess.Popen(
            f_args,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL # don't fill up server logs
        )

        def _feed():
            print(f'subinject[{vid_id}]: started feeding')
            try:
                while True:
                    # print('thread: read from downloader...')
                    dl_bucket = downloader_proc.stdout.read(131072)

                    if len(dl_bucket) == 0:
                        # downloader data exausted
                        print(f'subinject[{vid_id}]: download date exausted, exiting')
                        # write nothing and break
                        sub_injector_proc.stdin.write(dl_bucket)
                        sub_injector_proc.stdin.close()
                        break

                    # print(f'thread: write {len(dl_bucket)} to injector...')
                    sub_injector_proc.stdin.write(dl_bucket)
                    # print(f'thread: wrote {len(dl_bucket)} to injector!')
            except BrokenPipeError:
                print(f'subinject[{vid_id}]: pipe broken, exiting')
                return

        sub_feeder_thread = threading.Thread(
            target=_feed
        )

        sub_feeder_thread.start()

    try:
        print(f'[{vid_id}]: sending stream')

        if "+" in dl_format:
            print(f"[{vid_id}]: stream will be merged ({dl_format})")
        else:
            print(f"[{vid_id}]: stream will be sent as is ({dl_format})")

        while True:
            if sub_injector_proc is not None:
                # print('read bucket from injector...')
                read, _, _ = select.select([ sub_injector_proc.stdout ], [], [], 1)
                if sub_injector_proc.stdout in read:
                    bucket = os.read(sub_injector_proc.stdout.fileno(), 65536)
                else:
                    # print('not ready to read yet...')
                    await aio_dummy()
                    continue
            else:
                # print('try to read bucket from downloader proc...')
                bucket = downloader_proc.stdout.read(131072)

            if len(bucket) == 0:
                break

            # total += len(bucket)
            # print(f'sending {len(bucket)} bytes... (total sent: {total})')

            # return the result chunk
            yield bucket

            await aio_dummy()

        print(f'[{vid_id}]: end of data (no error reported)')
    except asyncio.CancelledError:
        # this will get thrown because of the dummy future
        print(f'[{vid_id}]: user terminated stream')
    except Exception as error:
        print(f'[{vid_id}]: stream terminated exceptionally: {error}')
    finally:
        print(f"cleanup[{vid_id}]: killing downloader process (PID: {downloader_proc.pid})")

        # kill downloader process
        downloader_proc.terminate()

        # wait for it to die
        downloader_proc.wait()

        if sub_injector_proc is not None:
            print(f"cleanup[{vid_id}]: killing sub injector process (PID: {sub_injector_proc.pid})")

            # kill injector process
            sub_injector_proc.terminate()

            # wait for it to die
            sub_injector_proc.wait()

            # remove subtitles
            print(f"cleanup[{vid_id}]: removing {sub_fname}")
            os.remove(sub_fname)
