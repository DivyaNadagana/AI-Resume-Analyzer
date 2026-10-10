# AI Resume Analyzer

A full-stack web app that analyzes a resume (PDF) against a job description and returns an ATS score, matched and missing skills, strengths, weaknesses and improvement suggestions, powered by the Gemini API.

![Result](screenshots/result1.png)
![Result](screenshots/result2.png)

## Features

- Upload a resume as PDF (max 5 MB) with optional job description
- Text extraction from PDF using Apache PDFBox
- AI analysis with Gemini returning structured JSON
- ATS score gauge, skill chips, and strengths / weaknesses / suggestions cards
- File validation and clear error handling

## Tech Stack
| Layer | Technology |
|-------|------------|
| Backend | Java 21, Spring Boot 4, Maven, Apache PDFBox |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| AI | Google Gemini API |

## How it works
1. User uploads a PDF and (optionally) pastes a job description.
2. React sends a multipart request to `POST /api/resumes/analyze`.
3. Spring Boot extracts the resume text with PDFBox.
4. The text and job description go to Gemini with a strict JSON prompt.
5. The JSON result is returned and displayed in the UI.

## API
`POST /api/resumes/analyze` (multipart/form-data)
- `file`: PDF resume (required)
- `jobDescription`: text (optional)

Response:
```json
{
  "atsScore": 68,
  "summary": "...",
  "matchedSkills": ["..."],
  "missingSkills": ["..."],
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."]
}
```

## Run locally

### Prerequisites
- JDK 21
- Node.js (LTS)
- A Gemini API key from Google AI Studio

### Backend
```bash
cd Resume-Analyzer
# Windows PowerShell: set the key once, then reopen the terminal
setx GEMINI_API_KEY "your_api_key"
./mvnw spring-boot:run
```
The backend runs on `http://localhost:8081`. The API key is read from the `GEMINI_API_KEY` environment variable and is never stored in the code.

### Frontend
```bash
cd Frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

## Future improvements
- DOCX resume support
- Save analysis history in a database
- User login
- Deployment

## Author
Divya Nadagana