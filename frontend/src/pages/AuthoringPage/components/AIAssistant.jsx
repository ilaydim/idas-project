import React, { useState, useEffect, useRef } from "react";

const AIAssistant = ({
    messages,
    setMessages,
    chatInput,
    setChatInput,
    isDraggingOver,
    onDragOver,
    onDragLeave,
    onDrop,
    analysisResults = [],
    isAnalyzing = false,
    uiConfig
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isLoading) return;

        const userText = chatInput;
        setChatInput("");

        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8088/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: userText })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.result }]);
        } catch (error) {
            console.error("Chat error:", error);
            let errorMessage = "An error occurred while sending the message.";
            if (error.message.includes("Failed to fetch")) {
                errorMessage = "Cannot connect to backend. Please ensure the backend is running.";
            }
            setMessages(prev => [...prev, { role: 'ai', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleDragStart = (e, issueText) => {
        e.dataTransfer.setData("issueText", issueText);
    };

    return (
        <aside className="auth-ai-sidebar">
            <div className="ai-analysis-layer">
                <div className="panel-tag">{uiConfig?.sidebar.analysis_title || "..."}</div>
                <div className="warning-scroll-area">
                    {isAnalyzing && (
                        <div className="analysis-card loading">
                            <p>Analiz ediliyor...</p>
                        </div>
                    )}

                    {!isAnalyzing && analysisResults.length === 0 && (
                        <div className="analysis-card empty">
                            <p>Yazmaya başlayın, AI gereksinimlerinizi analiz etsin.</p>
                        </div>
                    )}

                    {analysisResults.map((result, index) => (
                        <div
                            key={index}
                            className="analysis-card warning"
                            draggable
                            onDragStart={(e) => handleDragStart(e, result)}
                        >
                            <div className="card-head"><strong>Analysis #{index + 1}</strong></div>
                            <p>{result}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div
                className={`ai-chat-layer ${isDraggingOver ? 'drag-over' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={async (e) => {
                    setIsLoading(true);
                    await onDrop(e);
                    setIsLoading(false);
                }}
            >
                <div className="panel-tag">{uiConfig?.sidebar.chat_title || "..."}</div>
                <div className="chat-history-area">
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-msg-bubble ${m.role}`}>{m.text}</div>
                    ))}
                    {isLoading && (
                        <div className="chat-msg-bubble ai typing">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="chat-input-bar">
                    <input
                        type="text"
                        placeholder="Ask for help..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSendMessage}
                        disabled={isLoading}
                    >
                        {isLoading ? "..." : "➤"}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AIAssistant;
