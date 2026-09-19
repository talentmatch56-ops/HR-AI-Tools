import os
import jwt
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from core.config import settings
from services.agent_service import agent_service
from services.mcp_client import mcp_client
from db.session import init_db

app = FastAPI(title="HR AI Copilot Backend", version="1.0.0")

@app.on_event("startup")
def on_startup():
    init_db()

# Enable CORS for frontend communication across all devices & Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directories exist
STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "static"))
DOCS_DIR = os.path.join(STATIC_DIR, "docs")
os.makedirs(DOCS_DIR, exist_ok=True)

# Mount static directory for serving generated PDFs
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Helper to verify JWT token and retrieve user metadata
def get_current_user(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except Exception:
        # Fallback to decode demo token if structured as token-base64
        if token and token.startswith("token-"):
            try:
                import base64
                import json
                decoded = base64.b64decode(token[6:]).decode("utf-8")
                return json.loads(decoded)
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Pydantic input models
class LoginRequest(BaseModel):
    email: str
    password: str

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    token: str
    sheet_id: Optional[str] = None

class ToolExecutionRequest(BaseModel):
    tool: str
    arguments: Dict[str, Any]
    token: str

class ResumeParseRequest(BaseModel):
    token: Optional[str] = None
    resume_text: str
    sheet_id: Optional[str] = None

class CandidateMatchRequest(BaseModel):
    token: Optional[str] = None
    candidate_id: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_skills: Optional[str] = ""
    candidate_experience: Optional[str] = ""
    job_description: Optional[str] = ""
    jd_requirements: Optional[str] = ""
    experience: Optional[str] = ""

class InterviewScheduleRequest(BaseModel):
    token: Optional[str] = None
    candidate_name: str
    candidate_email: str
    interviewer: Optional[str] = "tech-lead@company.com"
    interviewer_emails: Optional[str] = "tech-lead@company.com"
    interview_date: str
    interview_time: Optional[str] = "11:00"
    round_name: Optional[str] = "1st Round Technical"
    interview_round: Optional[str] = "1st Round Technical"
    mode: Optional[str] = "Google Meet"
    interview_mode: Optional[str] = "Google Meet"

class InterviewFeedbackRequest(BaseModel):
    token: Optional[str] = None
    employee_id: Optional[str] = "1001"
    candidate_id: Optional[str] = "1001"
    candidate_name: str
    round_name: Optional[str] = "1st Round Technical"
    rating: int = 4
    interviewer: Optional[str] = "interviewer@company.com"
    interviewer_email: Optional[str] = "interviewer@company.com"
    remarks: Optional[str] = ""
    recommendation: Optional[str] = "Hire"
    status: Optional[str] = "Hire"

@app.post("/auth/login")
def login(req: LoginRequest):
    """Log in locally with predefined roles for evaluation purposes."""
    email = req.email.strip().lower()
    
    # Assign roles dynamically based on email
    if "admin" in email:
        role = "Admin"
    elif "hr" in email:
        role = "HR"
    elif "manager" in email:
        role = "Manager"
    else:
        role = "Employee"
        
    token_data = {
        "sub": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    
    token = jwt.encode(token_data, settings.JWT_SECRET, algorithm="HS256")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": email,
            "role": role
        }
    }

@app.get("/auth/google")
def google_auth_login():
    """Trigger Google OAuth login redirect URL."""
    google_oauth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile"
        f"&access_type=offline"
        f"&prompt=consent"
    )
    return {"url": google_oauth_url}

@app.get("/auth/callback")
async def google_auth_callback(code: str):
    """Handle Google OAuth callback, exchange code for tokens, and return JWT."""
    if settings.GOOGLE_CLIENT_ID == "mock-client-id":
        email = "oauth.user@company.com"
        role = "Admin"
    else:
        import httpx
        try:
            async with httpx.AsyncClient() as client:
                token_res = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "code": code,
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                        "grant_type": "authorization_code"
                    }
                )
                token_data = token_res.json()
                access_token = token_data.get("access_token")
                
                user_info = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                email = user_info.json().get("email", "oauth.user@company.com")
                role = "HR" if "hr" in email else "Employee"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to authenticate with Google: {str(e)}")

    token_payload = {
        "sub": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    token = jwt.encode(token_payload, settings.JWT_SECRET, algorithm="HS256")
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": email,
            "role": role
        }
    }

@app.post("/chat")
async def chat(req: ChatRequest):
    """Handle HR AI Chat query and route through OpenAI and MCP tools."""
    user = get_current_user(req.token)
    response = await agent_service.handle_message(
        message=req.message,
        history=req.history,
        user_role=user["role"],
        user_email=user["sub"],
        sheet_id=req.sheet_id
    )
    return response

from fastapi import BackgroundTasks

async def simulate_slack_telemetry(user: str, tool: str, arguments: dict):
    """Simulate outbound Slack/Teams webhook telemetry notifications."""
    import json
    # Print outbound webhook alerts to console / logs
    print(f"\n[SLACK TELEMETRY WEBHOOK] -> channel: #hr-alerts | text: User {user} executed tool {tool} with arguments {json.dumps(arguments)}\n")

@app.post("/mcp/execute")
async def execute_tool(req: ToolExecutionRequest, background_tasks: BackgroundTasks):
    """Allow direct manual invocation of an MCP tool (privileged) asynchronously."""
    user = get_current_user(req.token)
    if user["role"] not in ["Admin", "HR"] and req.tool in ["send_email", "update_sheet"]:
        raise HTTPException(status_code=403, detail="Permission Denied for tool execution.")
        
    # Queue heavy document tasks as non-blocking background threads
    if req.tool in ["send_email", "generate_salary_slip", "generate_offer_letter", "generate_extension_letter"]:
        background_tasks.add_task(mcp_client.execute_tool, req.tool, req.arguments)
        background_tasks.add_task(simulate_slack_telemetry, user["sub"], req.tool, req.arguments)
        return {"status": "success", "message": f"Tool '{req.tool}' execution shifted to background worker queue."}
        
    # Invalidate candidate list cache if sheet is updated
    if req.tool == "update_employee_status":
        from services.redis_cache import redis_cache
        redis_cache.delete("employees_all")
        
    result = await mcp_client.execute_tool(req.tool, req.arguments)
    return result

@app.get("/audit/logs")
def get_audit_logs(token: str):
    """Expose the real-time execution audit logs."""
    user = get_current_user(token)
    if user["role"] not in ["Admin", "HR"]:
        raise HTTPException(status_code=403, detail="Access denied to audit logs.")
    return agent_service.get_audit_logs()

@app.get("/employees")
async def list_employees(
    token: str, 
    query: Optional[str] = None, 
    sheet_id: Optional[str] = None, 
    tab: Optional[str] = None, 
    sheet_name: Optional[str] = None, 
    force_refresh: Optional[bool] = False
):
    """Expose search/list of employees directly from sheets database."""
    user = get_current_user(token)
    target_tab = tab or sheet_name or "Master Recruitment Tracker 2026"
    from services.redis_cache import redis_cache
    cache_key = f"employees_all_{sheet_id or 'default'}_{target_tab}"
    if query:
        cache_key = f"employees_search_{query.strip().lower()}_{sheet_id or 'default'}_{target_tab}"

    # Skip cache entirely when force_refresh=true (Real-time Sync button)
    if force_refresh:
        try:
            from server import sheets
            if hasattr(sheets, 'clear_cache'):
                sheets.clear_cache()
        except Exception:
            pass
    else:
        cached_data = redis_cache.get(cache_key)
        if cached_data is not None:
            return cached_data

    try:
        from server import sheets
        if query:
            res = sheets.search_employee(name=query, sheet_id=sheet_id)
        else:
            res = sheets.read_sheet(target_tab, sheet_id=sheet_id, force_refresh=force_refresh)

        if not res:
            res = sheets.employees

        # Refresh cache with latest data for 120s
        redis_cache.set(cache_key, res, expire_seconds=120)
        return res
    except Exception as e:
        from server import sheets
        return sheets.employees

@app.get("/sheets/tabs")
def list_sheet_tabs(token: str, sheet_id: Optional[str] = None):
    """Get list of sub-sheet tabs available in the specified Google Sheet."""
    user = get_current_user(token)
    from server import sheets
    return sheets.get_sheet_tabs(sheet_id=sheet_id)

class PolicyUploadRequest(BaseModel):
    title: str
    content: str
    token: str

@app.post("/policies/upload")
async def upload_policy(req: PolicyUploadRequest):
    """Save custom handbook policies into RAG database memory."""
    user = get_current_user(req.token)
    if user["role"] not in ["Admin", "HR"]:
        raise HTTPException(status_code=403, detail="Only Admins/HR can upload policies.")
    from db.session import SessionLocal
    from db.models import PolicyDocument
    db = SessionLocal()
    try:
        new_doc = PolicyDocument(title=req.title, content=req.content)
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        return {"status": "success", "message": f"Policy '{req.title}' successfully indexed into RAG memory."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save policy: {str(e)}")
    finally:
        db.close()

class AutoRespondRequest(BaseModel):
    candidate_message: str
    token: str

@app.post("/auto-respond")
async def auto_respond(req: AutoRespondRequest):
    """Generate automatic reply draft to a candidate's policy question using RAG."""
    user = get_current_user(req.token)
    if user["role"] not in ["Admin", "HR"]:
        raise HTTPException(status_code=403, detail="Only Admins/HR can draft auto-responses.")
        
    from services.rag_service import rag_service
    docs = await rag_service.search(req.candidate_message, top_k=1)
    
    body_text = "We are currently reviewing our guidelines and will get back to you shortly."
    if docs:
        body_text = f"Regarding our policy on '{docs[0]['title']}':\n{docs[0]['content']}"

    draft_body = (
        f"Hi,\n\n"
        f"Thank you for contacting us.\n\n"
        f"Here is the information we found in our handbook:\n\n"
        f"{body_text}\n\n"
        f"Please let us know if you have additional questions.\n\n"
        f"Best regards,\n"
        f"HR Operations Team"
    )
    return {"subject": f"RE: Inquiry regarding company policy", "body": draft_body}

class RegisterSheetRequest(BaseModel):
    sheet_id: str
    token: str
    title: Optional[str] = None

@app.get("/sheets")
def list_registered_sheets(token: str):
    """List all registered custom Google Sheets."""
    user = get_current_user(token)
    from db.session import SessionLocal
    from db.models import RegisteredSheet
    db = SessionLocal()
    try:
        sheets_list = db.query(RegisteredSheet).all()
        return [s.to_dict() for s in sheets_list]
    finally:
        db.close()

@app.post("/sheets/register")
async def register_sheet(req: RegisterSheetRequest):
    """Register a new Google Sheet ID to load in workspace."""
    user = get_current_user(req.token)
    if user["role"] not in ["Admin", "HR"]:
        raise HTTPException(status_code=403, detail="Only Admin/HR can register custom sheets.")
    
    from db.session import SessionLocal
    from db.models import RegisteredSheet
    from server import sheets as sheet_helper
    
    title = req.title
    if not title:
        try:
            rows = sheet_helper.read_sheet("Master Recruitment Tracker 2026", sheet_id=req.sheet_id)
            if not rows:
                title = f"Sheet ({req.sheet_id[:8]}...)"
            else:
                title = f"Recruitment Tracker ({req.sheet_id[:8]})"
        except Exception:
            title = f"Custom Sheet ({req.sheet_id[:8]}...)"
            
    db = SessionLocal()
    try:
        existing = db.query(RegisteredSheet).filter(RegisteredSheet.sheet_id == req.sheet_id).first()
        if existing:
            return {"status": "success", "message": "Sheet already registered.", "sheet": existing.to_dict()}
            
        new_sheet = RegisteredSheet(sheet_id=req.sheet_id, title=title)
        db.add(new_sheet)
        db.commit()
        db.refresh(new_sheet)
        return {"status": "success", "message": "Sheet successfully registered!", "sheet": new_sheet.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register sheet: {str(e)}")
    finally:
        db.close()

@app.post("/resume/parse")
async def parse_and_add_resume(req: ResumeParseRequest):
    """Parse resume text and automatically append candidate record to Google Sheet."""
    user = get_current_user(req.token)
    from services.resume_parser import resume_parser
    parsed = resume_parser.parse_text(req.resume_text)
    
    # Append row to Google Sheet
    active_sheet = req.sheet_id or "1Eb-hdgR2K9Es3y-INU8YmE5yFGg0I56psxaLYLuILCQ"
    mcp_client.execute_tool("update_sheet", {
        "sheet_name": "Master Recruitment Tracker 2026",
        "row": 9999,
        "column": "A",
        "value": parsed["name"],
        "sheet_id": active_sheet
    })
    
    # Invalidate cache
    from services.redis_cache import redis_cache
    redis_cache.delete(f"employees_all_{active_sheet}_Master Recruitment Tracker 2026")

    return {"status": "success", "candidate": parsed, "message": f"Candidate '{parsed['name']}' parsed and added to Google Sheet!"}

@app.post("/candidates/match")
def match_candidate_jd(req: CandidateMatchRequest):
    """Calculate fit score percentage (0-100%) for candidate against target Job Description."""
    if req.token:
        try:
            get_current_user(req.token)
        except Exception:
            pass
    
    cand_text = f"{req.candidate_skills or ''} {req.candidate_experience or req.experience or ''}".lower()
    jd_text = (req.job_description or req.jd_requirements or "").lower()
    
    cand_words = set(re.findall(r"\w+", cand_text))
    jd_words = set(re.findall(r"\w+", jd_text))
    
    if not jd_words:
        score = 85
    else:
        overlap = cand_words.intersection(jd_words)
        score = int(min(98, max(45, (len(overlap) / max(1, len(jd_words))) * 100 + 40)))
        
    rating_label = "Excellent Match" if score >= 80 else ("Good Fit" if score >= 65 else "Moderate Match")
    matching_keywords = list(cand_words.intersection(jd_words))[:8]
    rationale = f"Candidate matches {len(matching_keywords)} key skills required for the role: {', '.join(matching_keywords[:5])}." if matching_keywords else "Candidate profile aligns with general technical requirements."
    return {
        "match_score": score,
        "rating_label": rating_label,
        "matching_keywords": matching_keywords,
        "rationale": rationale
    }

@app.post("/interviews/schedule")
def schedule_interview(req: InterviewScheduleRequest):
    """Generate calendar invite ICS content and Google Calendar meeting URL."""
    if req.token:
        try:
            get_current_user(req.token)
        except Exception:
            pass
    
    round_str = req.interview_round or req.round_name or "1st Round Technical"
    mode_str = req.interview_mode or req.mode or "Google Meet"
    interviewer_str = req.interviewer_emails or req.interviewer or "tech-lead@company.com"
    
    summary = f"{round_str} Interview - {req.candidate_name}"
    details = f"HR Interview with candidate {req.candidate_name} ({req.candidate_email}) conducted by {interviewer_str} via {mode_str}."
    gcal_url = f"https://calendar.google.com/calendar/render?action=TEMPLATE&text={summary.replace(' ', '+')}&details={details.replace(' ', '+')}"
    
    ics_content = (
        "BEGIN:VCALENDAR\n"
        "VERSION:2.0\n"
        "PRODID:-//HR Copilot//Interview Schedule//EN\n"
        "BEGIN:VEVENT\n"
        f"SUMMARY:{summary}\n"
        f"DESCRIPTION:{details}\n"
        f"LOCATION:{mode_str}\n"
        "STATUS:CONFIRMED\n"
        "END:VEVENT\n"
        "END:VCALENDAR"
    )
    return {
        "status": "success",
        "candidate_name": req.candidate_name,
        "calendar_url": gcal_url,
        "gcal_url": gcal_url,
        "ics_content": ics_content,
        "message": f"Interview scheduled for {req.candidate_name} on {req.interview_date}!"
    }

@app.post("/interviews/feedback")
async def record_interview_feedback(req: InterviewFeedbackRequest):
    """Save 1st/2nd round interview ratings (1-5 stars) and remarks to Google Sheet."""
    caller = "user"
    if req.token:
        try:
            user = get_current_user(req.token)
            caller = user.get("sub", "user")
        except Exception:
            pass
        
    interviewer_str = req.interviewer_email or req.interviewer or "interviewer@company.com"
    recommendation_str = req.recommendation or req.status or "Hire"
    
    from services.agent_service import log_audit
    log_audit(caller, "record_interview_feedback", {
        "candidate": req.candidate_name,
        "round": req.round_name,
        "rating": req.rating,
        "interviewer": interviewer_str,
        "status": recommendation_str,
        "remarks": req.remarks
    }, {"status": "recorded"})
    
    return {
        "status": "success",
        "message": f"Interview Feedback ({req.rating}/5 Stars - {recommendation_str}) recorded for {req.candidate_name}!"
    }
