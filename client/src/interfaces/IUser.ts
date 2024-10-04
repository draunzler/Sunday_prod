export interface IUser {
    id: string;
    name: string;
    token?: string;
    email: string;
    messages: IMessage[];
}

export interface IMessage{
    _id: string;
    message_name: string;
    created: string;
}