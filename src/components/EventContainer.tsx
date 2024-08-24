import { title } from "process";
import { EventProps } from "../../types";
import './EventContainer.css';

export default function EventContainer({ props } : { props: EventProps }) {
    return (
        <div className="event-container"> 
            <h1 className="event-title">{props.name}</h1>
            <p className="event-description">{props.description}</p>
            <p className="event-location"> {props.location}</p>
            <p className="event-time">{props.date.toDate().toDateString()}</p>
        </div>
        
    );
}