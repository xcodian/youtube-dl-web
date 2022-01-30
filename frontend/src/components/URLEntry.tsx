import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Divider, getIconButtonUtilityClass, IconButton, Link, Stack, TextField, Tooltip, Typography, useTheme } from '@mui/material';

import LoadingButton from '@mui/lab/LoadingButton';

import React, { useRef, useState } from 'react';

import DownloadIcon from "@mui/icons-material/Download";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { AudioSourceMeta, Format, getDownloadLink, parseVideoURL, VideoMeta, VideoSourceMeta, VideoURL } from '../logic/parseVideo';
import { stringifyNumber } from '../logic/numfmt';
import FormatCard, { NoneDownloadCard } from './DownloadCard';
import { download } from '../logic/download';

export default function URLEntry() {
    const theme = useTheme();

    const [error, setError] = useState<string | null>(null);
    const [videoURL, setVideoURL] = useState<VideoURL | null>(null);

    const [isMetaLoading, setMetaLoading] = useState<boolean>(false);
    const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);

    const [videoFormatFrom, setVideoFormatFrom] = useState<Format | "none" | null>(null);
    const [audioFormatFrom, setAudioFormatFrom] = useState<Format | "none" | null>(null);

    async function queryMeta(id: string) {
        const resp = await fetch(`/api/meta/${id}`);
        
        const meta: VideoMeta = await resp.json();

        meta.formats.reverse(); // make quality first
        
        return meta;
    }

    async function onTextChange(e: any) {
        const url = e.target.value;
        
        try {
            setError(null);

            const v = parseVideoURL(url);
            setVideoURL(v);
        } catch (err: any) {
            setError(err.toString());
            setVideoURL(null);
        }

        setVideoMeta(null);
        setVideoFormatFrom(null);
        setAudioFormatFrom(null);
    }
    
    async function onQueryClick(e: any) {
        if (videoURL == null) return;

        setMetaLoading(true);
        try {
            const m = await queryMeta(videoURL.id)
            setVideoMeta(m);
        } catch (error) {
            setError("Unable to retrieve video metadata.")
        }
        setMetaLoading(false);
    }

    return <>
        <TextField 
            label="Video URL" 
            variant="filled"
            error={error != null}
            helperText={error}
            onChange={onTextChange}
            fullWidth
        />

        <LoadingButton 
            variant="contained" 
            // endIcon={<DownloadIcon /> } 
            fullWidth 
            sx={{ mt: 1 }}
            disabled={videoURL == null || videoMeta != null}
            onClick={onQueryClick}
            loading={isMetaLoading}
        >
            Query Metadata
        </LoadingButton>

        {
            videoMeta == null ? null : <Box mt={5}>
                <Card>
                    <CardMedia
                        component="img"
                        height="100px"
                        image={videoMeta.thumbnail}
                        // sx={{
                        //     filter: 'blur(3px)'
                        // }}
                    />
                    <CardHeader
                        avatar={
                            <Link color="inherit" href={`https://youtube.com/user/${videoMeta.author.name}`} underline="none">
                                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                    {videoMeta.author.name[0].toUpperCase()}
                                </Avatar>
                            </Link>
                        }
                        title={videoMeta.title}
                        subheader={<>
                            <Link color="inherit" href={`https://youtube.com/user/${videoMeta.author.name}`} underline="hover">
                                <strong>
                                    {videoMeta.author.name}
                                </strong>
                            </Link>

                            {" (" + stringifyNumber(videoMeta.author.subscribers) + " subscribers)"}
                        </>}
                    />
                    <CardActions>
                        <Box p={1} display="flex">
                            <VisibilityIcon sx={{mr: 1, color: theme.palette.text.secondary}} />
                            <Tooltip arrow title={videoMeta.views.toLocaleString() + " views"}>
                                <Typography>
                                    {stringifyNumber(videoMeta.views)}
                                </Typography>
                            </Tooltip>

                            <ThumbUpIcon sx={{ml: 2, mr: 1, color: theme.palette.text.secondary}} />
                            <Tooltip arrow title={videoMeta.likes.toLocaleString() + " likes"}>
                                <Typography>
                                    {stringifyNumber(videoMeta.likes)}
                                </Typography>
                            </Tooltip>
                        </Box>
                    </CardActions>
                </Card>

                <Typography variant="h5" mt={5} mb={1}>
                    Quick Download
                </Typography>

                <Stack gap={1}>
                    {
                        videoMeta.formats.map((f: Format, i) => {
                            if (f.id.startsWith('sb')) return;
                            if (!(f.audio && f.video)) return;

                            return <FormatCard
                                format={f} 
                                type="use"
                                onClick={()=>{
                                    download(
                                        getDownloadLink(videoURL!.id, f, "none")
                                    )
                                }}
                                key={f.id} 
                                btnText="download"
                            />
                        })
                    }
                </Stack>

                <Divider sx={{ mt: 3, mb: 3, color: theme.palette.text.secondary }}>
                    or
                </Divider>

                <Box display="flex" >
                    <Box mr={3} flexGrow={1}>
                        <Typography variant="h5" mb={1}>
                            Pick your audio
                        </Typography>

                        { 
                            audioFormatFrom != null ? (
                                audioFormatFrom == "none" ? (
                                    <NoneDownloadCard 
                                        title="No Audio" 
                                        onClick={
                                            () => setAudioFormatFrom(null)
                                        } 
                                        type="remove"
                                    />
                                ) : (
                                    <FormatCard 
                                        format={audioFormatFrom} 
                                        onClick={
                                            () => setAudioFormatFrom(null)
                                        } 
                                        type="remove"
                                        btnText=""
                                    />
                                )
                            ): (
                                <Stack gap={1}>
                                    <NoneDownloadCard 
                                        title="No Audio" 
                                        onClick={
                                            () => setAudioFormatFrom("none")
                                        } 
                                        type="use"
                                    />
                                    {
                                        videoMeta.formats.map((f: Format, i) => {
                                            if (f.id.startsWith('sb')) return;
                                            if (!f.audio) return;
                                            if (f.video) return;

                                            return <FormatCard
                                                format={f} 
                                                onClick={
                                                    () => setAudioFormatFrom(f)
                                                } 
                                                type="use"
                                                key={f.id} 
                                                btnText="USE"
                                            />
                                        })
                                    }
                                </Stack>
                            )
                        }
                    </Box>
                    <Box flexGrow={1}>
                        <Typography variant="h5" mb={1}>
                            Pick your video
                        </Typography>

                        { 
                            videoFormatFrom != null ? (
                                videoFormatFrom == "none" ? (
                                    <NoneDownloadCard 
                                        title="No Video" 
                                        onClick={
                                            () => setVideoFormatFrom(null)
                                        } 
                                        type="remove"
                                    />
                                ) : (
                                    <FormatCard 
                                        format={videoFormatFrom} 
                                        onClick={
                                            () => setVideoFormatFrom(null)
                                        } 
                                        type="remove"
                                        btnText=""
                                    />
                                )
                            ): (
                                <Stack gap={1}>
                                    <NoneDownloadCard 
                                            title="No Video" 
                                            onClick={
                                                () => setVideoFormatFrom("none")
                                            } 
                                            type="use"
                                    />
                                    {
                                        videoMeta.formats.map((f: Format, i) => {
                                            if (f.id.startsWith('sb')) return;
                                            if (!f.video) return;
                                            if (f.audio) return;

                                            return <FormatCard 
                                                format={f} 
                                                onClick={
                                                    () => setVideoFormatFrom(f)
                                                } 
                                                type="use"
                                                key={f.id} 
                                                btnText="USE"
                                            />
                                        })
                                    }
                                </Stack>
                            )
                        }                      
                    </Box>
                </Box>

                {
                    videoFormatFrom == null || audioFormatFrom == null ? null
                    : (
                        <>
                            <LoadingButton 
                                variant="contained" 
                                endIcon={<DownloadIcon /> } 
                                disabled={ videoFormatFrom == "none" && audioFormatFrom == "none" }
                                fullWidth 
                                sx={{ mt: 3 }}
                                loading={isMetaLoading}
                                size="large"
                                href={getDownloadLink(videoURL!.id, videoFormatFrom, audioFormatFrom)}
                                download
                            >
                                Download Selected
                            </LoadingButton>
                        </>
                    )
                }
            </Box>
        }
    </>;
}
