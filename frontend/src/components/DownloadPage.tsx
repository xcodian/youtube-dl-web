import { Accordion, AccordionDetails, AccordionSummary, Alert, AlertTitle, Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Divider, getIconButtonUtilityClass, IconButton, Link, MenuItem, Select, Stack, Switch, TextField, Tooltip, Typography, useTheme } from '@mui/material';

import LoadingButton from '@mui/lab/LoadingButton';

import React, { useEffect, useRef, useState } from 'react';

import DownloadIcon from "@mui/icons-material/Download";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { AudioSourceMeta, Format, parseVideoURL, VideoMeta, VideoSourceMeta, VideoURL } from '../logic/parseVideo';
import { stringifyNumber } from '../logic/numfmt';
import FormatCard, { NoneDownloadCard } from './DownloadCard';
import { download, getDownloadLink } from '../logic/download';

export default function DownloadPage({ prefill }: { prefill: string | null }) {
    const theme = useTheme();

    const [error, setError] = useState<string | null>(null);
    const [videoURL, setVideoURL] = useState<VideoURL | null>(null);

    const [isMetaLoading, setMetaLoading] = useState<boolean>(false);
    const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);

    const [videoFormatFrom, setVideoFormatFrom] = useState<Format | "none" | null>(null);
    const [audioFormatFrom, setAudioFormatFrom] = useState<Format | "none" | null>(null);

    const [shouldDownloadSubs, setShouldDownloadSubs] = useState<boolean>(false);
    const [targetSubId, setTargetSubId] = useState<string>("");
    const [subFormat, setSubFormat] = useState<string>("srt");

    useEffect(() => {
        // set the video url to the meta gained from prefill
        if (prefill != null) {
            urlChange(prefill);
        }
    }, []);    

    async function queryMeta(id: string) {
        const resp = await fetch(`/api/meta/${id}`);
        
        const meta: VideoMeta = await resp.json();

        meta.formats.reverse(); // make quality first
        
        return meta;
    }

    async function urlChange(url: string) {
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

    async function onTextChange(e: any) {
        const url = e.target.value;
        await urlChange(url);
    }
    
    async function onQueryClick() {
        if (videoURL == null) return;

        setMetaLoading(true);
        try {
            const m = await queryMeta(videoURL.id)
            setVideoMeta(m);

            const sub_keys = Object.keys(m.subs);
            if (sub_keys.length > 0) {
                if (sub_keys.includes("en")) {
                    // try to set format to english if english exists
                    setTargetSubId("en");
                } else {
                    // otherwise try to set sub format to first available sub
                    setTargetSubId(sub_keys[0]);
                }
            }

        } catch (error) {
            setError("Unable to retrieve video metadata.")
        }
        setMetaLoading(false);
    }

    return <>
        <TextField 
            label="Video URL" 
            variant="filled"
            defaultValue={prefill}
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
                <Card variant="outlined" sx={{
                    mb: 3
                }}>
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
                        </Box>
                    </CardActions>
                </Card>

                <Accordion sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: `4px`,
                    boxShadow: 'none',
                    '&:before': {
                        display: 'none',
                    },
                }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography color="text.secondary">Subtitle Options</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {
                            Object.keys(videoMeta.subs).length == 0 
                            ? (
                                <Alert severity='error'>
                                    This video does not have any subtitle tracks.
                                </Alert>
                            )
                            : <>
                                {
                                    (shouldDownloadSubs && videoMeta.subs['live_chat'] != undefined) 
                                    ? <Alert severity='warning' sx={{ mb: 2 }}>
                                        <AlertTitle>
                                            The live chat JSON file is quite large, and cannot be streamed.
                                        </AlertTitle>
                                        It may take a long time for your download to start (around 15 seconds) so wait it out!
                                    </Alert>
                                    : (shouldDownloadSubs && subFormat == "embed")
                                    ? <Alert severity='warning' sx={{ mb: 2 }}>
                                        <AlertTitle>
                                            Embedding subtitles is still experimental
                                        </AlertTitle>
                                        Download speeds may be slower due to subtitle injection!
                                    </Alert>
                                    : null
                                }

                                <Box display="flex" alignItems="center" gap={2} flexWrap='wrap'>
                                    <Switch 
                                        onChange={
                                            (e) => setShouldDownloadSubs(e.target.checked)
                                        }
                                        checked={shouldDownloadSubs}
                                    />
                                    <Typography color={shouldDownloadSubs ? "text.primary" : "text.secondary"}>
                                        {videoMeta.subs['live_chat'] != undefined ? "Separately download live chat JSON for stream" : "Download subtitles for video in "}
                                    </Typography>
                                    {
                                        videoMeta.subs['live_chat'] != undefined ? null : <>
                                            <Select 
                                                disabled={!shouldDownloadSubs} 
                                                value={targetSubId}
                                                onChange={e => {
                                                    setTargetSubId(e.target.value);
                                                }}
                                            >
                                                {
                                                    Object.keys(videoMeta.subs).map(
                                                        (subId, idx) => {
                                                            const name = videoMeta.subs[subId];
                                                            return <MenuItem value={subId}>{name}</MenuItem>
                                                        } 
                                                    )
                                                }
                                            </Select>
                                            <Typography color={shouldDownloadSubs ? "text.primary" : "text.secondary"}>
                                                and 
                                            </Typography>
                                            <Select
                                                disabled={!shouldDownloadSubs} 
                                                value={subFormat}
                                                onChange={e => {
                                                    setSubFormat(e.target.value);
                                                }}
                                            >
                                                <MenuItem value={"embed"}>Embed into video</MenuItem>
                                                <MenuItem value={"srt"}>Export .srt subtitle file</MenuItem>
                                                <MenuItem value={"ass"}>Export .ass subtitle file</MenuItem>
                                                <MenuItem value={"vtt"}>Export .vtt subtitle file</MenuItem>
                                            </Select>
                                        </>
                                    }
                                </Box>
                            </>
                        }

                        
                    </AccordionDetails>
                </Accordion>

                <Typography variant="h5" mt={3} mb={1}>
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
                                        videoURL!.id, f, "none",
                                        shouldDownloadSubs,
                                        targetSubId, subFormat
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

                <Box display="flex" flexWrap='wrap' gap={3}>
                    <Box flexGrow={1}>
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
                    : <>
                        <Tooltip 
                            arrow 
                            title={
                                (videoFormatFrom !== "none" && audioFormatFrom !== "none") ?
                                    "The downloaded file will be a Matroska Video (.mkv) file due to container limitations of mix-and-match-ing audio and video of different formats."
                                : `Will download in format of ${videoFormatFrom === "none" ? "audio" : "video"} stream.`
                            }
                        >
                            <LoadingButton 
                                variant="contained" 
                                endIcon={<DownloadIcon /> } 
                                disabled={ videoFormatFrom == "none" && audioFormatFrom == "none" }
                                fullWidth 
                                sx={{ mt: 3 }}
                                loading={isMetaLoading}
                                size="large"
                                onClick={
                                    () => {
                                        download(
                                            videoURL!.id, 
                                            videoFormatFrom, audioFormatFrom,
                                            shouldDownloadSubs,
                                            targetSubId, subFormat
                                        );
                                    }
                                }
                            >
                                Download Selected
                            </LoadingButton>
                        </Tooltip>
                        <Typography color="text.secondary" mt={3} mb={1}>
                            Note that downloading is done entirely using your browser's download system.
                            If you do not see activity immediately, please wait a few seconds as your browser
                            receives data.
                        </Typography>
                    </>
                }
            </Box>
        }
    </>;
}
