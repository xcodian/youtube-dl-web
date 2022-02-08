# youtube-dl-web
A good web interface for youtube-dl that allows you to download arbitrary mixes of audio and video, including up to the highest quality such as 8K.

### [Go try it here at yt-dlp.us.to!](https://yt-dlp.us.to/)

![Screenshot of the Webpage](images/screenshot_front.png)

## Motive
There is no user-friendly method to download the highest quality of a YouTube video, without errors, and without installing software on your computer.

The web application, **youtube-dl-web** aims to create a user-friendly interface for downloading such videos.

## Features
- Quick Download of pre-encoded YouTube Videos
  
  Most YouTube downloaders would *only* provide the sources that **youtube-dl-web** provides in its Quick Download category.
  Although preservation of quality is important, the Quick Download option is for users who simply just want an mp4, of a decent
  quality, downloaded fast.
 
- Quality Selection

  The most powerful feature of this interface is the ability to select any pair of audio and video for a resulting matroska video file.
  Unfortunately, due to the differing nature of the video and audio containers, matroska is the only option that can be used in order to
  preserve fast download speeds, and original quality. Again, the Quick Download section exists.

- Direct Download Streaming

  Youtube-dl-web never saves a file on the server disk, or makes you wait to start receiving data. As soon as a stream is received from
  YouTube, it immediately starts streaming over to your browser, for a direct download. This also works for the "pick your own" section,
  ensuring download speeds essentially limited only by your network connection.

- Subtitle Download
  
  Download videos with their subtitles in all supported languages, with options to embed directly into the video (experimental) or to export separately as either a .srt, .ass or .vtt file!
  
- User Friendly UI
  
  The UI is modern, easy to use and informative. Arguably the biggest limitation of youtube-dl is the command line interface, as most users
  do not know how to use it, and would often go back to subpar websites for downloading videos, at a lower quality.

- Direct Substitution

  You can simply replace "www.youtube.com" with the tool's URL (keeping the watch?v= part), and it will automatically pick up the video URL you
  are trying to use. 

## Hosting Yourself
If the publicly hosted version of this tool [here](https://yt-dlp.us.to/)
doesn't quite do it for you, you can always self-host this in whatever
configuration you like. The code is public, after all!

### Architecture
Youtube-dl-web relies on three main components:

- The built frontend files, which are served to the user
- The backend API server, which does the downloading
- The NGINX Proxy, which routes requests to the API server, and serves the frontend files

The API server and the NGINX Proxy can most easily be deployed using Docker Compose.
The frontend can be built manually with `yarn`, although a build script
which accomplishes this in a platform independent way (using a temporary Docker container) is included.

### Getting Started
For the hosting experience to be smooth for everyone, youtube-dl-web can be easily deployed using Docker Compose in a secure manner, secluded from your host operating system and without you having to install any dependencies.

#### Step 1: Install Docker and Docker Compose
Verify you have them installed with:
```bash
$ docker --version
Docker version 20.10.12

$ docker-compose --version
Docker Compose version 2.2.3
```

The actual versions don't matter much, just about anything should do!

*If you're on an ARM system, such as a Raspberry Pi (untested) you can install Docker Compose as so:*
```
$ sudo curl -L --fail https://raw.githubusercontent.com/linuxserver/docker-docker-compose/master/run.sh -o /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
```

#### Step 3: Clone this repo

```
$ git clone https://github.com/xxcodianxx/youtube-dl-web
```

#### Step 2: Build Frontend Static Files
This makes sure that all of the HTML is compiled ready for the
webserver to serve.
```
$ cd frontend
$ bash ./build.sh
```

#### Step 3: Start the Docker Compose cluster
This will start all the necessary containers in their environments.
```
$ cd ..
$ docker-compose up -d --build
```

#### That's it!

You can look at your running containers with:
```
$ docker-compose ps
```
And view their logs with:
```
$ docker-compose logs -f
```

### SSL

The steps above describe running youtube-dl-web without SSL, meaning that all traffic sent to and from your webserver is over the internet! 

It's not like there's that much sensitive data being sent over, but it's nice to have HTTPS support.

For home hosting, this is not required at all.

#### Obtaining SSL Certificates
The NGINX config is set up for Let's Encrypt certificates.

Once generated with certbot, they can be found in `/etc/letsencrypt/live/yourdomain.example.net/*.pem`

#### Enabling SSL Support

Add your certificates (files `fullchain.pem` and `privkey.pem`) into the `nginx/certs` directory. You can obtain these from Let's Encrypt with certbot.

First, stop the cluster if you have it running:
```
$ docker-compose down
```

Then, go into the `docker-compose.yml` file and follow the commented directions.

After this, repeat step 3 again, and you should be good to go!