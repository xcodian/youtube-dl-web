# PRODUCTION DOCKERFILE
FROM python:3.10-slim

ENV DEBIAN_FRONTEND=noninteractive

# install pkg deps
RUN apt-get update && apt-get install -y ffmpeg libmagic-dev gcc g++

# bring in Deno javascript runtime for yt-dlp
COPY --from=denoland/deno:bin-2.6.3 /deno /usr/local/bin/deno

# install py deps
COPY ./requirements.txt /tmp/requirements.txt
RUN pip3 --disable-pip-version-check --no-cache-dir install -r /tmp/requirements.txt
RUN rm -v /tmp/requirements.txt
RUN pip3 --disable-pip-version-check --no-cache-dir install -U yt-dlp

# make the nonroot user
RUN useradd user -m -s /usr/sbin/nologin

# copy the source code
WORKDIR /home/user/app
COPY ./src ./

# fix ownership of stuff inside application folder
RUN chown -R user:user .

# run uvicorn as nonroot
USER user
CMD [ "python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "4000", "--no-server-header", "--workers", "8" ]
