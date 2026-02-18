from fastapi import FastAPI
from backend.core.orchestrator import Orchestrator
from pydantic import BaseModel

app = FastAPI(title="IDAS Project Backend")

# Initialize Orchestrator
orchestrator = Orchestrator()

class AnalysisRequest(BaseModel):
    text: str

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
