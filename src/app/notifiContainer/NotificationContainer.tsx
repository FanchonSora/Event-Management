import React from 'react';
import styles from './NotificationContainer.module.css'; // Import the CSS module for styling

interface NotificationProps {
    title: string;
    description: string;
}

const NotificationContainer: React.FC<NotificationProps> = ({ title, description }) => {
    return (
        <div className={styles.notificationContainer}>
            <div className={styles.title}>{title}</div>
            <div className={styles.description}>{description}</div>
        </div>
    );
};

export default NotificationContainer;
