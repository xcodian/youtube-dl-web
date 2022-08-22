# PRODUCTION DOCKERFILE
FROM python:3.9-slim

# install deps as root
COPY ./requirements.txt /tmp/requirements.txt
RUN pip3  --disable-pip-version-check --no-cache-dir install -r /tmp/requirements.txt
RUN rm -v /tmp/requirements.txt
RUN pip3 install -U yt-dlp

RUN apt update && apt install -y ffmpeg libmagic-dev

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