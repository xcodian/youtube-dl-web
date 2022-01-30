import asyncio
import subprocess

async def aio_dummy():
    # dummy event to hold up the event loop
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
    except Exception as e:
        # future couldn't proceed
        raise e
    finally:
        # close future handle
        dummy_handle.cancel()
    

async def stream_from_yt(id: str, format: str = "best"):
    proc = subprocess.Popen(
        [
            # request to download with video ID
            "yt-dlp", id, 
            # output to stdout (needed for streaming)
            "-o", "-", 
            # specify output format
            "-f", format,
            # matroska just allows every format possible
            "--merge-output-format", "matroska"
        ],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL # don't fill up server logs
    )

    try:
        print(f'requested start of stream for {id}')
        
        if "+" in format:
            print(f"stream of {id} will be remuxed ({format})")

        while True:
            bucket = proc.stdout.read(131072) # read 128KiB of video

            if len(bucket) == 0:
                break;

            # return the result chunk
            yield bucket

            await aio_dummy()

    except asyncio.CancelledError:
        # this will get thrown because of the dummy future
        print(f'user terminated stream of {id}')
        pass
    finally:
        print(f"killing process of {id} (PID: {proc.pid})")

        # kill the process
        proc.terminate()

        # wait for it to die
        proc.wait()