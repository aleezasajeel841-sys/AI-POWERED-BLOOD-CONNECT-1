import React, { useState } from 'react';
import Chat from './Chat'; // Import the Chat component


function SupportIcon() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <div>
            <button
                onClick={toggleChat}
                className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full z-50"
            >
                Support
            </button>
            <Chat isOpen={isChatOpen} onClose={toggleChat} />
        </div>
    );
}

export default SupportIcon;