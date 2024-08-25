export type EventProps = {
    completed: boolean,
    completedEmail: string[],
    admins: string[],
    participants: string[],
    answer: string,
    date: Timestamp,
    imagePath: string,
    description: string,
    id: string,
    location: string,
    name: string,
    quiz: string,
    userId: string,
    [key: string]: any
}