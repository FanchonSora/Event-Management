import { EventProps } from "../../types";
import './EventContainer.css';
import { Card, CardContent, Typography, CardOverflow, AspectRatio, Divider, Button, CardActions } from "@mui/joy";
import { CalendarToday, Place, Person } from "@mui/icons-material";

export default function EventContainer({ props, onClick }: { props: EventProps, onClick: () => void }) {
    // Function to handle different types of date
    const formatDate = (date: any) => {
        if (date instanceof Date) {
            // If date is a JavaScript Date object
            return date.toDateString();
        } else if (date && typeof date.toDate === 'function') {
            // If date is a Firestore Timestamp
            return date.toDate().toDateString();
        } else if (date && typeof date === 'string') {
            // If date is a string
            return new Date(date).toDateString();
        } else {
            // Default case
            return 'Date not available';
        }
    };

    return (
        <Card variant="outlined" sx={{ width: 320 }}>
            <CardOverflow>
                <AspectRatio>
                    <img src="https://images.unsplash.com/photo-1532614338840-ab30cf10ed36?auto=format&fit=crop&w=318" alt={props.name} loading="lazy" />
                </AspectRatio>
            </CardOverflow>
            <CardContent>
                <Typography level="h3">{props.name}</Typography>
                <Typography level="body-xs" className="flex items-center"><Place className="me-1" />{props.location}</Typography>
            </CardContent> 
            <CardOverflow>
                <Divider inset="context" />
                <CardContent orientation="horizontal">
                    <Typography level="body-sm" className="flex items-center">
                        <CalendarToday className="me-1" />{formatDate(props.date)}
                    </Typography>
                    <Divider orientation="vertical" />
                    <Typography level="body-sm" className="flex items-center">
                        <Person className="me-1" />Registered: 0
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button onClick={onClick} size="sm">View Event</Button>
                </CardActions>
            </CardOverflow>
        </Card>
    );
}
