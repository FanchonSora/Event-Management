import { EventProps } from "../../types";
import './EventContainer.css';

export default function EventContainer({ props }: { props: EventProps }) {
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
        <div className="event-container"> 
            <h1 className="event-title">{props.name}</h1>
            <p className="event-description">{props.description}</p>
            <p className="event-location">{props.location}</p>
            <p className="event-time">{formatDate(props.date)}</p>
        </div>
    );
}
