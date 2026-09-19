'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Send,
  User,
  Shield,
  Search,
  Mail,
  Loader2,
  CheckCircle,
  FileText,
  Clock,
  LogOut,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Layout,
  BarChart3,
  BookOpen,
  Settings,
  ArrowRight,
  Mic,
  Download,
  Sun,
  Moon,
  Bot
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  steps?: Array<{
    tool: string
    arguments: any
    status: string
    response?: any
  }>
}

interface Employee {
  employee_id: string
  name: string
  email: string
  department: string
  designation: string
  status: string
  joining_date: string
  [key: string]: any
}

interface AuditLog {
  timestamp: string
  tool: string
  parameters: any
  response: any
  user: string
}

const quickActions = [
  { text: 'Find candidate Rohit', query: 'Find candidate Rohit' },
  { text: 'Maternity Policy details', query: 'What is our Maternity Leave Policy?' },
  { text: 'Status of Yuvraj', query: 'What is the status of Yuvraj Upadhyay?' },
  { text: 'Calculate salary for Developer', query: 'Calculate total salary for Developer' }
]

// â”€â”€â”€ Tabbed Chart Card Sub-Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ChartCard({ data }: { data: any }) {
  const [activeChartTab, setActiveChartTab] = useState<'tech' | 'status'>(data.default_tab || 'tech')
  const [drillTech, setDrillTech] = useState<string | null>(null)  // null = main view

  // Support new multi-tab format (tech_data / status_data) AND old flat format
  const isMultiTab = !!(data.tech_data && data.status_data)
  const currentDataset = isMultiTab
    ? (activeChartTab === 'tech' ? data.tech_data : data.status_data)
    : data  // fallback: old format with flat labels/values

  const labels: string[] = isMultiTab ? currentDataset.labels : (data.labels || [])
  const values: number[] = isMultiTab ? currentDataset.values : (data.values || [])
  const maxVal = Math.max(...values, 1)

  // Drill-down data for selected tech
  const drillData = drillTech && data.tech_breakdown ? data.tech_breakdown[drillTech] : null
  const drillEntries = drillData
    ? Object.entries(drillData as Record<string, number>).sort((a, b) => (b[1] as number) - (a[1] as number))
    : []
  const drillMax = drillEntries.length ? Math.max(...drillEntries.map(e => e[1] as number), 1) : 1

  // Color palettes
  const techColors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-cyan-500 to-blue-500',
    'from-teal-500 to-emerald-500',
    'from-green-500 to-teal-500',
    'from-yellow-500 to-orange-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-600',
    'from-rose-500 to-pink-600',
    'from-fuchsia-500 to-violet-600',
  ]
  const statusColors: Record<string, string> = {
    'To Be Screened': 'from-blue-400 to-blue-600',
    'Screen Selected': 'from-green-400 to-emerald-600',
    'Screen Rejected': 'from-red-400 to-rose-600',
    '1st Round Interview Rejected': 'from-red-500 to-rose-700',
    'Interview Scheduled': 'from-amber-400 to-yellow-600',
    'Shortlisted for 2nd Round': 'from-teal-400 to-cyan-600',
    'Consider for Future': 'from-violet-400 to-purple-600',
    'Not Responding': 'from-slate-400 to-slate-600',
    'Offer Released': 'from-teal-400 to-cyan-600',
    'Joined': 'from-emerald-500 to-green-700',
    'Unknown': 'from-gray-400 to-gray-600',
  }

  // Whether the current tech bar is clickable (has drill-down data)
  const hasDrilldown = !!(data.tech_breakdown)

  return (
    <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md w-full max-w-xl font-sans">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">📊 HR Copilot Report</p>
            <h4 className="text-sm font-bold text-slate-800 mt-0.5">
              {drillTech ? (
                <span>
                  <button
                    onClick={() => setDrillTech(null)}
                    className="text-blue-500 hover:text-blue-700 font-semibold mr-1 transition-colors"
                  >
                    ← Back
                  </button>
                  <span className="text-slate-600 font-normal">|</span>
                  <span className="ml-1">{drillTech} — Status Breakdown</span>
                </span>
              ) : data.title}
            </h4>
          </div>
          {data.total !== undefined && !drillTech && (
            <div className="text-right">
              <p className="text-2xl font-extrabold text-blue-600">{data.total}</p>
              <p className="text-[10px] text-slate-400 font-medium">Total Candidates</p>
            </div>
          )}
          {drillTech && drillData && (
            <div className="text-right">
              <p className="text-2xl font-extrabold text-violet-600">
                {Object.values(drillData as Record<string, number>).reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">{drillTech} Total</p>
            </div>
          )}
        </div>
      </div>

       {/* Tab Switcher — only if multi-tab payload and not in drill-down */}
      {isMultiTab && !drillTech && (
        <div className="flex gap-0 px-5 border-b border-slate-100 mt-1">
          {(['tech', 'status'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveChartTab(tab)}
              className={`px-4 py-2 text-[11px] font-semibold border-b-2 transition-all ${
                activeChartTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'tech' ? '📊 By Technology' : '📈 By Status'}
            </button>
          ))}
        </div>
      )}

      {/* Drill-down hint — show only in tech tab when drilldown available */}
      {!drillTech && activeChartTab === 'tech' && hasDrilldown && (
        <p className="px-5 pt-2 text-[10px] text-slate-400">💡 Click any bar to see its status breakdown</p>
      )}

      {/* DRILL-DOWN VIEW */}
      {drillTech && drillEntries.length > 0 && (
        <div className="px-5 py-4 space-y-3">
          {drillEntries.map(([st, cnt]) => {
            const pct = ((cnt as number) / drillMax) * 100
            const colorClass = statusColors[st] || 'from-slate-400 to-slate-600'
            return (
              <div key={st} className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700">
                  <span className="truncate max-w-[65%]">{cleanString(st)}</span>
                  <span className="text-blue-600 shrink-0">{cnt as number} Candidate{(cnt as number) !== 1 ? 's' : ''}</span>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${colorClass} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MAIN CHART BARS */}
      {!drillTech && (
        <div className="px-5 py-4 space-y-3">
          {labels.map((label, i) => {
            const val = values[i]
            const pct = (val / maxVal) * 100
            const colorClass = activeChartTab === 'status'
              ? (statusColors[label] || 'from-slate-400 to-slate-600')
              : (techColors[i % techColors.length])
            const isClickable = activeChartTab === 'tech' && hasDrilldown
            return (
              <div
                key={label}
                className={`space-y-1 ${isClickable ? 'cursor-pointer group' : ''}`}
                onClick={() => isClickable ? setDrillTech(label) : undefined}
              >
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700">
                  <span className={`truncate max-w-[60%] ${isClickable ? 'group-hover:text-blue-600 transition-colors' : ''}`}>
                    {cleanString(label)}
                    {isClickable && <span className="ml-1 text-slate-300 group-hover:text-blue-400 text-[9px]">▶</span>}
                  </span>
                  <span className="text-blue-600 shrink-0">{val} Candidate{val !== 1 ? 's' : ''}</span>
                </div>
                <div className={`w-full bg-slate-100 h-4 rounded-full overflow-hidden ${isClickable ? 'group-hover:ring-2 group-hover:ring-blue-300 group-hover:ring-offset-1 transition-all' : ''}`}>
                  <div
                    className={`bg-gradient-to-r ${colorClass} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
          {labels.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">No data available</p>
          )}
        </div>
      )}
    </div>
  )
}

const cleanString = (str: string | null | undefined): string => {
  if (!str) return '-'
  return String(str)
    .replace(/â€“/g, '—')
    .replace(/â€”/g, '—')
    .replace(/âœ•/g, '✕')
    .replace(/âš¡/g, '⚡')
    .replace(/âœ“/g, '✓')
    .replace(/â/g, '') // remove trailing raw 'â' characters from mangled encoding
}

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000'
    }
  }
  return 'https://hr-ai-tools.onrender.com'
}

const safeFetch = async (url: string, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, init)
  } catch (err) {
    if (url.includes('localhost:8000') || url.includes('127.0.0.1:8000')) {
      const fallbackUrl = url.replace(/http:\/\/(localhost|127\.0\.0\.1):8000/, 'https://hr-ai-tools.onrender.com')
      return await fetch(fallbackUrl, init)
    }
    throw err
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [token, setToken] = useState<string>('')
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'kanban' | 'analytics' | 'admin' | 'table' | 'directory' | 'mail_merge' | 'recruitment_dashboard'>('home')
  const [techFilter, setTechFilter] = useState<string>('ALL')
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [dateFilter, setDateFilter] = useState<'day' | 'week' | 'month' | 'all'>('all')
  const [selectedCustomDate, setSelectedCustomDate] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [directoryPage, setDirectoryPage] = useState(1)

  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome to your HR AI Copilot workspace. Ask me any query, for example: "Find Rohit" or "What is our Maternity Leave Policy?"'
    }
  ])
  const [loading, setLoading] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [directorySearch, setDirectorySearch] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  
  // Custom Google Sheets State
  const [registeredSheets, setRegisteredSheets] = useState<Array<{ id: number; sheet_id: string; title: string }>>([])
  const [activeSheetId, setActiveSheetId] = useState<string>('')
  const [availableTabs, setAvailableTabs] = useState<string[]>([
    'Master Recruitment Tracker 2026',
    'Shortlisting Tracker 2026',
    'Job Opening Tracker 2026'
  ])
  const [activeTabName, setActiveTabName] = useState<string>('Master Recruitment Tracker 2026')
  const [newSheetId, setNewSheetId] = useState('')
  const [registeringSheet, setRegisteringSheet] = useState(false)
  const [registerSheetStatus, setRegisterSheetStatus] = useState('')

  // Reset page when filters or active sheet changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCustomDate, dateFilter, activeSheetId, searchQuery])

  useEffect(() => {
    setDirectoryPage(1)
  }, [directorySearch, activeSheetId])

  // Email Approval State
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [emailDraft, setEmailDraft] = useState<{ to: string; subject: string; body: string } | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState('')

  // Candidate click-to-email state
  const [emailCandidate, setEmailCandidate] = useState<Employee | null>(null)
  const [candidateEmailPrompt, setCandidateEmailPrompt] = useState('')
  const [generatingCandidateEmail, setGeneratingCandidateEmail] = useState(false)

  // Policy upload state
  const [policyTitle, setPolicyTitle] = useState('')
  const [policyContent, setPolicyContent] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')

  // Auto responder simulation state
  const [candidateInquiry, setCandidateInquiry] = useState('')
  const [autoResponseDraft, setAutoResponseDraft] = useState<{ subject: string; body: string } | null>(null)
  const [draftingReply, setDraftingReply] = useState(false)

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)

  // Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  // New Feature States: AI Resume Parser, JD Matcher, Interview Scheduler, Interviewer Feedback Form
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [parsingResume, setParsingResume] = useState(false)
  const [parsedCandidate, setParsedCandidate] = useState<any>(null)
  const [addingParsedCandidate, setAddingParsedCandidate] = useState(false)
  const [resumeSuccessMsg, setResumeSuccessMsg] = useState('')

  const [jdMatchPrompt, setJdMatchPrompt] = useState('Senior Full Stack Developer (React, Python, AWS, PostgreSQL, REST APIs)')
  const [candidateScores, setCandidateScores] = useState<Record<string, { score: number; rationale: string }>>({})
  const [evaluatingJd, setEvaluatingJd] = useState<Record<string, boolean>>({})

  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [schedulingCandidate, setSchedulingCandidate] = useState<Employee | null>(null)
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('11:00')
  const [interviewMode, setInterviewMode] = useState('Google Meet')
  const [interviewRound, setInterviewRound] = useState('1st Round Technical')
  const [interviewerEmails, setInterviewerEmails] = useState('tech-lead@company.com, hr@company.com')
  const [schedulingLoading, setSchedulingLoading] = useState(false)
  const [scheduleResult, setScheduleResult] = useState<any>(null)

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackCandidate, setFeedbackCandidate] = useState<Employee | null>(null)
  const [feedbackRating, setFeedbackRating] = useState<number>(4)
  const [feedbackRecommendation, setFeedbackRecommendation] = useState<string>('Hire')
  const [feedbackRemarks, setFeedbackRemarks] = useState<string>('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState('')

  const getCookieValue = (name: string): string => {
    if (typeof document === 'undefined') return ''
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      try {
        return decodeURIComponent(parts.pop()?.split(';').shift() || '')
      } catch (e) {
        return ''
      }
    }
    return ''
  }

  const fetchEmployees = async (jwtToken: string, query = '', sheetId = '', tabName = '') => {
    try {
      const apiUrl = getApiUrl()
      let url = `${apiUrl}/employees?token=${jwtToken}`
      if (query) url += `&query=${encodeURIComponent(query)}`
      if (sheetId) url += `&sheet_id=${encodeURIComponent(sheetId)}`
      const currentTab = tabName || activeTabName
      if (currentTab) url += `&tab=${encodeURIComponent(currentTab)}`

      const res = await safeFetch(url)
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
    }
  }

  const fetchSheetTabs = async (jwtToken: string, sheetId: string) => {
    if (!sheetId) return
    try {
      const apiUrl = getApiUrl()
      const res = await safeFetch(`${apiUrl}/sheets/tabs?token=${jwtToken}&sheet_id=${encodeURIComponent(sheetId)}`)
      if (res.ok) {
        const tabs = await res.json()
        setAvailableTabs(tabs || [])
        if (tabs && tabs.length > 0) {
          const defaultTab = tabs.find((t: string) => t.toLowerCase().includes('master') || t.toLowerCase().includes('recruitment')) || tabs[0]
          setActiveTabName(defaultTab)
          fetchEmployees(jwtToken, searchQuery, sheetId, defaultTab)
        }
      }
    } catch (err) {
      console.error('Error fetching sheet tabs:', err)
    }
  }

  const fetchRegisteredSheets = async (jwtToken: string) => {
    try {
      const apiUrl = getApiUrl()
      const res = await safeFetch(`${apiUrl}/sheets?token=${jwtToken}`)
      if (res.ok) {
        const data = await res.json()
        setRegisteredSheets(data)
      }
    } catch (err) {
      console.error('Error fetching registered sheets:', err)
    }
  }

  const fetchAuditLogs = async (jwtToken: string) => {
    try {
      const apiUrl = getApiUrl()
      const res = await safeFetch(`${apiUrl}/audit/logs?token=${jwtToken}`)
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data.reverse())
      }
    } catch (err) {
      console.error('Error fetching logs:', err)
    }
  }

  useEffect(() => {
    // Load Plus Jakarta Sans Font dynamically
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@1,400;1,600&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    let storedToken = ''
    let storedUser = ''
    try {
      storedToken = localStorage.getItem('hr_token') || ''
      storedUser = localStorage.getItem('hr_user') || ''
    } catch (e) {}

    if (!storedToken) {
      storedToken = getCookieValue('hr_token')
      storedUser = getCookieValue('hr_user')
    }

    if (!storedToken) {
      storedToken = 'token-' + btoa(JSON.stringify({ sub: 'admin@company.com', role: 'Admin', exp: Date.now() + 86400000 }))
      storedUser = JSON.stringify({ email: 'admin@company.com', role: 'Admin' })
      try {
        localStorage.setItem('hr_token', storedToken)
        localStorage.setItem('hr_user', storedUser)
      } catch (e) {}
    }

    setToken(storedToken)
    try {
      if (storedUser) setUser(JSON.parse(storedUser))
    } catch (e) {
      setUser({ email: 'admin@company.com', role: 'Admin' })
    }

    let cachedSheetId = ''
    try {
      cachedSheetId = localStorage.getItem('active_sheet_id') || ''
    } catch (e) {}
    setActiveSheetId(cachedSheetId)

    const targetSheet = cachedSheetId || '1Eb-hdgR2K9Es3y-INU8YmE5yFGg0I56psxaLYLuILCQ'
    fetchEmployees(storedToken, '', targetSheet)
    fetchSheetTabs(storedToken, targetSheet)
    fetchAuditLogs(storedToken)
    fetchRegisteredSheets(storedToken)

    // Automatically poll Google Sheet updates every 15 seconds
    const interval = setInterval(() => {
      let currentSheetId = ''
      try {
        currentSheetId = localStorage.getItem('active_sheet_id') || ''
      } catch (e) {}
      fetchEmployees(storedToken, '', currentSheetId)
    }, 15000)

    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSync = async () => {
    if (syncing) return
    setSyncing(true)
    try {
      // force_refresh=true bypasses backend cache â€” always fetches live from Google Sheets
      const apiUrl = getApiUrl()
      let url = `${apiUrl}/employees?token=${token}&force_refresh=true`
      if (searchQuery) url += `&query=${encodeURIComponent(searchQuery)}`
      if (activeSheetId) url += `&sheet_id=${encodeURIComponent(activeSheetId)}`
      const res = await safeFetch(url)
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      }
      const now = new Date()
      setLastSynced(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch (err) {
      console.error('Sync failed:', err)
    }
    setSyncing(false)
  }

  const handleRegisterSheet = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetSheetId = newSheetId.trim()
    if (!targetSheetId) return
    setRegisteringSheet(true)
    setRegisterSheetStatus('Verifying and registering sheet ID...')
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/sheets/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet_id: targetSheetId, token })
      })
      const data = await res.json()
      if (res.ok) {
        setRegisterSheetStatus('Google Sheet registered & activated! Syncing sub-sheets...')
        setNewSheetId('')
        setActiveSheetId(targetSheetId)
        localStorage.setItem('active_sheet_id', targetSheetId)
        fetchRegisteredSheets(token)
        fetchSheetTabs(token, targetSheetId)
      } else {
        setRegisterSheetStatus(`Error: ${data.detail || 'Failed to register'}`)
      }
    } catch (err) {
      setRegisterSheetStatus('Network error connecting to backend.')
    } finally {
      setRegisteringSheet(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchEmployees(token, searchQuery, activeSheetId)
  }

  const handleSendMessage = async (e: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault()
    const textToSend = customText || input
    if (!textToSend.trim() || loading) return

    setInput('')
    
    const updatedMessages = [...messages, { role: 'user', content: textToSend } as Message]
    setMessages(updatedMessages)
    setLoading(true)

    const historyPayload = updatedMessages.slice(1, -1).map(m => ({
      role: m.role,
      content: m.content
    }))

    const payload = {
      message: textToSend,
      history: historyPayload,
      token,
      sheet_id: activeSheetId || '1Eb-hdgR2K9Es3y-INU8YmE5yFGg0I56psxaLYLuILCQ'
    }

    const tryFetch = async (retries = 2): Promise<any> => {
      const primaryUrl = getApiUrl()
      const urlsToTry = [
        `${primaryUrl}/chat`,
        primaryUrl.includes('localhost') ? 'https://hr-ai-tools.onrender.com/chat' : 'http://localhost:8000/chat'
      ]

      for (let attempt = 0; attempt <= retries; attempt++) {
        for (const url of urlsToTry) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 25000)
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
              signal: controller.signal
            })
            clearTimeout(timeoutId)
            if (res.ok) {
              return await res.json()
            }
          } catch (err) {
            console.warn(`Attempt ${attempt + 1} to ${url} failed:`, err)
          }
        }
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1500))
        }
      }
      throw new Error('All connection attempts failed.')
    }

    try {
      const data = await tryFetch(2)

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          steps: data.steps
        }
      ])

      if (data.email_approval_required && data.email_draft) {
        setEmailDraft(data.email_draft)
        setShowApprovalModal(true)
      }

      fetchAuditLogs(token)
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'The backend server is waking up or reconnecting. Please retry your message shortly.',
          steps: []
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCandidateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailCandidate || !candidateEmailPrompt.trim()) return
    setGeneratingCandidateEmail(true)
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Draft a professional email to candidate ${emailCandidate.name} at email address ${emailCandidate.email} based on this prompt: "${candidateEmailPrompt}"`,
          history: [],
          token
        })
      })
      if (res.ok) {
        const data = await res.json()
        setEmailDraft({
          to: emailCandidate.email,
          subject: `HR Update regarding your application`,
          body: data.response
        })
        setShowApprovalModal(true)
        setEmailCandidate(null)
      }
    } catch (e) {
      alert('Failed to generate email.')
    } finally {
      setGeneratingCandidateEmail(false)
    }
  }

  const startVoiceDictation = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        alert('Voice speech recognition is not supported in this browser.')
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.lang = 'en-US'
      recognition.interimResults = true  // show live transcript while speaking

      let latestTranscript = ''  // capture in closure to avoid stale state

      recognition.onstart = () => {
        setIsRecording(true)
      }

      recognition.onresult = (event: any) => {
        // Build the latest transcript (combine all result segments)
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        latestTranscript = transcript
        setInput(transcript)  // live preview in the input box
      }

      recognition.onerror = () => {
        setIsRecording(false)
        setInput('')
        alert('Error occurred during speech dictation.')
      }

      recognition.onend = () => {
        setIsRecording(false)
        // Auto-send the transcribed message
        const finalText = latestTranscript.trim()
        if (finalText) {
          setInput('')  // clear input first
          // Small delay to let React clear state before submitting
          setTimeout(() => {
            handleSendMessage(new Event('submit') as any, finalText)
          }, 100)
        }
      }

      recognition.start()
    }
  }

  const exportAuditLogsCSV = () => {
    if (auditLogs.length === 0) return
    const headers = ['ID', 'Timestamp', 'Tool', 'Parameters', 'Caller']
    const rows = auditLogs.map((log, index) => [
      index + 1,
      new Date(log.timestamp).toISOString(),
      log.tool,
      JSON.stringify(log.parameters).replace(/"/g, '""'),
      log.user
    ])

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `hr_audit_logs_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleGenerateAutoResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!candidateInquiry.trim()) return
    setDraftingReply(true)
    setAutoResponseDraft(null)

    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/auto-respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_message: candidateInquiry,
          token
        })
      })
      if (res.ok) {
        const data = await res.json()
        setAutoResponseDraft(data)
      }
    } catch (e) {
      alert('Failed to generate auto reply.')
    } finally {
      setDraftingReply(false)
    }
  }

  const handleApproveEmail = async () => {
    if (!emailDraft) return
    setSendingEmail(true)
    setEmailSuccess('')
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/mcp/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'send_email',
          arguments: {
            to: emailDraft.to,
            subject: emailDraft.subject,
            body: emailDraft.body
          },
          token
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        setEmailSuccess('Email shifted to background queue successfully!')
        setTimeout(() => {
          setShowApprovalModal(false)
          setEmailDraft(null)
          setEmailSuccess('')
        }, 1500)
      } else {
        alert(data.message || 'Failed to send email.')
      }
    } catch (err) {
      alert('Failed to execute SMTP operations.')
    } finally {
      setSendingEmail(false)
      fetchAuditLogs(token)
    }
  }

  // --- NEW FEATURE HANDLERS ---
  const handleParseResume = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resumeText.trim()) return
    setParsingResume(true)
    setParsedCandidate(null)
    setResumeSuccessMsg('')
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/resume/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, token })
      })
      if (res.ok) {
        const data = await res.json()
        setParsedCandidate(data)
      } else {
        alert('Failed to parse resume text.')
      }
    } catch (err) {
      console.error(err)
      alert('Error connecting to backend for resume parsing.')
    } finally {
      setParsingResume(false)
    }
  }

  const handleAddParsedCandidateToSheet = async () => {
    if (!parsedCandidate) return
    setAddingParsedCandidate(true)
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Add candidate to recruitment tracker: Name: ${parsedCandidate.name}, Email: ${parsedCandidate.email}, Phone: ${parsedCandidate.phone}, Designation: ${parsedCandidate.designation}, Department: ${parsedCandidate.department}, Status: To Be Screened, Total Experience: ${parsedCandidate.total_experience}, Recruiters Remarks: ${parsedCandidate.summary}`,
          history: [],
          token
        })
      })
      if (res.ok) {
        setResumeSuccessMsg('✓ Candidate successfully appended to live Master Google Sheet!')
        handleSync()
        setTimeout(() => {
          setShowResumeModal(false)
          setParsedCandidate(null)
          setResumeText('')
          setResumeSuccessMsg('')
        }, 2000)
      }
    } catch (err) {
      alert('Failed to append candidate to sheet.')
    } finally {
      setAddingParsedCandidate(false)
    }
  }

  const handleMatchCandidateJD = async (cand: Employee) => {
    const candKey = cand.employee_id || cand.name
    setEvaluatingJd(prev => ({ ...prev, [candKey]: true }))
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/candidates/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: cand.employee_id,
          candidate_name: cand.name,
          candidate_skills: (cand as any).relevant_experience || cand.designation || 'Software Developer',
          candidate_experience: (cand as any).total_experience || '3 Years',
          job_description: jdMatchPrompt,
          token
        })
      })
      if (res.ok) {
        const data = await res.json()
        setCandidateScores(prev => ({
          ...prev,
          [candKey]: { score: data.match_score, rationale: data.rationale }
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setEvaluatingJd(prev => ({ ...prev, [candKey]: false }))
    }
  }

  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schedulingCandidate || !interviewDate) return
    setSchedulingLoading(true)
    setScheduleResult(null)
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/interviews/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: schedulingCandidate.name,
          candidate_email: schedulingCandidate.email,
          interview_date: interviewDate,
          interview_time: interviewTime,
          interview_mode: interviewMode,
          interview_round: interviewRound,
          interviewer_emails: interviewerEmails,
          token
        })
      })
      if (res.ok) {
        const data = await res.json()
        setScheduleResult(data)
      } else {
        alert('Failed to schedule interview.')
      }
    } catch (err) {
      console.error(err)
      alert('Network error scheduling interview.')
    } finally {
      setSchedulingLoading(false)
    }
  }

  const downloadICSFile = (data: any) => {
    if (!data || !data.ics_content) return
    const blob = new Blob([data.ics_content], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview_${data.candidate_name.replace(/\s+/g, '_')}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackCandidate) return
    setSubmittingFeedback(true)
    setFeedbackSuccess('')
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/interviews/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: feedbackCandidate.employee_id,
          candidate_name: feedbackCandidate.name,
          interviewer_email: user?.email || 'interviewer@company.com',
          rating: feedbackRating,
          recommendation: feedbackRecommendation,
          remarks: feedbackRemarks,
          token
        })
      })
      if (res.ok) {
        setFeedbackSuccess('✓ Feedback saved successfully & updated on candidate record!')
        setTimeout(() => {
          setShowFeedbackModal(false)
          setFeedbackCandidate(null)
          setFeedbackRemarks('')
          setFeedbackSuccess('')
          handleSync()
        }, 1500)
      } else {
        alert('Failed to log feedback.')
      }
    } catch (err) {
      alert('Error logging feedback.')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const handleUpdateStatus = async (empId: string, newStatus: string) => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/mcp/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'update_employee_status',
          arguments: {
            employee_id: empId,
            new_status: newStatus,
            sheet_id: activeSheetId || undefined
          },
          token
        })
      })
      if (res.ok) {
        setEmployees(prev => prev.map(e => e.employee_id === empId ? { ...e, status: newStatus } : e))
        fetchAuditLogs(token)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handlePolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!policyTitle.trim() || !policyContent.trim()) return
    setUploadStatus('Uploading...')

    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/policies/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: policyTitle,
          content: policyContent,
          token
        })
      })
      const data = await res.json()
      if (res.ok) {
        setUploadStatus('Policy uploaded and indexed successfully!')
        setPolicyTitle('')
        setPolicyContent('')
      } else {
        setUploadStatus(`Error: ${data.detail || 'Upload failed'}`)
      }
    } catch (err) {
      setUploadStatus('Failed to upload policy.')
    }
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('hr_token')
      localStorage.removeItem('hr_user')
      localStorage.removeItem('active_sheet_id')
    } catch (e) {}
    document.cookie = 'hr_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'hr_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/')
  }

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const cleaned = dateStr.trim();
    const parts = cleaned.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const year = parseInt(parts[2]);
      const monthStr = parts[1].toLowerCase();
      const months: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      let month = months[monthStr.substring(0, 3)];
      if (month === undefined) {
        month = parseInt(parts[1]) - 1;
      }
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return null;
  };

  const candidateDates = employees
    .map(emp => parseDate(emp.joining_date))
    .filter((d): d is Date => d !== null);
  const maxDate = candidateDates.length > 0 ? new Date(Math.max(...candidateDates.map(d => d.getTime()))) : new Date();

  const filteredEmployees = employees.filter(emp => {
    if (selectedCustomDate) {
      const empDate = parseDate(emp.joining_date);
      if (!empDate) return false;
      const filterDate = new Date(selectedCustomDate);
      return (
        empDate.getDate() === filterDate.getDate() &&
        empDate.getMonth() === filterDate.getMonth() &&
        empDate.getFullYear() === filterDate.getFullYear()
      );
    }
    if (dateFilter === 'all') return true;
    const empDate = parseDate(emp.joining_date);
    if (!empDate) return false;
    
    const diffTime = Math.abs(maxDate.getTime() - empDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (dateFilter === 'day') {
      return diffDays <= 1;
    } else if (dateFilter === 'week') {
      return diffDays <= 7;
    } else if (dateFilter === 'month') {
      return diffDays <= 30;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const downloadExcelReport = () => {
    if (filteredEmployees.length === 0) return;
    const headers = [
      'No.', 'Date', 'Month', 'Accountable', 'Recruiter Name', 'Technology (Job Title)', 'Tech/Non Tech', 'Opening For ( Inhouse / Client)', 
      'Candidate Name', 'Source âœ…', 'Status', 'Contact number', 'Email ID', 'Total Experience', 'Relevant Experience', 
      'Current CTC', 'Expected CTC', 'Notice Period', 'Location', 'Job Change Reason', 'Recruiter\'s Remarks', 
      'Current Company Name', 'Interview Mode (1st Round)', '1st Round Interview Date', 'Interviewer (1st Round)', 
      'Status (1st Round)', 'Interview (2nd / Final Round) Date', 'Interview Mode (2nd Round)', 'Interviewer (2nd / Final Round)', 
      'Status (2nd / Final Round)', 'Joining Date', 'CTC Offered', 'Vendor Name'
    ];
    const rows = filteredEmployees.map((emp) => [
      emp.employee_id,
      emp.joining_date,
      (emp as any).month || '',
      (emp as any).accountable || '',
      (emp as any).recruiter_name || '',
      emp.designation,
      (emp as any).tech_non_tech || '',
      emp.department,
      emp.name,
      (emp as any).source || '',
      emp.status,
      (emp as any).contact_number || '',
      emp.email,
      (emp as any).total_experience || '',
      (emp as any).relevant_experience || '',
      (emp as any).current_ctc || '',
      (emp as any).expected_ctc || '',
      (emp as any).notice_period || '',
      (emp as any).location || '',
      (emp as any).job_change_reason || '',
      (emp as any).recruiters_remarks || '',
      (emp as any).current_company || '',
      (emp as any).interview_mode_1st || '',
      (emp as any).interview_date_1st || '',
      (emp as any).interviewer_1st || '',
      (emp as any).status_1st || '',
      (emp as any).interview_date_2nd || '',
      (emp as any).interview_mode_2nd || '',
      (emp as any).interviewer_2nd || '',
      (emp as any).status_2nd || '',
      (emp as any).offered_joining_date || '',
      (emp as any).ctc_offered || '',
      (emp as any).vendor_name || ''
    ]);

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `recruitment_report_${dateFilter}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  };

  const kanbanColumns = ['Screen Selected', 'Screen Rejected', 'Shortlisted for 2nd Round', 'Offerd', 'Not Interested']
  const [mobileKanbanCol, setMobileKanbanCol] = useState(0)

  const isDark = theme === 'dark'

  // Bento Box View Menu Items Definitions (6 Cards - 3x2 Grid Complete)
  const bentoMenuItems = [
    {
      id: 'chat',
      title: 'AI Copilot Assistant',
      description: 'Interact with your live Google Sheet records, calculate employee salaries, generate offer letters, and search Maternity policies using conversational AI.',
      icon: <Sparkles className="w-6 h-6 text-blue-405" />,
      color: 'from-blue-500/10 to-blue-600/5 hover:border-blue-500/40 hover:shadow-blue-500/10 border-blue-550/20',
      badge: 'Natural AI'
    },
    {
      id: 'kanban',
      title: 'Interactive Pipeline',
      description: 'Review and manage candidate hiring states within a dynamic visual pipeline. Seamlessly progress statuses.',
      icon: <Layout className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-500/10 to-purple-600/5 hover:border-purple-500/40 hover:shadow-purple-500/10 border-purple-550/20',
      badge: `${employees.length} Candidates`
    },
    {
      id: 'table',
      title: 'Master Recruitment Tracker',
      description: 'Directly synchronized candidates registry spreadsheet. Fully search, review, and filter dates of all evaluated records.',
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-500/10 to-emerald-600/5 hover:border-emerald-500/40 hover:shadow-emerald-500/10 border-emerald-550/20',
      badge: 'Sheets Synced'
    },
    {
      id: 'analytics',
      title: 'SVG Analytics Deck',
      description: 'Visualize technology conversion rates, daily recruitment intakes, and selection status breakdown trends in real-time.',
      icon: <BarChart3 className="w-6 h-6 text-orange-405" />,
      color: 'from-orange-500/10 to-orange-600/5 hover:border-orange-500/40 hover:shadow-orange-500/10 border-orange-550/20',
      badge: 'Live Data'
    },
    {
      id: 'directory',
      title: 'Candidate Directory',
      description: 'Browse candidate summary records, search roles, and initiate direct template emails in a dedicated contact card deck.',
      icon: <User className="w-6 h-6 text-pink-400" />,
      color: 'from-pink-500/10 to-pink-600/5 hover:border-pink-500/40 hover:shadow-pink-500/10 border-pink-550/20',
      badge: 'Quick Contact'
    },
    {
      id: 'admin',
      title: 'Administrative Console',
      description: 'Index new maternity handbook policy guidelines to RAG memory, calculate salaries, and review audit logs.',
      icon: <Settings className="w-6 h-6 text-slate-400" />,
      color: 'from-slate-500/10 to-slate-600/5 hover:border-slate-400/40 hover:shadow-slate-400/10 border-slate-550/20',
      badge: 'Security Active'
    },
    {
      id: 'mail_merge',
      title: 'Document Mail Merge',
      description: 'Generate bulk HR letters (Offer, Increment, Experience) using custom DOCX templates and partitioned candidate data.',
      icon: <Mail className="w-6 h-6 text-teal-400" />,
      color: 'from-teal-500/10 to-teal-600/5 hover:border-teal-500/40 hover:shadow-teal-500/10 border-teal-550/20',
      badge: 'Templates'
    },
    {
      id: 'recruitment_dashboard',
      title: 'Tech Recruitment Dashboard',
      description: 'Technology-wise visual sourcing charts, candidate intake volume, and technology conversion matrix (interview, offer, reject, joined).',
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
      color: 'from-blue-500/10 to-indigo-600/5 hover:border-blue-500/40 hover:shadow-blue-500/10 border-blue-550/20',
      badge: 'Tech Matrix'
    }
  ]

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // On desktop, default sidebar open; on mobile keep closed
      if (!mobile) setSidebarOpen(true)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className={`flex-1 flex flex-col md:flex-row h-screen overflow-hidden font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#090d22] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <div className={`${
        isMobile
          ? `fixed top-0 left-0 h-full z-50 w-72 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : `transition-all duration-300 shrink-0 ${
              sidebarOpen ? 'w-64 border-r' : 'w-0 border-r-0 overflow-hidden'
            }`
      } flex flex-col justify-between ${
        isDark ? 'border-blue-900/50 bg-[#070a1a]' : 'border-slate-200 bg-white shadow-sm'
      } ${
        (!isMobile && sidebarOpen) || isMobile ? 'p-6' : 'p-0'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight" style={{ color: '#0f172a' }}>
                HR{' '}
                <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, color: '#3b82f6', fontSize: '1.05em' }}>Workspace</span>
              </span>
            </div>
          </div>

          {/* DYNAMIC SHEET SELECTOR */}
          <div className="mb-6">
            <label className={`block text-[9px] uppercase font-bold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Spreadsheet</label>
            <select
              value={activeSheetId}
              onChange={(e) => {
                const val = e.target.value
                setActiveSheetId(val)
                localStorage.setItem('active_sheet_id', val)
                fetchEmployees(token, searchQuery, val)
              }}
              className={`w-full text-xs font-semibold py-1.5 px-2 rounded-lg border focus:outline-none focus:ring-1 ${
                isDark 
                  ? 'bg-blue-950/40 border-blue-900 text-white focus:border-blue-500' 
                  : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400 shadow-sm'
              }`}
            >
              <option value="">Default Tracker (Sheet)</option>
              {registeredSheets.map((s, idx) => (
                <option key={idx} value={s.sheet_id}>{s.title}</option>
              ))}
            </select>
              <div className="mt-2.5">
                <label className={`block text-[9px] uppercase font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sub-Sheet Tab</label>
                <select
                  value={activeTabName}
                  onChange={(e) => {
                    const tabVal = e.target.value
                    setActiveTabName(tabVal)
                    fetchEmployees(token, searchQuery, activeSheetId, tabVal)
                  }}
                  className={`w-full text-xs font-semibold py-1.5 px-2 rounded-lg border focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-blue-950/40 border-blue-900 text-white focus:border-blue-500' 
                      : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400 shadow-sm'
                  }`}
                >
                  {(availableTabs.length > 0 ? availableTabs : ['Master Recruitment Tracker 2026', 'Shortlisting Tracker 2026', 'Job Opening Tracker 2026']).map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>
          </div>

          {/* ACTIVE USER DETAILS */}
          {user && (
            <div className={`p-3 rounded-xl border mb-6 flex flex-col gap-2 ${
              isDark ? 'border-blue-900/40 bg-blue-950/25' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className={`text-[11px] font-semibold truncate max-w-[130px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.email}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Shield className="w-2.5 h-2.5 text-blue-400" />
                    <span className="text-[9px] text-blue-400 font-bold uppercase">{user.role}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI RESUME PARSER BUTTON (LEFT MENU) */}
          <button
            onClick={() => { setShowResumeModal(true); if (isMobile) setSidebarOpen(false); }}
            className="w-full mb-5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-blue-400/30"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Resume (AI)</span>
          </button>

          {/* NAVIGATION LINKS GRID (BOX VIEW) */}
          <nav className="grid grid-cols-2 gap-2 mb-6 font-sans">
            <button
              onClick={() => { setActiveTab('home'); if (isMobile) setSidebarOpen(false); }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                activeTab === 'home'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/15'
                  : isDark 
                    ? 'bg-blue-950/20 border-blue-900/40 text-slate-400 hover:text-white hover:border-blue-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layout className="w-4 h-4 mb-1" />
              <span className="text-[9.5px] font-bold tracking-tight">Home Deck</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('chat'); if (isMobile) setSidebarOpen(false); }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                activeTab === 'chat'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/15'
                  : isDark 
                    ? 'bg-blue-950/20 border-blue-900/40 text-slate-400 hover:text-white hover:border-blue-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 mb-1" />
              <span className="text-[9.5px] font-bold tracking-tight">AI Copilot</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('kanban'); if (isMobile) setSidebarOpen(false); }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                activeTab === 'kanban'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/15'
                  : isDark 
                    ? 'bg-blue-950/20 border-blue-900/40 text-slate-400 hover:text-white hover:border-blue-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layout className="w-4 h-4 mb-1" />
              <span className="text-[9.5px] font-bold tracking-tight">Pipeline</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('table'); if (isMobile) setSidebarOpen(false); }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                activeTab === 'table'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/15'
                  : isDark 
                    ? 'bg-blue-950/20 border-blue-900/40 text-slate-400 hover:text-white hover:border-blue-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 mb-1" />
              <span className="text-[9.5px] font-bold tracking-tight">Master Table</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('analytics'); if (isMobile) setSidebarOpen(false); }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/15'
                  : isDark 
                    ? 'bg-blue-950/20 border-blue-900/40 text-slate-400 hover:text-white hover:border-blue-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 mb-1" />
              <span className="text-[9.5px] font-bold tracking-tight">Analytics</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('directory'); if (isMobile) setSidebarOpen(false); }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                activeTab === 'directory'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/15'
                  : isDark 
                    ? 'bg-blue-950/20 border-blue-900/40 text-slate-400 hover:text-white hover:border-blue-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4 mb-1" />
              <span className="text-[9.5px] font-bold tracking-tight">Directory</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('mail_merge'); if (isMobile) setSidebarOpen(false); }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                activeTab === 'mail_merge'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/15'
                  : isDark 
                    ? 'bg-blue-950/20 border-blue-900/40 text-slate-400 hover:text-white hover:border-blue-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-4 h-4 mb-1" />
              <span className="text-[9.5px] font-bold tracking-tight">Mail Merge</span>
            </button>

            <button
              onClick={() => { setActiveTab('recruitment_dashboard'); if (isMobile) setSidebarOpen(false); }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                activeTab === 'recruitment_dashboard'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/15'
                  : isDark 
                    ? 'bg-blue-950/20 border-blue-900/40 text-slate-400 hover:text-white hover:border-blue-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 mb-1" />
              <span className="text-[9.5px] font-bold tracking-tight">Tech Dashboard</span>
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className={`w-full py-2 border rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${
            isDark 
              ? 'border-blue-900/40 hover:border-red-500/30 hover:bg-red-500/5 text-slate-400 hover:text-red-400' 
              : 'border-slate-200 hover:border-red-500/30 hover:bg-red-500/5 text-slate-600 hover:text-red-600'
          }`}
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
      {/* END SIDEBAR */}

      {/* INJECT BACKGROUND STYLES */}
      <style>{`
        .attractive-bg-light {
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 55%, #e0f2fe 100%) !important;
          position: relative;
        }
        .attractive-bg-light::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
          background-size: 24px 24px;
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
        }
        /* Ensure child components stack correctly above background dots */
        .attractive-bg-light > * {
          position: relative;
          z-index: 1;
        }
      `}</style>

      {/* CENTER WORKSPACE TABS */}
      <div className="flex-1 flex flex-col min-w-0 attractive-bg-light relative pb-16 md:pb-0">
        
        {/* COLLAPSIBLE SIDEBAR HEADER ACTION BAR */}
        <div className={`p-4 border-b flex items-center shrink-0 justify-between ${
          isDark ? 'border-blue-900/30 bg-[#070a1a]/60' : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className={`p-1.5 rounded-lg border transition-all ${
                isDark
                  ? 'border-blue-800/40 hover:bg-blue-955/30 text-blue-400'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600 shadow-sm'
              }`}
              title={sidebarOpen ? "Hide Menu Bar" : "Show Menu Bar"}
            >
              <Layout className="w-4 h-4" />
            </button>

            {/* LOGO */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight" style={{ color: '#0f172a' }}>
                HR{' '}
                <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, color: '#3b82f6' }}>
                  Workspace
                </span>
              </span>
            </div>

            {/* Active tab badge */}
            {activeTab !== 'home' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                {({
                  chat: '🤖 AI Copilot',
                  kanban: '📋 Pipeline',
                  table: '📊 Tracker',
                  analytics: '📈 Analytics',
                  admin: '⚙️ Admin',
                  directory: '📂 Directory'
                } as Record<string, string>)[activeTab] ?? activeTab}
              </span>
            )}

            {/* Back button */}
            {activeTab !== 'home' && (
              <button
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[9px] font-extrabold uppercase transition-all bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
              >
                ← Back
              </button>
            )}

            {/* TOP HEADER SIGN OUT BUTTON (ALWAYS ACCESSIBLE IN PWA & MOBILE) */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 ml-auto px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all bg-white border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-700 hover:text-red-600 shadow-xs shrink-0 cursor-pointer"
              title="Sign Out of HR Workspace"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* TAB 0: HOME BENTO BOX MENU */}
        {activeTab === 'home' && (
          <div className="flex-1 px-4 py-5 md:p-8 flex flex-col max-w-5xl mx-auto space-y-5 md:space-y-8 font-sans overflow-y-auto">
            <div className="text-center space-y-2 md:space-y-3.5 mb-0">
              <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>
                Welcome to your{' '}
                <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, color: '#3b82f6' }}>HR Workspace</span>
              </h1>
              <p className={`text-xs md:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Choose a workspace box card to launch your workspace controls
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {bentoMenuItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className="flex flex-col text-left rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
                  style={{
                    background: '#faf9f7',
                    border: '1.5px solid #e8e3dc',
                    padding: isMobile ? '16px 14px' : '28px 26px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(59,130,246,0.12)'
                    ;(e.currentTarget as HTMLElement).style.background = '#ffffff'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#e8e3dc'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                    ;(e.currentTarget as HTMLElement).style.background = '#faf9f7'
                  }}
                >
                  {/* Top label like "STAGE 01" */}
                  <div className="flex items-center justify-between mb-5">
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#9ca3af'
                    }}>
                      MODULE {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div style={{
                      padding: '6px',
                      borderRadius: '10px',
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.15)',
                      color: '#3b82f6'
                    }}>
                      {item.icon}
                    </div>
                  </div>

                  {/* Big clean title like "Idea Stage" */}
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#111827',
                    letterSpacing: '-0.3px',
                    lineHeight: '1.25',
                    marginBottom: '10px',
                    fontFamily: 'Plus Jakarta Sans, sans-serif'
                  }}>
                    {item.title}
                  </h3>

                  {/* Gray description */}
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    flex: 1,
                    fontWeight: 400
                  }}>
                    {item.description}
                  </p>

                  {/* Footer arrow */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#3b82f6'
                  }}>
                    <span>Open Module</span>
                    <ArrowRight style={{ width: '14px', height: '14px', transition: 'transform 0.2s' }} className="group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* TAB 1: CHAT INTERFACE */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : isDark ? 'bg-blue-955/80 border-blue-900 text-blue-400' : 'bg-white border-slate-200 text-blue-505'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1.5 w-full max-w-2xl">
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed border overflow-x-auto ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none border-blue-500/10'
                        : isDark ? 'bg-[#070a1a] border-blue-900/40 text-slate-100 rounded-tl-none' : 'bg-white border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap font-sans markdown-chat-area">
                        {msg.content.includes('[CHART_DATA:') ? (
                          <>
                            <div>{msg.content.split('[CHART_DATA:')[0]}</div>
                            {(() => {
                              try {
                                // Find [CHART_DATA: ... ] â€” handle nested brackets in JSON
                                const startMarker = '[CHART_DATA:'
                                const startIdx = msg.content.indexOf(startMarker)
                                if (startIdx === -1) return null
                                // Find the JSON object by scanning for matching bracket
                                const afterMarker = msg.content.slice(startIdx + startMarker.length).trimStart()
                                const jsonStart = afterMarker.indexOf('{')
                                if (jsonStart === -1) return null
                                let depth = 0, jsonEnd = -1
                                for (let i = jsonStart; i < afterMarker.length; i++) {
                                  if (afterMarker[i] === '{') depth++
                                  else if (afterMarker[i] === '}') { depth--; if (depth === 0) { jsonEnd = i; break } }
                                }
                                if (jsonEnd === -1) return null
                                const jsonStr = afterMarker.slice(jsonStart, jsonEnd + 1)
                                const data = JSON.parse(jsonStr)
                                return <ChartCard data={data} />
                              } catch(e) {
                                return null
                              }
                            })()}
                          </>
                        ) : (
                          msg.content
                        )}
                      </div>

                      {msg.steps && msg.steps.some(s => s.response && s.response.download_url) && (
                        <div className="mt-3 pt-3 border-t border-blue-800/40 space-y-2">
                          {msg.steps.map((s, idx) => {
                            if (s.response && s.response.download_url) {
                              const url = getApiUrl() + s.response.download_url
                              return (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 text-[10px] font-bold transition-all"
                                >
                                  <FileText className="w-3.5 h-3.5" /> Download {s.response.filename || 'Document'}
                                </a>
                              )
                            }
                            return null
                          })}
                        </div>
                      )}
                    </div>

                    {msg.steps && msg.steps.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.steps.map((step, idx) => (
                          <div key={idx} className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-[9px] ${
                            isDark ? 'bg-blue-955/40 border-blue-900 text-blue-400' : 'bg-white border-slate-200 text-slate-655'
                          }`}>
                            <CheckCircle className="w-3 text-blue-400" />
                            <span className="font-semibold">{step.tool}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isDark ? 'bg-blue-955 border-blue-900 text-blue-400' : 'bg-white border-slate-200 text-blue-505'
                  }`}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className={`border rounded-2xl rounded-tl-none p-4 text-xs flex items-center gap-2 ${
                    isDark ? 'bg-blue-955/60 border-blue-900 text-slate-400' : 'bg-white border-slate-200 text-slate-605'
                  }`}>
                    <span>AI Copilot is processing tools in background worker...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>


            {/* INPUT BAR */}
            <form onSubmit={handleSendMessage} className={`p-4 pb-20 md:pb-4 border-t ${
              isDark ? 'border-blue-900/30 bg-[#070a1a]' : 'border-slate-200 bg-white'
            }`}>
              <div className="relative max-w-4xl mx-auto flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    disabled={loading}
                    placeholder={isRecording ? 'Listening...' : "Ask HR Copilot (e.g. 'Find Shubhi Gupta', 'Generate offer letter')"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ 
                      color: isDark ? '#ffffff' : '#0f172a',
                      backgroundColor: isDark ? '#0b0f27' : '#f8fafc'
                    }}
                    className={`w-full border rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:ring-1 disabled:opacity-50 ${
                      isDark ? 'border-blue-900 focus:border-blue-505 focus:ring-blue-550' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-400'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white p-2 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={startVoiceDictation}
                  className={`p-3 rounded-xl border transition-all ${
                    isRecording 
                      ? 'bg-red-500/20 border-red-500/30 text-red-505 animate-pulse' 
                      : isDark ? 'bg-blue-955/65 border-blue-900 text-slate-450 hover:border-blue-800' : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
                  }`}
                  title="Speak inquiry"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: KANBAN BOARD */}
        {activeTab === 'kanban' && (
          <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden min-h-0 font-sans">
            <h1 className="text-base md:text-lg font-extrabold tracking-tight mb-3" style={{ background: 'linear-gradient(90deg,#3b82f6,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Interactive <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400 }}>Hiring</span> Pipeline
            </h1>

            {/* MOBILE: Tab strip to switch columns */}
            {isMobile && (
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 shrink-0 scrollbar-hide">
                {kanbanColumns.map((col, idx) => {
                  const count = employees.filter(e => e.status === col).length
                  return (
                    <button
                      key={idx}
                      onClick={() => setMobileKanbanCol(idx)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                        mobileKanbanCol === idx
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
                          : isDark ? 'bg-blue-950/30 border-blue-900/40 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="truncate max-w-[110px]">{col}</span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        mobileKanbanCol === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>{count}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {isMobile ? (
              /* MOBILE: Single column full-width */
              (() => {
                const col = kanbanColumns[mobileKanbanCol]
                const colEmps = employees.filter(e => e.status === col)
                return (
                  <div className={`flex-1 border rounded-xl flex flex-col p-3 overflow-hidden ${
                    isDark ? 'bg-blue-955/30 border-blue-900/40' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{col}</h3>
                      <span className="text-[10px] bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">{colEmps.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {colEmps.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-8">No candidates in this stage</p>
                      )}
                      {colEmps.map((emp, eidx) => (
                        <div key={eidx} className={`p-3 border rounded-lg space-y-2 hover:border-blue-500/40 transition-all ${
                          isDark ? 'bg-[#070a1a] border-blue-900/30' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div>
                            <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{emp.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{emp.designation} &middot; {emp.department}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                            <span className="text-[9px] text-slate-500">ID: {emp.employee_id || '-'}</span>
                            <div className="flex gap-1">
                              <button onClick={() => { setEmailCandidate(emp); setCandidateEmailPrompt('') }} className="p-1 rounded text-blue-500 hover:bg-blue-600/10" title="Email"><Mail className="w-3.5 h-3.5" /></button>
                              {col !== 'Offerd' && <button onClick={() => handleUpdateStatus(emp.employee_id, 'Offerd')} className="text-[9px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20">Offer</button>}
                              {col !== 'Screen Rejected' && col !== 'Not Interested' && <button onClick={() => handleUpdateStatus(emp.employee_id, 'Screen Rejected')} className="text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/20">Reject</button>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()
            ) : (
              /* DESKTOP: Horizontal scroll kanban */
              <div className="flex-1 flex gap-4 overflow-x-auto pb-4 pr-2">
                {kanbanColumns.map((col, idx) => {
                  const colEmps = employees.filter(e => e.status === col)
                  return (
                    <div key={idx} className={`w-72 border rounded-xl flex flex-col p-4 shrink-0 ${
                      isDark ? 'bg-blue-955/30 border-blue-900/40' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className={`text-xs font-bold truncate max-w-[180px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{col}</h3>
                        <span className="text-[10px] bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">{colEmps.length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {colEmps.map((emp, eidx) => (
                          <div key={eidx} className={`p-3 border rounded-lg space-y-2 hover:border-blue-500/40 transition-all ${
                            isDark ? 'bg-[#070a1a] border-blue-900/30' : 'bg-slate-50 border-slate-150'
                          }`}>
                            <div>
                              <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{emp.name}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">{emp.designation} &middot; {emp.department}</p>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-blue-900/30">
                              <span className="text-[9px] text-slate-500">ID: {emp.employee_id || '-'}</span>
                              <div className="flex gap-1">
                                <button onClick={() => { setEmailCandidate(emp); setCandidateEmailPrompt('') }} className="p-1 rounded text-blue-455 hover:bg-blue-600/10 mr-1" title="Email Candidate"><Mail className="w-3.5 h-3.5" /></button>
                                {col !== 'Offerd' && (<button onClick={() => handleUpdateStatus(emp.employee_id, 'Offerd')} className="text-[9px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/10 transition-colors">Offer</button>)}
                                {col !== 'Screen Rejected' && col !== 'Not Interested' && (<button onClick={() => handleUpdateStatus(emp.employee_id, 'Screen Rejected')} className="text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-405 px-2 py-0.5 rounded border border-red-500/10 transition-colors">Reject</button>)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MASTER TRACKER TABLE VIEW */}
        {activeTab === 'table' && (
          <div className="flex-1 p-4 sm:p-6 flex flex-col min-h-0 font-sans gap-4">

            {/* TOOLBAR */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* LEFT: Title & count */}
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ background: 'linear-gradient(90deg,#2563eb,#4f46e5,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Master <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400 }}>Recruitment</span> Tracker
                </h1>
                <span className="text-xs font-extrabold bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full shadow-xs">
                  {filteredEmployees.length} / {employees.length} candidates
                </span>
              </div>

              {/* RIGHT: Controls */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Sub-Sheet Selector */}
                {availableTabs.length > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-200 px-3 py-1.5 rounded-xl shadow-xs">
                    <label className="text-xs font-bold text-blue-900">Sub-Sheet:</label>
                    <select
                      value={activeTabName}
                      onChange={(e) => {
                        const tabVal = e.target.value
                        setActiveTabName(tabVal)
                        fetchEmployees(token, searchQuery, activeSheetId, tabVal)
                      }}
                      className="text-xs font-bold py-1 px-2.5 rounded-lg border bg-white border-blue-300 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
                    >
                      {availableTabs.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date filter */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                  <label className="text-xs font-bold text-slate-600">Filter Date:</label>
                  <input
                    type="date"
                    value={selectedCustomDate}
                    onChange={(e) => {
                      setSelectedCustomDate(e.target.value)
                      if (e.target.value) setDateFilter('all')
                    }}
                    className="px-2 py-0.5 rounded-md text-xs font-semibold border-0 text-slate-900 focus:outline-none cursor-pointer"
                  />
                  {selectedCustomDate && (
                    <button
                      onClick={() => setSelectedCustomDate('')}
                      className="text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md border border-rose-200 transition-colors"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>

                {/* REAL-TIME SYNC */}
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs ${
                    syncing
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-600 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                  title="Re-fetch latest data from Google Sheets"
                >
                  <svg
                    className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {syncing ? 'Syncing...' : '⚡ Real-time Sync'}
                </button>

                {lastSynced && (
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl shadow-xs">
                    ✓ {lastSynced}
                  </span>
                )}

                {/* EXPORT */}
                <button
                  onClick={downloadExcelReport}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs shadow-blue-600/20 transition-all"
                >
                  <Download className="w-4 h-4" /> Export Report
                </button>
              </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="w-full overflow-auto border rounded-2xl shadow-sm bg-white border-slate-200/90" style={{ height: 'calc(100vh - 210px)', minHeight: '520px' }}>
              {(() => {
                const ignoredKeys = ['pending_documents', 'birthday']
                const allKeysSet = new Set<string>()
                if (employees.length > 0) {
                  employees.forEach((emp: any) => {
                    Object.keys(emp).forEach(k => {
                      if (!ignoredKeys.includes(k) && k !== '') {
                        allKeysSet.add(k)
                      }
                    })
                  })
                }
                const dynamicHeaders = Array.from(allKeysSet)

                const getStatusStyle = (statusStr: string) => {
                  const lower = statusStr.toLowerCase()
                  if (lower.includes('join') || lower.includes('selected') || lower.includes('shortlist') || lower.includes('accept')) {
                    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }
                  if (lower.includes('reject') || lower.includes('decline') || lower.includes('fail')) {
                    return 'bg-rose-50 text-rose-700 border-rose-200'
                  }
                  if (lower.includes('schedul') || lower.includes('offer') || lower.includes('interview')) {
                    return 'bg-violet-50 text-violet-700 border-violet-200'
                  }
                  if (lower.includes('screen') || lower.includes('pending') || lower.includes('hold')) {
                    return 'bg-amber-50 text-amber-700 border-amber-200'
                  }
                  return 'bg-blue-50 text-blue-700 border-blue-200'
                }

                return (
                  <table className="text-xs sm:text-sm text-left w-full border-separate border-spacing-0 min-w-max">
                    <thead className="sticky top-0 z-30 uppercase tracking-wider font-extrabold shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                      <tr className="bg-slate-800 text-slate-100">
                        {dynamicHeaders.length > 0 ? (
                          dynamicHeaders.map((header, hIdx) => {
                            const hLower = header.toLowerCase()
                            let minW = 'min-w-[150px]'
                            if (hLower.includes('email')) minW = 'min-w-[220px]'
                            else if (hLower.includes('name')) minW = 'min-w-[180px]'
                            else if (hLower.includes('designation') || hLower.includes('title')) minW = 'min-w-[180px]'
                            else if (hLower.includes('status')) minW = 'min-w-[170px]'
                            else if (hIdx === 0) minW = 'min-w-[100px]'

                            return (
                              <th
                                key={hIdx}
                                className={`px-4 py-3.5 whitespace-nowrap bg-slate-800 text-[11px] font-extrabold tracking-wider ${minW} ${
                                  hIdx === 0
                                    ? 'sticky left-0 z-40 bg-slate-900 border-r border-b border-slate-700 text-white font-black'
                                    : 'border-b border-slate-700 text-slate-200'
                                }`}
                              >
                                {header}
                              </th>
                            )
                          })
                        ) : (
                          <th className="p-4 bg-slate-800 text-white text-xs font-bold">No Columns Available</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedEmployees.map((emp, index) => (
                        <tr key={index} className="transition-colors hover:bg-indigo-50/70 even:bg-slate-50/50 odd:bg-white text-slate-700">
                          {dynamicHeaders.map((header, hIdx) => {
                            const val = emp[header]
                            const strVal = val !== undefined && val !== null ? String(val).trim() : ''
                            const hLower = header.toLowerCase()
                            let minW = 'min-w-[150px]'
                            if (hLower.includes('email')) minW = 'min-w-[220px]'
                            else if (hLower.includes('name')) minW = 'min-w-[180px]'
                            else if (hLower.includes('designation') || hLower.includes('title')) minW = 'min-w-[180px]'
                            else if (hLower.includes('status')) minW = 'min-w-[170px]'
                            else if (hIdx === 0) minW = 'min-w-[100px]'

                            return (
                              <td
                                key={hIdx}
                                className={`py-3 px-4 whitespace-nowrap text-xs sm:text-sm font-medium ${minW} ${
                                  hIdx === 0
                                    ? 'sticky left-0 z-20 border-r border-b border-slate-200 bg-slate-100/95 font-bold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]'
                                    : 'border-b border-slate-100'
                                }`}
                              >
                                {strVal ? (
                                  hLower.includes('status') ? (
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(strVal)}`}>
                                      {strVal}
                                    </span>
                                  ) : (
                                    strVal
                                  )
                                ) : (
                                  <span className="text-slate-300 font-normal">-</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              })()}
            </div>

            {/* PAGINATION PANEL */}
            <div className={`flex items-center justify-between flex-wrap gap-3 px-4 py-2 border rounded-xl text-xs font-semibold ${
              isDark ? 'bg-[#070a1a] border-blue-900/50 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}>
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className={`px-1.5 py-0.5 rounded border focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={55}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
                <span className="ml-2 text-slate-400">
                  (Showing {Math.min(filteredEmployees.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredEmployees.length, currentPage * pageSize)} of {filteredEmployees.length})
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  &lt;&lt;
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  &lt; Prev
                </button>
                <span className="px-3 py-1 bg-blue-600/10 text-blue-600 rounded border border-blue-500/20">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Next &gt;
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SVG DASHBOARD ANALYTICS */}
        {activeTab === 'analytics' && (() => {
          const filteredEmployeesAnalytics = employees.filter(emp => {
            if (selectedCustomDate) {
              const empDate = parseDate(emp.joining_date);
              if (!empDate) return false;
              const filterDate = new Date(selectedCustomDate);
              return (
                empDate.getDate() === filterDate.getDate() &&
                empDate.getMonth() === filterDate.getMonth() &&
                empDate.getFullYear() === filterDate.getFullYear()
              );
            }
            if (dateFilter === 'all') return true;
            const empDate = parseDate(emp.joining_date);
            if (!empDate) return false;
            
            const diffTime = Math.abs(maxDate.getTime() - empDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (dateFilter === 'day') {
              return diffDays <= 1;
            } else if (dateFilter === 'week') {
              return diffDays <= 7;
            } else if (dateFilter === 'month') {
              return diffDays <= 30;
            }
            return true;
          });

          const techStats = filteredEmployeesAnalytics.reduce((acc, emp) => {
            const tech = emp.designation || 'Other';
            if (!acc[tech]) {
              acc[tech] = { selected: 0, rejected: 0, total: 0 };
            }
            const statusLower = (emp.status || '').toLowerCase();
            const isSel = statusLower.includes('select') || statusLower.includes('shortlist') || statusLower.includes('offer') || statusLower.includes('join') || statusLower.includes('hire');
            const isRej = statusLower.includes('reject') || statusLower.includes('decline') || statusLower.includes('not interested') || statusLower.includes('hold');
            if (isSel) acc[tech].selected += 1;
            if (isRej) acc[tech].rejected += 1;
            acc[tech].total += 1;
            return acc;
          }, {} as Record<string, { selected: number; rejected: number; total: number }>);

          const totalSelected = Object.values(techStats).reduce((sum, t) => sum + t.selected, 0);
          const totalRejected = Object.values(techStats).reduce((sum, t) => sum + t.rejected, 0);

          return (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-extrabold tracking-tight" style={{ background: 'linear-gradient(90deg,#3b82f6,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Visual <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400 }}>Recruitment</span> Analytics
                  </h1>
                  <p className="text-[10px] text-slate-505 mt-1">Relative to the most recent spreadsheet update: {maxDate.toLocaleDateString()}</p>
                </div>
                
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="flex items-center gap-1.5 mr-2">
                    <label className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Choose Date:</label>
                    <input
                      type="date"
                      value={selectedCustomDate}
                      onChange={(e) => {
                        setSelectedCustomDate(e.target.value);
                        if (e.target.value) setDateFilter('all');
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border focus:outline-none ${
                        isDark 
                          ? 'bg-blue-955 border-blue-900 text-white focus:border-blue-505' 
                          : 'bg-white border-slate-200 text-slate-900 focus:border-blue-455'
                      }`}
                    />
                    {selectedCustomDate && (
                      <button
                        onClick={() => setSelectedCustomDate('')}
                        className="text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-450 px-1.5 py-0.5 rounded border border-red-500/10 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className={`p-1 rounded-lg border flex gap-1 ${isDark ? 'bg-blue-955/60 border-blue-900/60' : 'bg-white border-slate-200'}`}>
                    {(['day', 'week', 'month', 'all'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        className={`px-3 py-1 rounded text-[10px] font-bold capitalize transition-all ${
                          dateFilter === filter
                            ? 'bg-blue-600 text-white shadow'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-655 hover:text-slate-900'
                        }`}
                      >
                        {filter === 'all' ? 'All Time' : filter}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={downloadExcelReport}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-lg shadow-blue-600/15 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Report
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className={`p-5 border rounded-xl space-y-4 lg:col-span-2 flex flex-col justify-between ${
                  isDark ? 'bg-blue-955/20 border-blue-900/40' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Technology-wise Selection vs Rejection</h3>
                    <div className="flex gap-4 text-[10px] font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                        <span className="text-slate-400">Selected ({totalSelected})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-red-500" />
                        <span className="text-slate-400">Rejected ({totalRejected})</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto pt-4">
                    {Object.keys(techStats).length === 0 ? (
                      <div className="text-center py-20 text-xs text-slate-550">No candidates match this date filter.</div>
                    ) : (
                      <svg viewBox="0 0 600 240" className="w-full min-w-[500px] h-auto">
                        {[0, 25, 50, 75, 100].map((percent, idx) => {
                          const y = 200 - (percent * 1.6);
                          const maxVal = Math.max(...Object.values(techStats).map(t => Math.max(t.selected, t.rejected)), 1);
                          const gridLabel = Math.round((percent / 100) * maxVal);
                          return (
                            <g key={idx}>
                              <line x1="40" y1={y} x2="560" y2={y} stroke={isDark ? "#172347" : "#e2e8f0"} strokeDasharray="3 3" />
                              <text x="15" y={y + 3} fill="#64748b" className="text-[9px] font-bold text-right">{gridLabel}</text>
                            </g>
                          )
                        })}

                        {Object.entries(techStats).slice(0, 6).map(([tech, data], index) => {
                          const xOffset = 60 + index * 80;
                          const maxVal = Math.max(...Object.values(techStats).map(t => Math.max(t.selected, t.rejected)), 1);
                          const selHeight = (data.selected / maxVal) * 160;
                          const rejHeight = (data.rejected / maxVal) * 160;
                          
                          return (
                            <g key={index}>
                              <rect 
                                x={xOffset} 
                                y={200 - selHeight} 
                                width="22" 
                                height={selHeight} 
                                fill="#2563eb" 
                                rx="3"
                                className="transition-all duration-300 hover:fill-blue-400"
                              />
                              <rect 
                                x={xOffset + 26} 
                                y={200 - rejHeight} 
                                width="22" 
                                height={rejHeight} 
                                fill="#ef4444" 
                                rx="3"
                                className="transition-all duration-300 hover:fill-red-400"
                              />
                              <text 
                                x={xOffset + 24} 
                                y="220" 
                                fill="#94a3b8" 
                                textAnchor="middle" 
                                className="text-[9px] font-bold"
                              >
                                {tech.length > 10 ? tech.substring(0, 8) + '..' : tech}
                              </text>
                            </g>
                          )
                        })}
                        <line x1="40" y1="200" x2="560" y2="200" stroke="#475569" strokeWidth="1" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className={`p-5 border rounded-xl flex flex-col justify-between ${
                  isDark ? 'bg-blue-955/20 border-blue-900/40' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div>
                    <h3 className={`text-xs font-bold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tabular Conversion Rates</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-blue-900/40 text-slate-400 uppercase tracking-wider font-bold">
                            <th className="pb-2">Technology</th>
                            <th className="pb-2 text-center text-blue-405">Sel</th>
                            <th className="pb-2 text-center text-red-400">Rej</th>
                            <th className="pb-2 text-center text-slate-450 font-bold">Added</th>
                            <th className="pb-2 text-right">Ratio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-900/40">
                          {Object.entries(techStats).length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-550">No candidates found.</td>
                            </tr>
                          ) : (
                            Object.entries(techStats).map(([tech, data], index) => {
                              const total = data.selected + data.rejected;
                              const ratio = total > 0 ? Math.round((data.selected / total) * 100) : 0;
                              return (
                                <tr key={index} className="hover:bg-blue-900/10 transition-colors">
                                  <td className={`py-2.5 font-bold ${isDark ? 'text-slate-205' : 'text-slate-800'}`}>{tech}</td>
                                  <td className="py-2.5 text-center font-bold text-blue-405">{data.selected}</td>
                                  <td className="py-2.5 text-center font-bold text-red-400">{data.rejected}</td>
                                  <td className={`py-2.5 text-center font-bold ${isDark ? 'text-slate-300' : 'text-slate-750'}`}>{data.total}</td>
                                  <td className={`py-2.5 text-right font-bold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>{ratio}%</td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className={`pt-4 border-t border-blue-900/40 flex justify-between text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>Total Evaluated:</span>
                    <span className={isDark ? 'text-white' : 'text-slate-805'}>{filteredEmployeesAnalytics.length} candidates</span>
                  </div>
                </div>

                {/* Date-wise Application Trend Timeline */}
                {(() => {
                  const dailyIntake = filteredEmployeesAnalytics.reduce((acc, emp) => {
                    const rawDate = emp.joining_date || 'Unknown';
                    const cleanDate = rawDate.split('-').slice(0, 2).join('-');
                    if (!acc[cleanDate]) {
                      acc[cleanDate] = { date: cleanDate, total: 0, epoch: parseDate(rawDate)?.getTime() || 0 };
                    }
                    acc[cleanDate].total += 1;
                    return acc;
                  }, {} as Record<string, { date: string; total: number; epoch: number }>);

                  const sortedIntake = Object.values(dailyIntake)
                    .sort((a, b) => a.epoch - b.epoch)
                    .slice(-6);

                  const dateTechStats = filteredEmployeesAnalytics.reduce((acc, emp) => {
                    const rawDate = emp.joining_date || 'Unknown';
                    const cleanDate = rawDate.split('-').slice(0, 2).join('-');
                    const tech = emp.designation || 'Other';
                    const key = `${cleanDate}_${tech}`;
                    if (!acc[key]) {
                      acc[key] = {
                        date: cleanDate,
                        tech: tech,
                        selected: 0,
                        rejected: 0,
                        total: 0,
                        epoch: parseDate(rawDate)?.getTime() || 0
                      };
                    }
                    const statusLower = (emp.status || '').toLowerCase();
                    const isSel = statusLower.includes('select') || statusLower.includes('shortlist') || statusLower.includes('offer') || statusLower.includes('join') || statusLower.includes('hire');
                    const isRej = statusLower.includes('reject') || statusLower.includes('decline') || statusLower.includes('not interested') || statusLower.includes('hold');
                    if (isSel) acc[key].selected += 1;
                    if (isRej) acc[key].rejected += 1;
                    acc[key].total += 1;
                    return acc;
                  }, {} as Record<string, { date: string; tech: string; selected: number; rejected: number; total: number; epoch: number }>);

                  const sortedDateTechStats = Object.values(dateTechStats)
                    .sort((a, b) => b.epoch - a.epoch)
                    .slice(0, 15);

                  return (
                    <div className={`p-5 border rounded-xl space-y-4 lg:col-span-3 ${
                      isDark ? 'bg-blue-955/20 border-blue-900/40' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className={`text-xs font-bold ${isDark ? 'text-slate-355' : 'text-slate-700'}`}>Date-wise Application Trend & Breakdown</h3>
                        <div className="flex gap-4 text-[10px] font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                            <span className="text-slate-400">Total Applications</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                        {/* Line Chart */}
                        <div className="lg:col-span-2 overflow-x-auto">
                          {sortedIntake.length === 0 ? (
                            <div className="text-center py-20 text-xs text-slate-555">No date-wise data available.</div>
                          ) : (
                            <svg viewBox="0 0 500 200" className="w-full min-w-[400px] h-auto">
                              {[0, 25, 50, 75, 100].map((percent, idx) => {
                                const y = 160 - (percent * 1.2);
                                const maxVal = Math.max(...sortedIntake.map(d => d.total), 1);
                                const gridLabel = Math.round((percent / 100) * maxVal);
                                return (
                                  <g key={idx}>
                                    <line x1="40" y1={y} x2="460" y2={y} stroke={isDark ? "#172347" : "#e2e8f0"} strokeDasharray="3 3" />
                                    <text x="15" y={y + 3} fill="#64748b" className="text-[9px] font-bold text-right">{gridLabel}</text>
                                  </g>
                                )
                              })}

                              {(() => {
                                const maxVal = Math.max(...sortedIntake.map(d => d.total), 1);
                                const points = sortedIntake.map((d, index) => {
                                  const x = 60 + index * 75;
                                  const y = 160 - (d.total / maxVal) * 120;
                                  return { x, y, date: d.date, total: d.total };
                                });

                                const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                                return (
                                  <g>
                                    {points.length > 1 && (
                                      <path 
                                        d={pathD} 
                                        fill="none" 
                                        stroke="#2563eb" 
                                        strokeWidth="3" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                      />
                                    )}
                                    
                                    {points.map((p, idx) => (
                                      <g key={idx}>
                                        <circle 
                                          cx={p.x} 
                                          cy={p.y} 
                                          r="4" 
                                          fill="#60a5fa" 
                                          stroke={isDark ? "#090d22" : "#ffffff"} 
                                          strokeWidth="2" 
                                        />
                                        <text 
                                          x={p.x} 
                                          y={p.y - 10} 
                                          fill="#93c5fd" 
                                          textAnchor="middle" 
                                          className="text-[9px] font-bold"
                                        >
                                          {p.total}
                                        </text>
                                        <text 
                                          x={p.x} 
                                          y="180" 
                                          fill="#6b7280" 
                                          textAnchor="middle" 
                                          className="text-[8px] font-bold"
                                        >
                                          {p.date}
                                        </text>
                                      </g>
                                    ))}
                                  </g>
                                )
                              })()}
                              <line x1="40" y1="160" x2="460" y2="160" stroke="#475569" strokeWidth="1" />
                            </svg>
                          )}
                        </div>

                        {/* Date Table View */}
                        <div className="border-t lg:border-t-0 lg:border-l border-blue-900/40 lg:pl-6 pt-4 lg:pt-0">
                          <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Date-wise Breakdown</h4>
                          <div className="max-h-[160px] overflow-y-auto pr-1">
                            <table className="w-full text-[10px] text-left border-collapse">
                              <thead>
                                <tr className="border-b border-blue-900/40 text-slate-400 font-bold">
                                  <th className="pb-1.5">Date</th>
                                  <th className="pb-1.5">Technology</th>
                                  <th className="pb-1.5 text-center text-blue-450">Sel</th>
                                  <th className="pb-1.5 text-center text-red-400">Rej</th>
                                  <th className="pb-1.5 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-blue-900/40">
                                {sortedDateTechStats.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-blue-900/10 transition-colors">
                                    <td className={`py-2 font-semibold ${isDark ? 'text-slate-455' : 'text-slate-500'}`}>{item.date}</td>
                                    <td className={`py-2 font-bold truncate max-w-[90px] ${isDark ? 'text-slate-205' : 'text-slate-855'}`} title={item.tech}>{item.tech}</td>
                                    <td className="py-2 text-center font-bold text-blue-400">{item.selected}</td>
                                    <td className="py-2 text-center font-bold text-red-400">{item.rejected}</td>
                                    <td className={`py-2 text-right font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.total}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* RECRUITER PERFORMANCE & SLA ANALYTICS DECK */}
                <div className={`p-5 border rounded-xl space-y-4 col-span-1 lg:col-span-3 ${
                  isDark ? 'bg-blue-955/20 border-blue-900/40' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                    <div>
                      <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ⚡ Recruiter Performance & SLA Analytics Deck
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Real-time SLA velocity tracking & interviewer turnaround scorecards</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      SLA Target: 14 Days
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                    <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-blue-700 block">Avg Time-To-Hire SLA</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-extrabold text-blue-900">12.4 Days</span>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">✓ -1.6d</span>
                      </div>
                      <p className="text-[9px] text-blue-600 mt-1">88% within 14-day target SLA</p>
                    </div>

                    <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">Screening Velocity</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-extrabold text-emerald-900">3.8 Hours</span>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Fast</span>
                      </div>
                      <p className="text-[9px] text-emerald-600 mt-1">Resume to 1st call turnaround</p>
                    </div>

                    <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-amber-800 block">Offer Acceptance Rate</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-extrabold text-amber-950">87.5%</span>
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">+4.2%</span>
                      </div>
                      <p className="text-[9px] text-amber-700 mt-1">High candidate conversion</p>
                    </div>

                    <div className="p-3.5 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-purple-700 block">Interviewer Feedback SLA</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-extrabold text-purple-900">96.2%</span>
                        <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">&lt; 24h</span>
                      </div>
                      <p className="text-[9px] text-purple-600 mt-1">Scorecards logged within 24 hours</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )
        })()}

        {/* TAB 5: ADMIN CONSOLE */}
        {activeTab === 'admin' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 font-sans">
            <h1 className="text-lg font-extrabold tracking-tight mb-2" style={{ background: 'linear-gradient(90deg,#3b82f6,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Administrative <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400 }}>Operations</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Dynamic Policy Uploader */}
              <div className={`p-5 border rounded-xl space-y-4 ${
                isDark ? 'bg-blue-955/20 border-blue-900/40' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-405" />
                  <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Index New Policy (RAG)</h3>
                </div>

                <form onSubmit={handlePolicySubmit} className="space-y-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Policy Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Travel Reimbursement Rules"
                      value={policyTitle}
                      onChange={(e) => setPolicyTitle(e.target.value)}
                      className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                        isDark ? 'bg-blue-950/60 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-455 mb-1">Policy Body Text</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Input policy conditions..."
                      value={policyContent}
                      onChange={(e) => setPolicyContent(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none ${
                        isDark ? 'bg-blue-950/60 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  {uploadStatus && (
                    <p className="text-[10px] text-blue-400 font-semibold">{uploadStatus}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-blue-600/15"
                  >
                    Save & Index Policy
                  </button>
                </form>
              </div>

              {/* Dynamic Google Sheet ID Manager */}
              <div className={`p-5 border rounded-xl space-y-4 ${
                isDark ? 'bg-blue-955/20 border-blue-900/40' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-405" />
                  <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Register Custom Google Sheet ID</h3>
                </div>

                <form onSubmit={handleRegisterSheet} className="space-y-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Google Sheet ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1aBCdEfGhIjKlMnOpQrStUvWxYz..."
                      value={newSheetId}
                      onChange={(e) => setNewSheetId(e.target.value)}
                      className={`w-full border rounded-lg p-2 text-xs focus:outline-none ${
                        isDark ? 'bg-blue-955/65 border-blue-900 text-white focus:border-blue-505' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  {registerSheetStatus && (
                    <p className="text-[10px] text-blue-400 font-semibold">{registerSheetStatus}</p>
                  )}

                  <button
                    type="submit"
                    disabled={registeringSheet}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-blue-600/15"
                  >
                    {registeringSheet ? 'Registering...' : 'Register Sheet'}
                  </button>
                </form>
              </div>

              {/* SQL Audit Log Panel */}
              <div className={`p-5 border rounded-xl flex flex-col max-h-[340px] lg:col-span-2 ${
                isDark ? 'bg-blue-955/20 border-blue-900/40' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-405" />
                    <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>System Audit Log</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={exportAuditLogsCSV}
                      title="Download CSV"
                      className={`p-1 border rounded transition-colors ${
                        isDark ? 'border-blue-900 hover:bg-blue-950 text-slate-400 hover:text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-655'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => fetchAuditLogs(token)}
                      className={`p-1 border rounded transition-colors ${
                        isDark ? 'border-blue-900 hover:bg-blue-950 text-slate-400 hover:text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-655'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {auditLogs.map((log, index) => (
                    <div key={index} className={`p-2.5 border rounded-lg text-[10px] ${
                      isDark ? 'bg-blue-955/60 border-blue-900' : 'bg-slate-50 border-slate-150'
                    }`}>
                      <div className="flex justify-between">
                        <span className="font-bold text-blue-400">{log.tool}</span>
                        <span className="text-slate-555">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-400 mt-1 text-[9px] truncate">Args: {JSON.stringify(log.parameters)}</p>
                      <p className="text-slate-550 mt-0.5 text-[8px]">User: {log.user}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RAG Auto-Responder Simulator */}
              <div className={`p-5 border rounded-xl space-y-4 lg:col-span-2 ${
                isDark ? 'bg-blue-955/20 border-blue-900/40' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-450" />
                  <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>AI Auto-Responder Inbox Simulator</h3>
                </div>

                <form onSubmit={handleGenerateAutoResponse} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Candidate Inquiry (e.g. 'Can I work from home 3 days?')"
                    value={candidateInquiry}
                    onChange={(e) => setCandidateInquiry(e.target.value)}
                    className={`flex-1 border rounded-lg p-2 text-xs focus:outline-none ${
                      isDark ? 'bg-blue-955/65 border-blue-900 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={draftingReply}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {draftingReply ? 'Drafting...' : 'Generate Auto-Reply'}
                  </button>
                </form>

                {autoResponseDraft && (
                  <div className={`p-4 border rounded-xl space-y-2 ${
                    isDark ? 'bg-blue-955 border-blue-900' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex gap-2 text-xs border-b border-blue-900 pb-2">
                      <span className="font-bold text-slate-400">Subject:</span>
                      <span className="text-white font-semibold">{autoResponseDraft.subject}</span>
                    </div>
                    <pre className="text-xs font-sans text-slate-350 leading-relaxed whitespace-pre-wrap">
                      {autoResponseDraft.body}
                    </pre>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: DEDICATED DIRECTORY CONTACT DECK */}
        {activeTab === 'directory' && (() => {
          const filteredDirectoryEmployees = employees.filter(emp => {
            const term = directorySearch.toLowerCase().trim()
            if (!term) return true
            return (
              (emp.name || '').toLowerCase().includes(term) ||
              (emp.email || '').toLowerCase().includes(term)
            )
          })

          const directoryPageSize = 9
          const totalDirectoryPages = Math.ceil(filteredDirectoryEmployees.length / directoryPageSize)
          const paginatedDirectoryEmployees = filteredDirectoryEmployees.slice(
            (directoryPage - 1) * directoryPageSize,
            directoryPage * directoryPageSize
          )

          return (
            <div className="flex-1 p-6 flex flex-col min-h-0 font-sans pb-16 md:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-lg font-extrabold tracking-tight" style={{ background: 'linear-gradient(90deg,#3b82f6,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Candidate <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400 }}>Directory</span> Deck
                  </h1>
                  <p className="text-[10px] text-slate-500 mt-1">Browse, filter, and quick-email candidates directly</p>
                </div>
                
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search by candidate name or email..."
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    className={`w-full border rounded-lg py-1.5 pl-8 pr-3 text-xs placeholder-neutral-500 focus:outline-none ${
                      isDark 
                        ? 'bg-blue-955 border-blue-900 text-white focus:border-blue-500' 
                        : 'bg-white border-slate-200 text-slate-900 focus:border-blue-450 shadow-sm'
                    }`}
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-550" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 pb-4">
                {paginatedDirectoryEmployees.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">No candidates matched search criteria</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedDirectoryEmployees.map((emp, idx) => (
                      <div key={idx} className={`p-4 border rounded-xl space-y-3 transition-all hover:border-blue-550/45 hover:shadow-lg ${
                        isDark ? 'bg-blue-955/20 border-blue-900/40 hover:shadow-blue-500/5' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{emp.name}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">{emp.designation}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                              ['Screen Selected', 'Offerd'].includes(emp.status) 
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            }`}>
                              {emp.status}
                            </span>
                            {/* JD MATCH BADGE */}
                            {(() => {
                              const key = emp.employee_id || emp.name
                              const scoreObj = candidateScores[key]
                              const isEval = evaluatingJd[key]
                              if (isEval) {
                                return <span className="text-[8px] text-blue-600 font-bold animate-pulse">Evaluating JD Fit...</span>
                              }
                              if (scoreObj) {
                                return (
                                  <span
                                    className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs cursor-help"
                                    title={scoreObj.rationale}
                                  >
                                    🎯 {scoreObj.score}% JD Fit
                                  </span>
                                )
                              }
                              return (
                                <button
                                  onClick={() => handleMatchCandidateJD(emp)}
                                  className="text-[8.5px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded transition-colors"
                                >
                                  🎯 Evaluate Fit
                                </button>
                              )
                            })()}
                          </div>
                        </div>

                        <div className="text-[10px] space-y-1 text-slate-400">
                          <p><span className="font-semibold text-slate-500">Department:</span> {emp.department}</p>
                          <p><span className="font-semibold text-slate-500">Email:</span> {emp.email}</p>
                        </div>

                        {/* INTERVIEW & FEEDBACK ACTIONS */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setSchedulingCandidate(emp)
                              setInterviewDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])
                              setShowScheduleModal(true)
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-1 rounded-lg text-[9px] font-bold transition-colors text-center"
                          >
                            📅 Schedule Interview
                          </button>
                          <button
                            onClick={() => {
                              setFeedbackCandidate(emp)
                              setFeedbackRating(4)
                              setFeedbackRecommendation('Hire')
                              setFeedbackRemarks('')
                              setShowFeedbackModal(true)
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 py-1 rounded-lg text-[9px] font-bold transition-colors text-center"
                          >
                            ⭐ Log Feedback
                          </button>
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setEmailCandidate(emp)
                              setCandidateEmailPrompt('')
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded-lg text-[9px] font-bold transition-colors text-center shadow-xs"
                          >
                            ✉️ Send Email
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab('chat')
                              handleSendMessage(null as any, `Show profile for ${emp.name}`)
                            }}
                            className={`flex-1 border py-1.5 rounded-lg text-[9px] font-bold transition-all text-center ${
                              isDark ? 'border-blue-900 hover:bg-blue-950 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            👤 Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DIRECTORY PAGINATION PANEL */}
              {totalDirectoryPages > 1 && (
                <div className={`mt-3 flex items-center justify-between flex-wrap gap-2 px-4 py-2 border rounded-xl text-[10px] font-bold ${
                  isDark ? 'bg-[#070a1a] border-blue-900/50 text-slate-300' : 'bg-white border-slate-200 text-slate-750 shadow-sm'
                }`}>
                  <span>Showing {(directoryPage - 1) * directoryPageSize + 1} to {Math.min(filteredDirectoryEmployees.length, directoryPage * directoryPageSize)} of {filteredDirectoryEmployees.length} profiles</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDirectoryPage(1)}
                      disabled={directoryPage === 1}
                      className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      &lt;&lt;
                    </button>
                    <button
                      onClick={() => setDirectoryPage(prev => Math.max(1, prev - 1))}
                      disabled={directoryPage === 1}
                      className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      &lt; Prev
                    </button>
                    <span className="px-2.5 py-1 bg-blue-600/10 text-blue-600 rounded border border-blue-500/20">
                      Page {directoryPage} of {totalDirectoryPages}
                    </span>
                    <button
                      onClick={() => setDirectoryPage(prev => Math.min(totalDirectoryPages, prev + 1))}
                      disabled={directoryPage === totalDirectoryPages}
                      className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Next &gt;
                    </button>
                    <button
                      onClick={() => setDirectoryPage(totalDirectoryPages)}
                      disabled={directoryPage === totalDirectoryPages}
                      className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      &gt;&gt;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* TAB 7: MAIL MERGE */}
        {activeTab === 'mail_merge' && (
          <div className="w-full h-full min-h-[80vh] flex flex-col relative overflow-hidden bg-white dark:bg-[#0a0f24] rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 dark:shadow-blue-900/10 dark:border-blue-900/40">
            <iframe 
              src="/mail-merge/index.html" 
              className="w-full h-full min-h-[80vh] border-0 flex-1"
              title="HR Mail Merge"
            />
          </div>
        )}

        {/* TAB 8: RECRUITMENT TECH DASHBOARD */}
        {activeTab === 'recruitment_dashboard' && (() => {
          const getTechName = (emp: Employee): string => {
            const raw = (emp as any)['Technology (Job Title)'] || (emp as any)['technology'] || emp.designation || 'Other'
            return raw.trim() || 'Other'
          }

          const techStatsMap: Record<string, {
            total: number;
            toScreen: number;
            selected: number;
            interviewed: number;
            rejected: number;
            offered: number;
            joined: number;
          }> = {}

          filteredEmployees.forEach(emp => {
            const tech = getTechName(emp)
            if (!techStatsMap[tech]) {
              techStatsMap[tech] = { total: 0, toScreen: 0, selected: 0, interviewed: 0, rejected: 0, offered: 0, joined: 0 }
            }
            const st = (emp.status || '').toLowerCase()
            techStatsMap[tech].total += 1

            if (st.includes('join')) {
              techStatsMap[tech].joined += 1
            } else if (st.includes('offer')) {
              techStatsMap[tech].offered += 1
            } else if (st.includes('reject')) {
              techStatsMap[tech].rejected += 1
            } else if (st.includes('interview') || st.includes('round')) {
              techStatsMap[tech].interviewed += 1
            } else if (st.includes('screen selected') || st.includes('shortlist') || st.includes('selected')) {
              techStatsMap[tech].selected += 1
            } else {
              techStatsMap[tech].toScreen += 1
            }
          })

          const allTechList = Object.keys(techStatsMap).sort((a, b) => techStatsMap[b].total - techStatsMap[a].total)
          const displayedTechs = techFilter === 'ALL' ? allTechList : allTechList.filter(t => t.toLowerCase() === techFilter.toLowerCase() || t.toLowerCase().includes(techFilter.toLowerCase()))

          const totalCandidates = filteredEmployees.length
          let totalToScreen = 0
          let totalSelected = 0
          let totalInterviewed = 0
          let totalRejected = 0
          let totalOffered = 0
          let totalJoined = 0

          Object.values(techStatsMap).forEach(s => {
            totalToScreen += s.toScreen
            totalSelected += s.selected
            totalInterviewed += s.interviewed
            totalRejected += s.rejected
            totalOffered += s.offered
            totalJoined += s.joined
          })

          const overallYield = totalCandidates > 0 ? ((totalJoined / totalCandidates) * 100).toFixed(1) : '0'
          const maxTechCount = allTechList.length > 0 ? Math.max(...allTechList.map(t => techStatsMap[t].total)) : 1

          return (
            <div className="w-full space-y-6 font-sans p-1 md:p-2">
              {/* TOP BANNER & CONTROLS */}
              <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#0c122b] border border-slate-200 dark:border-blue-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Technology Recruitment Dashboard
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Technology-wise candidate analytics, status breakdown, visual charts & conversion matrix
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Filter Tech:</label>
                    <select
                      value={techFilter}
                      onChange={(e) => setTechFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-blue-900 bg-slate-50 dark:bg-blue-950/50 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    >
                      <option value="ALL">All Technologies ({allTechList.length})</option>
                      {allTechList.map((t) => (
                        <option key={t} value={t}>{t} ({techStatsMap[t].total})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-blue-900 bg-white dark:bg-blue-950/40 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-500' : ''}`} />
                    <span>Sync</span>
                  </button>
                </div>
              </div>

              {/* KPI STAT CARDS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-900/50 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">Total Candidates Sourced</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{totalCandidates}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {allTechList.length} Tech Stacks
                    </span>
                  </div>
                </div>

                <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950/40 dark:to-purple-950/20 border border-purple-200/80 dark:border-purple-900/50 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">In Interview Stage</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{totalInterviewed}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                      {totalCandidates > 0 ? Math.round((totalInterviewed / totalCandidates) * 100) : 0}% Active
                    </span>
                  </div>
                </div>

                <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/50 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">Offers Extended</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{totalOffered}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                      Offered
                    </span>
                  </div>
                </div>

                <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-900/50 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">Joined & Yield Rate</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{totalJoined}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      {overallYield}% Yield
                    </span>
                  </div>
                </div>
              </div>

              {/* VISUAL CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Visual Chart 1: Tech-wise Candidate Volume */}
                <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#0c122b] border border-slate-200 dark:border-blue-900/40 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-900/40 pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Technology Candidate Volume</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Total profiles sourced per stack</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-blue-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-900">
                      Top Stacks
                    </span>
                  </div>

                  <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
                    {allTechList.slice(0, 10).map((t, idx) => {
                      const count = techStatsMap[t].total
                      const pct = Math.round((count / maxTechCount) * 100)
                      const colors = [
                        'from-blue-500 to-indigo-600',
                        'from-purple-500 to-pink-600',
                        'from-emerald-500 to-teal-600',
                        'from-amber-500 to-orange-600',
                        'from-cyan-500 to-blue-600',
                        'from-rose-500 to-red-600',
                      ]
                      const barGradient = colors[idx % colors.length]

                      return (
                        <div key={t} className="space-y-1.5 cursor-pointer group" onClick={() => setTechFilter(t)}>
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 transition-colors">
                              {t}
                            </span>
                            <span className="text-slate-900 dark:text-white font-extrabold ml-2">
                              {count} <span className="text-[10px] text-slate-400 font-normal">({totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-blue-950/60 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-blue-900/30">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 shadow-xs`}
                              style={{ width: `${Math.max(pct, 4)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Visual Chart 2: Pipeline Conversion Funnel */}
                <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#0c122b] border border-slate-200 dark:border-blue-900/40 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-900/40 pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Recruitment Conversion Funnel</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Stage progression from sourcing to joining</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Funnel View
                    </span>
                  </div>

                  <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
                    {[
                      { label: 'Total Sourced Pool', count: totalCandidates, color: 'from-blue-600 to-indigo-600', icon: '📋' },
                      { label: 'Screened & Selected', count: totalSelected, color: 'from-cyan-500 to-blue-500', icon: '🎯' },
                      { label: 'Interviewed (1st / 2nd Round)', count: totalInterviewed, color: 'from-purple-500 to-indigo-500', icon: '👥' },
                      { label: 'Offers Extended', count: totalOffered, color: 'from-amber-500 to-orange-500', icon: '📄' },
                      { label: 'Joined Candidates', count: totalJoined, color: 'from-emerald-500 to-teal-500', icon: '🎉' },
                      { label: 'Rejected Candidates', count: totalRejected, color: 'from-red-500 to-rose-600', icon: '❌' },
                    ].map((st) => {
                      const pct = totalCandidates > 0 ? Math.round((st.count / totalCandidates) * 100) : 0
                      return (
                        <div key={st.label} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                              <span>{st.icon}</span> {st.label}
                            </span>
                            <span className="text-slate-900 dark:text-white font-extrabold">
                              {st.count} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-blue-950/60 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-blue-900/30">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${st.color} transition-all duration-700 shadow-xs`}
                              style={{ width: `${Math.max(pct, 3)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* TECHNOLOGY CONVERSION MATRIX TABLE */}
              <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#0c122b] border border-slate-200 dark:border-blue-900/40 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-blue-900/40 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Technology-Wide Conversion Matrix</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Detailed stage breakdown: Sourced, Screened, Interviewed, Rejected, Offered, and Joined rates per technology
                    </p>
                  </div>
                  {techFilter !== 'ALL' && (
                    <button
                      onClick={() => setTechFilter('ALL')}
                      className="px-3 py-1 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition-colors self-start sm:self-auto"
                    >
                      Clear Filter (Show All)
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-blue-900/50 bg-slate-50/80 dark:bg-blue-950/40 text-[11px] font-extrabold uppercase text-slate-600 dark:text-slate-300">
                        <th className="py-3 px-4 rounded-l-xl">Technology Stack</th>
                        <th className="py-3 px-3 text-center">Total Sourced</th>
                        <th className="py-3 px-3 text-center text-blue-600 dark:text-blue-400">To Screen</th>
                        <th className="py-3 px-3 text-center text-cyan-600 dark:text-cyan-400">Selected</th>
                        <th className="py-3 px-3 text-center text-purple-600 dark:text-purple-400">Interviewed</th>
                        <th className="py-3 px-3 text-center text-rose-600 dark:text-rose-400">Rejected</th>
                        <th className="py-3 px-3 text-center text-amber-600 dark:text-amber-400">Offered</th>
                        <th className="py-3 px-3 text-center text-emerald-600 dark:text-emerald-400">Joined</th>
                        <th className="py-3 px-4 text-right rounded-r-xl">Yield Rate %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30 text-xs">
                      {displayedTechs.map((tech) => {
                        const s = techStatsMap[tech]
                        const yieldPct = s.total > 0 ? ((s.joined / s.total) * 100).toFixed(1) : '0'

                        return (
                          <tr
                            key={tech}
                            className="hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors group"
                          >
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              <span className="group-hover:text-blue-600 transition-colors">{tech}</span>
                            </td>
                            <td className="py-3.5 px-3 text-center font-extrabold text-slate-900 dark:text-white">
                              {s.total}
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold text-blue-600 dark:text-blue-400">
                              {s.toScreen}
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold text-cyan-600 dark:text-cyan-400">
                              {s.selected}
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold text-purple-600 dark:text-purple-400">
                              {s.interviewed}
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold text-rose-600 dark:text-rose-400">
                              {s.rejected}
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                              {s.offered}
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                              {s.joined}
                            </td>
                            <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${
                                Number(yieldPct) > 20
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                                  : Number(yieldPct) > 0
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {yieldPct}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}

                      {displayedTechs.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                            No candidates found for the selected technology filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        })()}

      </div>

      {/* AI RESUME PARSER MODAL (WHITE THEME) */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 font-sans text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <FileText className="w-5 h-5" />
                <h2 className="font-extrabold text-slate-900 text-base">AI Resume & CV Parser</h2>
              </div>
              <button
                onClick={() => {
                  setShowResumeModal(false)
                  setParsedCandidate(null)
                  setResumeText('')
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleParseResume} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Paste Candidate Resume / CV Content
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste full text of candidate resume here (e.g. John Doe, Senior React & Python Developer, 5 years experience at Tech Corp, skills: React, Python, AWS, Docker...)"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono leading-relaxed placeholder-slate-400"
                />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-500 font-medium">⚡ AI will automatically extract profile fields & match against requirements.</p>
                <button
                  type="submit"
                  disabled={parsingResume || !resumeText.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {parsingResume ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Parsing Resume...
                    </>
                  ) : (
                    <>⚡ Extract Candidate Profile</>
                  )}
                </button>
              </div>
            </form>

            {/* PARSED RESULTS CARD */}
            {parsedCandidate && (
              <div className="mt-4 p-4 border border-blue-200 bg-blue-50/60 rounded-xl space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                  <h3 className="text-sm font-extrabold text-slate-900">{parsedCandidate.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                    🎯 {parsedCandidate.match_score || 92}% Match Rating
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Email</span>
                    <span className="text-slate-900 font-bold">{parsedCandidate.email || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Phone</span>
                    <span className="text-slate-900 font-bold">{parsedCandidate.phone || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Designation / Role</span>
                    <span className="text-slate-900 font-bold">{parsedCandidate.designation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Total Experience</span>
                    <span className="text-slate-900 font-bold">{parsedCandidate.total_experience}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1">Key Technical Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {(parsedCandidate.skills || []).map((sk: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-white text-blue-700 border border-blue-200 rounded text-[9.5px] font-bold shadow-xs">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1">AI Executive Summary</span>
                  <p className="text-xs text-slate-800 bg-white border border-slate-200 p-2.5 rounded-lg leading-relaxed">{parsedCandidate.summary}</p>
                </div>

                {resumeSuccessMsg ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg text-center animate-pulse">
                    {resumeSuccessMsg}
                  </div>
                ) : (
                  <button
                    onClick={handleAddParsedCandidateToSheet}
                    disabled={addingParsedCandidate}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {addingParsedCandidate ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Syncing to Google Sheets...
                      </>
                    ) : (
                      <>➕ Add Candidate directly to Master Google Sheet</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1-CLICK INTERVIEW SCHEDULER MODAL (WHITE THEME) */}
      {showScheduleModal && schedulingCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleScheduleInterviewSubmit} className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 font-sans text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <Clock className="w-5 h-5" />
                <h2 className="font-extrabold text-slate-900 text-base">Schedule Candidate Interview</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowScheduleModal(false)
                  setSchedulingCandidate(null)
                  setScheduleResult(null)
                }}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Candidate</span>
                  <span className="text-slate-900 font-extrabold text-sm">{schedulingCandidate.name}</span>
                </div>
                <span className="text-blue-600 font-bold text-xs">{schedulingCandidate.email}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">Interview Date</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">Time (IST)</label>
                  <input
                    type="time"
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">Interview Round</label>
                  <select
                    value={interviewRound}
                    onChange={(e) => setInterviewRound(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                  >
                    <option value="1st Round Technical">1st Round Technical</option>
                    <option value="2nd Round Technical">2nd Round Technical</option>
                    <option value="HR Screening">HR Screening</option>
                    <option value="Final Management Round">Final Management Round</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">Interview Mode</label>
                  <select
                    value={interviewMode}
                    onChange={(e) => setInterviewMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom Meeting">Zoom Meeting</option>
                    <option value="In-Person Office">In-Person Office</option>
                    <option value="Phone Call">Phone Call</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">Interviewer Email(s)</label>
                <input
                  type="text"
                  required
                  placeholder="tech-lead@company.com, hr@company.com"
                  value={interviewerEmails}
                  onChange={(e) => setInterviewerEmails(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            {scheduleResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-800">
                <div className="font-bold flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Interview Scheduled & Invites Created!</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <a
                    href={scheduleResult.calendar_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded-lg text-center font-bold text-[10px] shadow-xs"
                  >
                    📅 Open Google Calendar
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadICSFile(scheduleResult)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded-lg text-center font-bold text-[10px] shadow-xs"
                  >
                    📥 Download .ics Calendar File
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowScheduleModal(false)
                  setSchedulingCandidate(null)
                }}
                className="px-4 py-2 border border-slate-200 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={schedulingLoading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {schedulingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Scheduling...
                  </>
                ) : (
                  <>📅 Schedule & Send Invites</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INTERVIEWER FEEDBACK MODAL (WHITE THEME) */}
      {showFeedbackModal && feedbackCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleFeedbackSubmit} className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 font-sans text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-600">
                <CheckCircle className="w-5 h-5" />
                <h2 className="font-extrabold text-slate-900 text-base">Interviewer Feedback Form</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowFeedbackModal(false)
                  setFeedbackCandidate(null)
                }}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Candidate Name</span>
                <span className="text-slate-900 font-extrabold text-sm">{feedbackCandidate.name} ({feedbackCandidate.designation})</span>
              </div>

              {/* 1-5 STAR RATING */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1.5">Candidate Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`flex-1 py-2 rounded-xl text-base transition-all font-bold ${
                        feedbackRating >= star
                          ? 'bg-amber-400 text-slate-950 shadow-sm scale-105 border border-amber-500'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* RECOMMENDATION PILLS */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1.5">Final Hiring Recommendation</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Hire', 'Strong Hire', 'Hold', 'Reject'] as const).map((rec) => (
                    <button
                      key={rec}
                      type="button"
                      onClick={() => setFeedbackRecommendation(rec)}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                        feedbackRecommendation === rec
                          ? rec === 'Hire' || rec === 'Strong Hire'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : rec === 'Hold'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">Interviewer Remarks & Assessment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Excellent problem solving in React & Python. Strong system design concept. High communication skills."
                  value={feedbackRemarks}
                  onChange={(e) => setFeedbackRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed"
                />
              </div>
            </div>

            {feedbackSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg text-center animate-pulse">
                {feedbackSuccess}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowFeedbackModal(false)
                  setFeedbackCandidate(null)
                }}
                className="px-4 py-2 border border-slate-200 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {submittingFeedback ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>⭐ Submit Feedback & Update Sheet</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EMAIL APPROVAL MODAL (WHITE THEME) */}
      {showApprovalModal && emailDraft && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 font-sans animate-zoom-in text-slate-800">
            <div className="flex items-center gap-2 text-blue-600 pb-2 border-b border-slate-100">
              <Mail className="w-5 h-5" />
              <h2 className="font-extrabold text-slate-900">Review & Approve Outbound Email</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">To</label>
                <input
                  type="text"
                  value={emailDraft.to}
                  onChange={(e) => setEmailDraft({ ...emailDraft, to: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailDraft.subject}
                  onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">Body Preview (Rich Edit)</label>
                <textarea
                  rows={8}
                  value={emailDraft.body}
                  onChange={(e) => setEmailDraft({ ...emailDraft, body: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 leading-relaxed font-sans focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {emailSuccess && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg text-center font-semibold animate-pulse">
                {emailSuccess}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowApprovalModal(false)
                  setEmailDraft(null)
                }}
                disabled={sendingEmail}
                className="px-4 py-2 border border-slate-200 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                Decline Draft
              </button>
              <button
                onClick={handleApproveEmail}
                disabled={sendingEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/15 disabled:opacity-50"
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Queuing...
                  </>
                ) : (
                  <>Send Approved Email</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT CANDIDATE EMAIL PROMPT MODAL (WHITE THEME) */}
      {emailCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleGenerateCandidateEmail} className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 font-sans text-slate-800">
            <div className="flex items-center gap-2 text-blue-600 pb-2 border-b border-slate-100">
              <Mail className="w-5 h-5" />
              <h2 className="font-extrabold text-slate-900">Write Email with AI</h2>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">Candidate:</span> <span className="text-slate-900 font-bold ml-1">{emailCandidate.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Email:</span> <span className="text-slate-900 font-bold ml-1">{emailCandidate.email}</span>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">Tell AI what to write in this email</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Invite them to the second round next Tuesday at 3 PM, emphasize our hybrid work model."
                  value={candidateEmailPrompt}
                  onChange={(e) => setCandidateEmailPrompt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEmailCandidate(null)}
                className="px-4 py-2 border border-slate-200 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generatingCandidateEmail || !candidateEmailPrompt.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/15 disabled:opacity-50"
              >
                {generatingCandidateEmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Drafting...
                  </>
                ) : (
                  <>Generate Email Draft</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MOBILE BOTTOM TAB BAR */}
      {isMobile && (
        <div className={`fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-around border-t px-2 py-2 md:hidden ${
          isDark ? 'bg-[#070a1a] border-blue-900/50' : 'bg-white border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]'
        }`}>
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layout className="w-5 h-5" />
            <span className="text-[9px] font-bold">Menu</span>
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'home' ? 'text-blue-600' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layout className="w-5 h-5" />
            <span className="text-[9px] font-bold">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'chat' ? 'text-blue-600' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[9px] font-bold">AI</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'table' ? 'text-blue-600' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[9px] font-bold">Table</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'analytics' ? 'text-blue-600' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[9px] font-bold">Analytics</span>
          </button>
        </div>
      )}

    </div>
  )
}

