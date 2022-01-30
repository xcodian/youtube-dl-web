import { Box, Button, Card, CardHeader, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { Format } from '../logic/parseVideo';

import VideocamIcon from '@mui/icons-material/Videocam';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from "@mui/icons-material/Download";
import { toTitleCase } from '../logic/titlecase';

export default function FormatCard({ format, onClick, type, btnText }: { format: Format, onClick: any, type: "use" | "remove", btnText: string }) {

    function chips() {
        let s: any[] = [];

        if (format.video) {
            s.push(
                <Tooltip title={'Codec: ' + format.video.codec} arrow>
                    <Chip 
                        label={
                            `${format.video.width}x${format.video.height} (${format.video.fps} FPS)`
                        }
                        icon={
                            <VideocamIcon />
                        }
                    />
                </Tooltip>
            )
        }

        if (format.audio) {
            s.push( 
                <Tooltip title={'Codec: ' + format.audio.codec} arrow>
                    <Chip 
                        label={ `${format.audio.samples} Hz` + (format.audio.rate > 0 ? ` @ ${format.audio.rate.toFixed(2)} Kbps` : "") }
                        icon={<HeadphonesIcon />}
                        sx={{ ml: 1 }}
                    /> 
                </Tooltip>
            )
        }

        return s
    }

    return <Paper variant="outlined">
        <Box 
            display="flex"
            alignItems="center"
            p={2}
        >
            <Tooltip title={`YT Format ID: ${format.id}`} arrow>
                <Typography pr={1} >
                    {toTitleCase(format.note)}
                </Typography>
            </Tooltip>

            {chips()}
            
            <Box flexGrow={1}></Box>

            {
                type == "use" 
                        ? <Button 
                            variant="contained" 
                            startIcon={btnText.toLowerCase() == "download" ? <DownloadIcon /> : <AddIcon/>}
                            onClick={onClick}
                          >
                            {btnText}
                          </Button>
                        : <IconButton onClick={onClick}>
                            <DeleteIcon/>    
                          </IconButton>
            }

        </Box>
    </Paper>
}

export function NoneDownloadCard({ title, onClick, type }: { title: string, onClick: any, type: "use" | "remove"}) {
  return <Paper variant="outlined">
        <Box 
            display="flex"
            alignItems="center"
            p={2}
        >
            <Typography pr={1} >
                {title}
            </Typography>
            
            <Box flexGrow={1}></Box>
            {
                type == "use" ? (
                    <Button 
                        variant="outlined" 
                        startIcon={<AddIcon/>}
                        onClick={onClick}
                    >USE</Button>
                ) : (
                    <IconButton onClick={onClick}>
                        <DeleteIcon/>    
                    </IconButton>
                )
            }
        </Box>
    </Paper>
}