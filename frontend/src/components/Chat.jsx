import React, { useState, useRef, useEffect } from 'react';
import { Modal } from 'flowbite-react';

function Chat({ isOpen, onClose }) {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const chatAreaRef = useRef(null);

    const sendMessage = async () => {
        if (!userInput.trim()) return;

        const userMessage = { sender: 'user', message: userInput };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setUserInput('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userInput })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botMessage = { sender: 'bot', message: data.response };
            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = { sender: 'bot', message: "Sorry, there was an error processing your request." };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Modal show={isOpen} onClose={onClose}>
            <Modal.Header>Chat</Modal.Header>
            <Modal.Body>
                <div
                    id="chat-area"
                    ref={chatAreaRef}
                    className="bg-gray-100 rounded-lg p-2 mb-4 h-64 overflow-y-auto"
                >
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={
                                message.sender === 'user'
                                    ? 'text-right mb-2'
                                    : 'text-left mb-2'
                            }
                        >
                            <div
                                className={
                                    message.sender === 'user'
                                        ? 'inline-block bg-blue-200 rounded-lg p-2 max-w-2/3'
                                        : 'inline-block bg-gray-200 rounded-lg p-2 max-w-2/3'
                                }
                            >
                                {message.message}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex">
                    <input
                        type="text"
                        id="user-input"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-grow border rounded-l-lg p-2"
                        placeholder="Type your message..."
                    />
                    <button
                        id="send-button"
                        onClick={sendMessage}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg"
                    >
                        Send
                    </button>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="bg-gray-300 rounded p-2" onClick={onClose}>Close</button>
            </Modal.Footer>
        </Modal>
    );
}

export default Chat;