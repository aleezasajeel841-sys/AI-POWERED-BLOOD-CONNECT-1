import { useState, useEffect, useRef } from "react";
import { Card, Button, TextInput, Spinner, Avatar, Badge } from "flowbite-react";
import { FaRobot, FaPaperPlane, FaSearch, FaInfoCircle } from "react-icons/fa";
import { HiLightningBolt, HiOutlineExternalLink } from "react-icons/hi";
import { useChatbot } from "../hooks/chatbot";
import { toast } from "react-toastify";
import Logo from "../assets/logo.svg";

export default function Chatbot() {
  const { getChatbotResponse, getChatHistory, loading, searchMode, toggleSearchMode } = useChatbot();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    // Add welcome message
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "Hello! I am Echo, Welcome to Blood Connect. I can answer your questions about blood donation or search for information online using Tavily search. How can I help you today?",
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory();
      setChatHistory(history);
    } catch {
      console.error("Failed to load chat history");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    try {
      const response = await getChatbotResponse(inputMessage);
      
      // Check if response contains search results or if search mode is active
      const isSearchResult = searchMode || (response.response && response.response.includes("Source:"));
      
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.response,
        timestamp: new Date(),
        isSearchResult: isSearchResult
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch {
      toast.error("Failed to get response from chatbot");
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "Sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSendMessage();
    }
  };

  // Format message content with links for search results
  const formatMessageContent = (content, isSearchResult) => {
    if (!isSearchResult) return content;
    
    // Split the content by lines
    const lines = content.split('\n');
    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          // Check if line contains a URL
          if (line.includes('Source: http')) {
            const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch) {
              const url = urlMatch[0];
              return (
                <div key={index} className="flex items-center text-xs text-blue-600">
                  <HiOutlineExternalLink className="mr-1" />
                  <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {url.length > 40 ? url.substring(0, 40) + '...' : url}
                  </a>
                </div>
              );
            }
          }
          return <p key={index}>{line}</p>;
        })}
      </div>
    );
  };

  const quickQuestions = [
    "How to donate blood?",
    "What are the requirements?",
    "Blood types information",
    "Find nearest hospital",
    "Eligibility criteria",
    "Benefits of donating"
  ];

  const handleToggleSearchMode = () => {
    const newMode = toggleSearchMode();
    if (newMode) {
      toast.info("Search mode activated! Your questions will be answered using Tavily search.");
    } else {
      toast.info("Standard mode activated. Using predefined responses.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-700 to-red-900 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
            <FaRobot className="mr-3 text-red-300" />
            Echo - Blood Donation Assistant
          </h1>
          <p className="text-red-200">Your AI-powered guide for blood donation information</p>
          
          <div className="mt-3 flex items-center">
            <Badge color={searchMode ? "info" : "gray"} className="mr-2">
              {searchMode ? "Tavily Search Mode" : "Standard Mode"}
            </Badge>
            <Button
              size="xs"
              color={searchMode ? "failure" : "light"}
              onClick={handleToggleSearchMode}
              className="flex items-center"
            >
              {searchMode ? <FaSearch className="mr-1" /> : <HiLightningBolt className="mr-1" />}
              {searchMode ? "Using Tavily Search" : "Enable Tavily Search"}
            </Button>
            <div className="ml-2 text-xs text-red-200 flex items-center">
              <FaInfoCircle className="mr-1" />
              <span className="hidden md:inline">Tavily search provides up-to-date information from the web</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Chat History Sidebar */}
          <aside className="lg:col-span-1 lg:order-first bg-gray-900 min-h-[600px] flex flex-col shadow-xl">
            <div className="flex items-center justify-center py-5 border-b border-gray-700">
              <img src={Logo} alt="Blood Connect Logo" className="w-8 h-8 mr-2" />
              <span className="text-white text-xl font-semibold">Blood Connect</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="flex items-center px-4 py-3 bg-gray-700 text-gray-100">
                <FaSearch className="w-5 h-5 mr-3" />
                <span>Recent Conversations</span>
              </div>
              <div className="space-y-2 px-3 py-3 max-h-96 overflow-y-auto">
                {chatHistory.slice(0, 5).map((chat, index) => (
                  <div key={index} className="text-sm p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
                    <p className="font-medium text-gray-100 truncate">
                      {chat.userMessage}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {chatHistory.length === 0 && (
                  <p className="text-gray-400 text-sm px-1">No previous conversations</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 text-gray-400">
              <h3 className="text-sm font-semibold text-gray-100 mb-3">About Echo</h3>
              <div className="text-xs space-y-2">
                <p>🤖 AI-powered assistant</p>
                <p>🩸 Blood donation expert</p>
                <p>💬 24/7 available</p>
                <p>🇵🇰 Pakistan focused</p>
              </div>
            </div>
          </aside>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="bg-white bg-opacity-95 border-red-100 h-[600px] flex flex-col shadow-xl">
              {/* Messages Area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-red-200 scrollbar-track-transparent"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-md ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                          : message.isSearchResult 
                            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 border border-blue-200"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        {message.type === "user" ? (
                          <Avatar size="xs" rounded className="mr-2" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                            <FaRobot className="text-red-700 text-xs" />
                          </div>
                        )}
                        <span className="text-xs opacity-75 font-medium">
                          {message.type === "user" ? "You" : "Echo"}
                        </span>
                        <span className="text-xs opacity-50 ml-auto">
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        {message.isSearchResult ? (
                          <>
                            <div className="flex items-center mb-1 text-blue-600 text-xs">
                              <FaSearch className="mr-1" />
                              <span>Tavily Search Results</span>
                            </div>
                            {formatMessageContent(message.content, message.isSearchResult)}
                          </>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-md">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <FaRobot className="text-red-700 text-xs" />
                        </div>
                        <Spinner size="sm" color="failure" />
                        <span className="ml-2 text-sm">Echo is {searchMode ? "searching" : "typing"}...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <TextInput
                    type="text"
                    placeholder={searchMode ? "Ask anything about blood donation..." : "Type your message..."}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    disabled={loading}
                    sizing="lg"
                  />
                  <Button
                    gradientDuoTone="redToYellow"
                    onClick={handleSendMessage}
                    disabled={loading || !inputMessage.trim()}
                    className="ml-2 px-4"
                    size="lg"
                  >
                    {loading ? (
                      <Spinner size="sm" />
                    ) : (
                      <FaPaperPlane />
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Questions */}
            <Card className="mt-6 max-w-2xl mx-auto bg-white bg-opacity-95 border-red-100 shadow-xl">
              <h3 className="text-base font-semibold mb-2 text-gray-800 flex items-center">
                <HiLightningBolt className="mr-2 text-red-600" />
                Quick Questions
              </h3>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    gradientDuoTone="pinkToOrange"
                    outline
                    className="w-full justify-start text-left text-sm py-1.5 whitespace-nowrap transition-all hover:shadow-md"
                    onClick={() => {
                      setInputMessage(question);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    disabled={loading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">
                  Try asking about:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge color="purple" className="cursor-pointer" onClick={() => setInputMessage("What is the rarest blood type?")}>
                    Rare blood types
                  </Badge>
                  <Badge color="success" className="cursor-pointer" onClick={() => setInputMessage("How often can I donate blood?")}>
                    Donation frequency
                  </Badge>
                  <Badge color="warning" className="cursor-pointer" onClick={() => setInputMessage("What medications prevent blood donation?")}>
                    Medications
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
