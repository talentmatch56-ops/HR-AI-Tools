# HR AI Copilot - Enterprise HR Assistant

HR AI Copilot is a production-ready, full-stack HR Assistant built using **FastAPI (Python)**, **Next.js 15 (React, TypeScript, Tailwind)**, and the **Model Context Protocol (MCP)**. It connects to Google Sheets databases, handles branded Gmail communication, generates official PDF documents via ReportLab, and tracks operations with security role-based controls and audit logging.

---

## 📂 Project Architecture & Folder Structure

```
hr-ai-copilot/
├── docker-compose.yml       # Production Docker container orchestration
├── .env.example             # Template for API keys and database IDs
├── README.md                # System documentation
│
├── backend/                 # FastAPI Clean Architecture Application
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py          # FastAPI server routers, Auth, Chat, Audit endpoints
│       ├── core/
│       │   └── config.py    # Environment validation class
│       └── services/
│           ├── agent_service.py # Orchestrates LLM prompt loop and logs
│           └── mcp_client.py    # MCP Client registry translating tools for OpenAI
│
├── mcp-server/              # Model Context Protocol (MCP) Server
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── server.py            # Instantiates FastMCP and registers 15 Tools
│   ├── sheets_helper.py     # Integrates with Google Sheets API + Mock Engine
│   ├── gmail_helper.py      # Combines Jinja2 email branding & Gmail SMTP
│   └── doc_generator.py     # Generates PDF salary slips & contract letters
│
└── frontend/                # Next.js 15 Premium Dark UI Dashboard
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    └── src/
        └── app/
            ├── layout.tsx
            ├── page.tsx     # Premium Login Screen & Role Switcher
            └── dashboard/
                └── page.tsx # Integrated Copilot Interface, search, and audit log
```

---

## ⚡ Quick Start: Zero Setup Demo

To test and review the interface without API keys, simply run the applications. The system automatically shifts to a **local mockup/demo engine** when credentials are left as placeholders:

### 1. Start backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Start MCP Tool Server
```bash
cd mcp-server
pip install -r requirements.txt
python server.py
```

### 3. Start Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** to view the dashboard. Use the credentials on screen to sign in with different roles:
- **Admin**: `admin@company.com`
- **HR Director**: `hr@company.com`
- **Engineering Manager**: `manager@company.com`
- **Employee**: `employee@company.com`

---

## 🛠️ The 15 MCP Tools (Returning Structured JSON)

The MCP Server exposes the following tools:
1. `search_employee(name: str)`
2. `get_employee(employee_id: str)`
3. `search_google_sheet(query: str)`
4. `read_sheet(sheet_name: str)`
5. `update_sheet(row: int, column: str, value: str, sheet_name: str)`
6. `send_email(to, subject, body, placeholders)`
7. `generate_salary_slip(employee_id: str)`
8. `generate_offer_letter(employee_id: str)`
9. `generate_extension_letter(employee_id: str)`
10. `get_leave_balance(employee_id: str)`
11. `calculate_salary(employee_id: str)`
12. `search_client(client_name: str)`
13. `list_pending_documents()`
14. `list_birthdays()`
15. `create_pdf(filename: str, title: str, content: str)`

---

## 📊 Sample Google Sheet Structure

Create a Google Sheet with 6 tabs matching these schemas:

### Tab 1: `employees`
| employee_id | name | email | role | department | designation | joining_date | pending_documents | birthday | status |
|---|---|---|---|---|---|---|---|---|---|
| EMP001 | Rahul Patel | rahul.patel@company.com | Employee | Engineering | Senior Frontend Developer | 2024-01-15 | Degree Certificate | 08-12 | Active |

### Tab 2: `attendance`
| employee_id | date | status |
|---|---|---|
| EMP001 | 2026-07-29 | Present |

### Tab 3: `salary`
| employee_id | month | base_salary | allowances | deductions |
|---|---|---|---|---|
| EMP001 | June | 85000 | 15000 | 5000 |

### Tab 4: `leave`
| employee_id | leave_type | balance | approved | pending |
|---|---|---|---|---|
| EMP001 | Casual | 12 | 3 | 1 |

---

## 🔒 Security & Role-Based Permissions (RBAC)

The AI assistant and backend enforce strict authorization policies:
- **Admin / HR**: Can edit spreadsheets, view salary/leave, send emails (requiring human-in-the-loop approval), and generate official PDF documents.
- **Manager**: Can search employees and clients, but is blocked from viewing compensation logs or generating official letters.
- **Employee**: Limited to viewing their own records and checking personal leave balance.
