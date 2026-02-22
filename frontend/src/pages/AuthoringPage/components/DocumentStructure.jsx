import React from "react";

const DocumentStructure = ({ activeSection, setActiveSection, sections, content, uiConfig }) => {
    return (
        <aside className="auth-sidebar-nav">
            <div className="panel-tag">{uiConfig?.sidebar.structure_title || "..."}</div>
            <div className="sidebar-scroller">
                <div
                    className={`section-row ${activeSection === "toc" ? "active" : ""}`}
                    onClick={() => setActiveSection("toc")}
                >
                    <div className="indicator-dot"></div>
                    <span className="section-title-text">Table of Contents</span>
                </div>
                {sections.map(s => (
                    <div
                        key={s.id}
                        className={`section-row ${activeSection === s.id ? "active" : ""} ${content[s.id]?.length > 0 ? "completed" : ""}`}
                        onClick={() => setActiveSection(s.id)}
                    >
                        <div className="indicator-dot"></div>
                        <span className="section-title-text">{s.title}</span>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default DocumentStructure;
