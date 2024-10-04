import { observer } from "mobx-react-lite";
import { useState } from "react";
import chatStore from '../stores/ChatStore';
import { useNavigate } from 'react-router-dom';

interface CreateChatProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateChat: React.FC<CreateChatProps> = observer(({ isOpen, onClose }) => {
    const userId = sessionStorage.getItem('user_id');
    const [chatName, setChatName] = useState('');
    const navigate = useNavigate();

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await chatStore.createChat(userId!, chatName);
            if (response.message === "Message created successfully") {
                navigate(`/chat/${response.message_id}`);
                onClose();
            } else {
                alert(response.message);
            }
        } catch (error: any) {
            alert(error);
        }
    };    

    if (!isOpen) return null;

    return(
        <div>
            <h1>Create new chat</h1>
            <form onSubmit={handleCreate}>
                <input
                 type="text"
                 placeholder="Chat Name"
                 value={chatName}
                 onChange={(e) => setChatName(e.target.value)}
                 />
                <button type="submit">Create</button>
            </form>
        </div>
    )
});

export default CreateChat;