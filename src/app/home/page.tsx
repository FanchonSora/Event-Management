"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db, storageRef } from "@/firebaseClient/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import './HomePage.css';
import EventContainer from "../../components/EventContainer";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseClient/firebase";
import type { EventProps } from "../../../types";
import { Menu, Notifications, EventAvailable, CheckCircle, AddCircle } from "@mui/icons-material";
import { LinearProgress, Box, TextField, Button } from "@mui/material";

export default function Home() {
    const router = useRouter();
    const { user } = useAuth();
    const [events, setEvents] = useState<EventProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationInputOpen, setNotificationInputOpen] = useState(false);
    const [notifications, setNotifications] = useState<{ title: string; description: string }[]>([]);
    const [newNotification, setNewNotification] = useState({ title: '', description: '' });

    const contentWrapperRef = useRef<HTMLDivElement>(null);
    const scrollbarThumbRef = useRef<HTMLDivElement>(null);

    const handleViewEventClick = (eventId: string) => {
        router.push(`/${eventId}`);
    };

    const handleSignOut = () => {
        localStorage.removeItem("user");
        signOut(auth);
        router.push("/auth");
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleNotifications = () => {
        setNotificationsOpen(!notificationsOpen);
    };

    const toggleNotificationInput = () => {
        setNotificationInputOpen(!notificationInputOpen);
    };

    const handleNotificationSubmit = () => {
        if (newNotification.title && newNotification.description) {
            setNotifications([...notifications, newNotification]);
            setNewNotification({ title: '', description: '' });
            setNotificationInputOpen(false);
        }
    };

    useEffect(() => {
        if (!user) {
            router.push("/auth");
        }

        const unsubscribe = onSnapshot(collection(db, "events"), async (snapshot) => {
            const data = snapshot.docs.map(async (doc: any): Promise<EventProps> => {
                const current = doc.data();
                if (current.imagePath && current.imagePath !== "") {
                    const imageRef = ref(storageRef, doc.data().imagePath);
                    const imageUrl = await getDownloadURL(imageRef);
                    current.imagePath = imageUrl;
                }
                return ({ id: doc.id, ...current });
            });

            Promise.all(data).then((data) => {
                setEvents(data);
                setIsLoading(() => {
                    console.log("Loaded");
                    return false;
                });
            });
        });

        return () => unsubscribe();
    }, [router, user]);

    useEffect(() => {
        // Example notification data, replace with actual notification fetching logic
        setNotifications([
            { title: "Thông báo chạy trạm", description: "Các đội hãy lên chiến lược cũng như đọc kỹ thông tin trò chơi ở các trạm nhé, chúng ta ưu tiên điểm mạnh của đội để giải các câu đố cũng như hoàn thành nhiệm vụ ở các trạm nhé <3" },
            { title: "Thông báo chạy trạm", description: "Trạm sẽ có hai phần một là trò chơi hoàn thành ở trạm để nhận được mật thư và giải mật thư nên nếu không thể giải được mật thư hãy di chuyển đến trạm kế tiếp được đề cập" },
            { title: "Cách sử dụng web", description: "Sẽ có các sự kiện các đội bấm vào 'view event' để biết thêm thông tin cũng như thể lệ cách chơi ở trạm kế tiếp để nghĩ chiến lược, 'join event' chỉ nên bấm vào khi mấy đứa đã hoàn thành xong trò chơi ở trạm và nhận mật thư, nhập đáp án của mật thư vào ô trả lời, nếu đã lỡ bấm vô và out ra thì mấy đứa sẽ bị mất quyền trả lời cho mật thư đó nên cẩn thận !!!" },
            { title: "Lưu ý", description: "Nếu có sự cố gì về y tế hãy liên lạc cho số điện thoại thông tin ở sau tấm thẻ và thông báo vị trí của đội cho ban tổ chức hỗ trợ !!!" }
        ]);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (contentWrapperRef.current && scrollbarThumbRef.current) {
                const content = contentWrapperRef.current;
                const thumb = scrollbarThumbRef.current;
                const contentHeight = content.scrollHeight;
                const containerHeight = content.clientHeight;
                const scrollTop = content.scrollTop;

                const thumbHeight = Math.max((containerHeight / contentHeight) * containerHeight, 30); // Minimum height for thumb
                const thumbTop = (scrollTop / (contentHeight - containerHeight)) * (containerHeight - thumbHeight);

                thumb.style.height = `${thumbHeight}px`;
                thumb.style.top = `${thumbTop}px`;
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (scrollbarThumbRef.current && contentWrapperRef.current) {
                const thumb = scrollbarThumbRef.current;
                const content = contentWrapperRef.current;
                const thumbTop = Math.max(0, Math.min(e.clientY - thumb.offsetHeight / 2, content.scrollHeight - content.clientHeight));
                thumb.style.top = `${thumbTop}px`;
                content.scrollTop = (thumbTop / (content.scrollHeight - content.clientHeight)) * content.scrollHeight;
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        };

        const thumb = scrollbarThumbRef.current;
        thumb?.addEventListener("mousedown", handleMouseDown);

        if (contentWrapperRef.current) {
            const content = contentWrapperRef.current;
            content.addEventListener("scroll", handleScroll);
            handleScroll(); // Initial update
            return () => {
                content.removeEventListener("scroll", handleScroll);
                thumb?.removeEventListener("mousedown", handleMouseDown);
            };
        }
    }, []);

    return (
        <main className="pageContainer">
            <div className="page-wrapper">
                <span className="menu-icon absolute" onClick={toggleMenu}><Menu /></span>
                <header className="page-title">Events</header>
            </div>
            {menuOpen && (
                <div className="menu-container">
                    <span className="menu-item" onClick={toggleNotifications}>
                        <Notifications /> Notifications
                    </span>
                    <span className="menu-item" onClick={() => router.push('/campSchedule')}>
                        <EventAvailable /> Camp Schedule
                    </span>
                    <span className="menu-item" onClick={() => router.push('/eventsCreated')}>
                        <EventAvailable /> My Created Events
                    </span>
                    <span className="menu-item" onClick={() => router.push('/eventsCompleted')}>
                        <CheckCircle /> Completed Events
                    </span>
                    <span className="menu-item" onClick={() => router.push('/eventsCreate')}>
                        <AddCircle /> Create Event
                    </span>
                    <span className="menu-item" onClick={toggleNotificationInput}>
                        <AddCircle /> Create Notification
                    </span>
                    <span className="menu-item" onClick={handleSignOut}>Sign Out</span>
                </div>
            )}
            <div className={`notifications-container ${notificationsOpen ? 'active' : ''}`}>
                {notifications.map((notification, index) => (
                    <div key={index} className="notification-container">
                        <h3 className="notification-title">{notification.title}</h3>
                        <p className="notification-description">{notification.description}</p>
                    </div>
                ))}
            </div>
            {notificationInputOpen && (
                <div className={`notification-input-container ${notificationInputOpen ? 'active' : ''}`}>
                    <TextField
                        label="Title"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    />
                    <TextField
                        label="Description"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        value={newNotification.description}
                        onChange={(e) => setNewNotification({ ...newNotification, description: e.target.value })}
                    />
                    <Button variant="contained" color="primary" onClick={handleNotificationSubmit}>
                        Add Notification
                    </Button>
                </div>
            )}
            <div className="content-wrapper" ref={contentWrapperRef}>
                {
                    isLoading ?
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />
                        </Box> :
                        <div className="events-container">
                        {events.map((event) => (
                            <div key={event.id} className="event-container-outer">
                                <EventContainer props={event} onClick={() => handleViewEventClick(event.id)} />
                            </div>
                        ))}
                    </div>
                    
                }
            </div>
            <div className="scrollbar-container">
                <div className="scrollbar-thumb" ref={scrollbarThumbRef} />
            </div>
        </main>
    );
}
