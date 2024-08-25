export type EventProps = {
    completed: boolean,
    completedEmail: string[],
    code: string,
    admins: string[],
    participants: string[],
    answer: string,
    date: Timestamp,
    imagePath: string,
    description: string,
    id: string,
    location: string,
    name: string,
    quizz: string,
    userId: string,
    [key: string]: any
}