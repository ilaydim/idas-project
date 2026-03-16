from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from backend.core.orchestrator import Orchestrator
from backend.utils.parser import DocumentParser
from pydantic import BaseModel

app = FastAPI(title="IDAS Project Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Orchestrator
orchestrator = Orchestrator()

class AnalysisRequest(BaseModel):
    text: str

class RewriteRequest(BaseModel):
    text: str
    issue: str
    suggestion: str

@app.get("/")
def read_root():
    return {"message": "IDAS Backend is running"}

@app.post("/analyze")
def analyze_requirement(request: AnalysisRequest):
    result = orchestrator.process(request.text, task_type="analyze")
    return {"result": result}

@app.post("/check-template")
def check_template(request: AnalysisRequest):
    result = orchestrator.process(request.text, task_type="check_template")
    return {"result": result}

@app.post("/check-glossary")
def check_glossary(request: AnalysisRequest):
    result = orchestrator.process(request.text, task_type="check_glossary")
    return {"result": result}

@app.post("/draft")
def draft_requirements(request: AnalysisRequest):
    result = orchestrator.process(request.text, task_type="draft")
    return {"result": result}

@app.post("/classify")
def classify_requirement(request: AnalysisRequest):
    result = orchestrator.process(request.text, task_type="classify")
    return {"result": result}

@app.post("/audit")
def audit_requirement(request: AnalysisRequest):
    result = orchestrator.process(request.text, task_type="audit")
    return {"result": result}

@app.post("/resolve")
def resolve_issue(request: AnalysisRequest):
    result = orchestrator.process(request.text, task_type="resolve")
    return {"result": result}

@app.get("/templates")
def get_templates():
    import json
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    templates_path = os.path.join(current_dir, "data", "templates.json")
    with open(templates_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/session")
def get_session():
    import json
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    session_path = os.path.join(current_dir, "data", "session.json")
    with open(session_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.post("/session")
def save_session(data: dict):
    import json
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    session_path = os.path.join(current_dir, "data", "session.json")
    with open(session_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return {"status": "success"}

@app.get("/ui-config")
def get_ui_config():
    import json
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(current_dir, "data", "ui_config.json")
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.post("/chat")
def chat_with_ai(request: AnalysisRequest):
    result = orchestrator.process(request.text, task_type="chat")
    return {"result": result}

@app.post("/upload-review")
async def upload_review(file: UploadFile = File(...)):
    try:
        content = await file.read()
        parsed_text = DocumentParser.parse(file.filename, content)
        result = orchestrator.process(parsed_text, task_type="review")
        return result
    except Exception as e:
        return {"error": str(e)}

@app.post("/rewrite")
def rewrite_requirement(request: RewriteRequest):
    result = orchestrator.process(
        request.text, 
        task_type="rewrite", 
        issue=request.issue, 
        suggestion=request.suggestion
    )
    return {"result": result}


