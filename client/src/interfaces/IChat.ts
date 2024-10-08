export interface IChat {
    _id: string;
    user_id: string;
    name: string;
    messages: Message[];
    total_messages: number;
    page: number;
    limit: number;
}

export interface Message{
    prompt: string;
    response: string;
    timestamp: string;
}