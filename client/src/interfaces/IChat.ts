export interface IChat {
    _id: string;
    user_id: string;
    name: string;
    messages: Message[];
}

export interface Message{
    prompt: string;
    response: string;
    timestamp: string;
}