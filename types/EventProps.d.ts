export type EventProps = {
    completed: boolean,
    completedEmail: string[],
    admins: string[],
    asnwer: string,
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