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
    setActiveHighlightId
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState("Tümü"); 
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
        // Hafızaya sadece mesajı ve öneriyi ekliyoruz (Inputa bu düşecek)
        const textToDrop = `Sorun: ${result.message} - Öneri: ${result.suggestion}`;
        e.dataTransfer.setData("text/plain", textToDrop);
        
        // Görsel efekt: Sürüklerken kart şeffaflaşır
        e.currentTarget.style.opacity = '0.4';
    };

    const handleDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
    };

    // --- Filtreleme Mantığı ---
    const filteredResults = analysisResults.filter(result => {
        if (activeFilter === "Tümü") return true;
        return result.smart_tag === activeFilter;
    });

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
            setMessages(prev => [...prev, { role: 'ai', text: "Bağlantı hatası oluştu." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside className="auth-ai-sidebar" style={{ fontStyle: 'normal' }}>
            <div className="ai-analysis-layer">
                <div className="panel-tag">{uiConfig?.sidebar.analysis_title || "Canlı Analiz Raporu"}</div>
                
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
                            <option value="Tümü">Tüm İhlaller (Sıfırla)</option>
                            <option value="S">Specific (Belirginlik İhlali)</option>
                            <option value="M">Measurable (Ölçülebilirlik İhlali)</option>
                            <option value="A">Attainable (Ulaşılabilirlik İhlali)</option>
                            <option value="R">Relevant (Uygunluk İhlali)</option>
                            <option value="T">Time-bound (Zaman Sınırı İhlali)</option>
                        </select>
                    </div>
                )}

                <div className="warning-scroll-area" style={{ padding: '0 15px' }}>
                    {isAnalyzing ? (
                        <div className="analysis-card loading">Analiz ediliyor...</div>
                    ) : filteredResults.length === 0 ? (
                        <div className="empty-state">Sonuç bulunamadı.</div>
                    ) : (
                        filteredResults.map((result, index) => {
                            
                            // 1. BURASI DÜZELTİLDİ: Backendden ID gelmezse index'ten ID yaratıyoruz.
                            const currentId = result.req_id || `REQ-${index + 1}`;
                            
                            // 2. BURASI DÜZELTİLDİ: Tüm kartların aynı anda sarı olması engellendi.
                            const isActive = activeHighlightId !== null && activeHighlightId === currentId;

                            return (
                                <div 
                                    key={currentId}
                                    className={`requirement-card ${isActive ? 'active' : ''}`}
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, result)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => setActiveHighlightId(currentId)}
                                    style={{
                                        background: isActive ? '#fffbeb' : '#fff',
                                        border: `1px solid ${isActive ? '#f0e4b9' : '#e2e8f0'}`,
                                        borderRadius: '8px',
                                        padding: '15px',
                                        marginBottom: '15px',
                                        boxShadow: isActive ? '0 4px 6px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                                        fontStyle: 'normal',
                                        cursor: 'grab', 
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        {/* 3. BURASI DÜZELTİLDİ: Boş '#' işareti engellendi */}
                                        <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>#{currentId}</span>
                                        {result.smart_tag && (
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

                                    <div className="card-body" style={{ fontSize: '14px', color: '#1e293b', fontStyle: 'normal' }}>
                                        {result.message}
                                    </div>

                                    {result.suggestion && (
                                        <div className="card-footer" style={{ 
                                            marginTop: '12px', paddingTop: '10px', 
                                            borderTop: '1px dashed #e2e8f0', fontSize: '13px',
                                            color: '#1c5d3a', fontStyle: 'normal'
                                        }}>
                                            <strong>Öneri:</strong> {result.suggestion}
                                        </div>
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
                        placeholder="Yardım isteyin..."
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