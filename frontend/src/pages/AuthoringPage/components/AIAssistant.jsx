import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../utils/supabase";

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
    uiConfig,
    activeHighlightId,
    setActiveHighlightId,
    onApplySuggestion,
    isRewriting
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All");
    const chatEndRef = useRef(null);

    const smartLabels = {
        'S': 'Not Specific',
        'M': 'Not Measurable',
        'A': 'Not Achievable',
        'R': 'Not Relevant',
        'T': 'Not Time-bound'
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- Sürükleme Başlangıç Mantığı ---
    const handleDragStart = (e, result) => {
        const textToDrop = `Issue: ${result.message} - Suggestion: ${result.suggestion}`;
        e.dataTransfer.setData("text/plain", textToDrop);
        e.currentTarget.style.opacity = '0.4';
    };

    const handleDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
    };

    // --- Filtreleme Mantığı ---
    const filteredResults = analysisResults.map((result, originalIndex) => ({ ...result, _originalIndex: originalIndex })).filter(result => {
        if (activeFilter === "All") return true;
        return result.smart_tag === activeFilter;
    });

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isLoading) return;
        const userText = chatInput;
        setChatInput("");
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8001/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: userText })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.result }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: "Connection error occurred." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside className="auth-ai-sidebar" style={{ fontStyle: 'normal' }}>
            <div className="ai-analysis-layer">
                <div className="panel-tag">{uiConfig?.sidebar.analysis_title || "Live Analysis Report"}</div>

                {analysisResults.length > 0 && !isAnalyzing && (
                    <div className="filter-container" style={{ padding: '10px 15px' }}>
                        <select
                            className="smart-select"
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                            style={{
                                width: '100%', padding: '8px', borderRadius: '6px',
                                border: '1px solid #ddd', fontSize: '13px',
                                cursor: 'pointer', background: '#f8fafc', fontStyle: 'normal'
                            }}
                        >
                            <option value="All">All Violations (Reset)</option>
                            <option value="S">Specific Violation</option>
                            <option value="M">Measurable Violation</option>
                            <option value="A">Attainable Violation</option>
                            <option value="R">Relevant Violation</option>
                            <option value="T">Time-bound Violation</option>
                        </select>
                    </div>
                )}

                <div className="warning-scroll-area" style={{ padding: '0 15px' }}>
                    {isAnalyzing ? (
                        <div className="analysis-card loading">Analyzing...</div>
                    ) : filteredResults.length === 0 ? (
                        <div className="empty-state">No results found.</div>
                    ) : (
                        filteredResults.map((result) => {
                            const originalIndex = result._originalIndex;
                            const currentId = (result.req_id && result.req_id.trim()) ? result.req_id.trim() : `FR-${String(originalIndex + 1).padStart(2, '0')}`;
                            const isActive = activeHighlightId !== null && activeHighlightId === currentId;
                            const isFixed = result.fixedByAI;
                            const isCurrentlyRewriting = isRewriting === originalIndex;

                            return (
                                <div
                                    key={currentId}
                                    className={`requirement-card ${isActive ? 'active' : ''} ${isFixed ? 'ai-fixed-card' : ''}`}
                                    draggable={!isFixed}
                                    onDragStart={(e) => !isFixed && handleDragStart(e, result)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => setActiveHighlightId(currentId)}
                                    style={{
                                        background: isFixed ? '#f0fdf4' : (isActive ? '#fffbeb' : '#fff'),
                                        border: `1px solid ${isFixed ? '#bbf7d0' : (isActive ? '#f0e4b9' : '#e2e8f0')}`,
                                        borderRadius: '8px',
                                        padding: '15px',
                                        marginBottom: '15px',
                                        boxShadow: isActive ? '0 4px 6px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                                        fontStyle: 'normal',
                                        cursor: isFixed ? 'default' : 'grab',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>#{currentId}</span>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            {isFixed && (
                                                <span className="ai-fixed-badge">AI Fixed</span>
                                            )}
                                            {result.smart_tag && !isFixed && (
                                                <span style={{
                                                    fontSize: '11px', background: '#fee2e2', color: '#ef4444',
                                                    padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold'
                                                }}>
                                                    {(() => {
                                                        const safeTag = result.smart_tag ? result.smart_tag.trim().charAt(0).toUpperCase() : "";
                                                        return smartLabels[safeTag] || 'Rule Violation';
                                                    })()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {isFixed ? (
                                        <>
                                            {/* AI Fixed: Orijinal metin */}
                                            <div className="original-text-display">
                                                <span className="original-label">Original:</span>
                                                <p>{result.originalText}</p>
                                            </div>
                                            {/* AI Fixed: Yeni metin */}
                                            <div className="ai-rewritten-text">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span className="ai-label">AI Rewritten:</span>
                                                    <button
                                                        className="copy-ai-text-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(result.aiText);
                                                            const btn = e.currentTarget;
                                                            btn.textContent = '✓ Copied!';
                                                            setTimeout(() => { btn.textContent = '📋 Copy'; }, 1500);
                                                        }}
                                                    >
                                                        📋 Copy
                                                    </button>
                                                </div>
                                                <p>{result.aiText}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="card-body" style={{ fontSize: '14px', color: '#1e293b', fontStyle: 'normal' }}>
                                                {result.message}
                                            </div>

                                            {result.suggestion && (
                                                <div className="card-footer" style={{
                                                    marginTop: '12px', paddingTop: '10px',
                                                    borderTop: '1px dashed #e2e8f0', fontSize: '13px',
                                                    color: '#1c5d3a', fontStyle: 'normal'
                                                }}>
                                                    <strong>Suggestion:</strong> {result.suggestion}
                                                </div>
                                            )}

                                            {result.suggestion && onApplySuggestion && (
                                                <button
                                                    className="apply-suggestion-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onApplySuggestion(originalIndex);
                                                    }}
                                                    disabled={isCurrentlyRewriting}
                                                >
                                                    {isCurrentlyRewriting ? "Rewriting..." : "Apply Suggestion"}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* SOHBET KISMI */}
            <div
                className={`ai-chat-layer ${isDraggingOver ? 'drag-over' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={(e) => {
                    e.preventDefault();
                    const text = e.dataTransfer.getData("text/plain");
                    if (text) {
                        setChatInput(text);
                    }
                    onDragLeave();
                }}
            >
                <div className="panel-tag">AI Chat</div>
                <div className="chat-history-area" style={{ fontStyle: 'normal' }}>
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-msg-bubble ${m.role}`} style={{ fontStyle: 'normal' }}>{m.text}</div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <div className="chat-input-bar">
                    <input
                        type="text"
                        placeholder="Ask for help..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage}>➤</button>
                </div>
            </div>
        </aside>
    );
};

export default AIAssistant;