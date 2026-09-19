import re
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("resume_parser")

class ResumeParser:
    """Extract candidate attributes from resume text and convert to structured dictionary."""
    
    @staticmethod
    def parse_text(text: str) -> Dict[str, Any]:
        if not text:
            return {}

        text_clean = text.replace("\r", " ")
        lines = [line.strip() for line in text_clean.split("\n") if line.strip()]

        # 1. Extract Email
        email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text_clean)
        email = email_match.group(0) if email_match else "candidate@example.com"

        # 2. Extract Phone Number
        phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,12}", text_clean)
        phone = phone_match.group(0).strip() if phone_match else "N/A"

        # 3. Extract Name (assume top line or line before email)
        name = "New Candidate"
        for line in lines[:5]:
            if "@" not in line and not re.search(r"\d{5,}", line) and len(line.split()) <= 4 and len(line) > 2:
                name = line.title()
                break

        # 4. Extract Total Experience
        exp_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:\+|\s*plus)?\s*(?:years?|yrs?)", text_clean, re.IGNORECASE)
        total_experience = f"{exp_match.group(1)} Years" if exp_match else "2 Years"

        # 5. Extract Technology / Designation
        designation = "Software Engineer"
        tech_keywords = {
            "React Native": ["react native", "react-native"],
            "React JS": ["react js", "reactjs", "react.js"],
            "Node.js": ["node js", "nodejs", "node.js", "express"],
            "Python Developer": ["python", "django", "fastapi", "flask"],
            "MERN Stack": ["mern", "mongodb", "express", "react", "node"],
            "DevOps Engineer": ["devops", "aws", "gcp", "docker", "kubernetes"],
            "Dot Net Developer": [".net", "c#", "dotnet", "asp.net"],
            "UI/UX Designer": ["ui/ux", "figma", "sketch", "user experience"],
            "Business Analyst": ["business analyst", "ba", "agile", "scrum"]
        }
        text_lower = text_clean.lower()
        for tech, keywords in tech_keywords.items():
            if any(k in text_lower for k in keywords):
                designation = tech
                break

        # 6. Extract Location
        locations = ["Ahmedabad", "Mumbai", "Pune", "Bangalore", "Delhi", "Hyderabad", "Chennai", "Remote", "Gurgaon", "Noida"]
        location = "Ahmedabad"
        for loc in locations:
            if loc.lower() in text_lower:
                location = loc
                break

        return {
            "name": name,
            "email": email,
            "contact_number": phone,
            "designation": designation,
            "total_experience": total_experience,
            "relevant_experience": total_experience,
            "location": location,
            "current_company": "Independent / IT Firm",
            "current_ctc": "4.5 LPA",
            "expected_ctc": "6.5 LPA",
            "notice_period": "30 Days",
            "status": "To Be Screened",
            "department": "Engineering",
            "tech_non_tech": "Tech",
            "joining_date": "2026-09-19"
        }

resume_parser = ResumeParser()
