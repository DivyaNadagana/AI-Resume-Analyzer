import { useState } from "react";
import { analyzeResume } from "./api";

type Result = {
  atsScore: number;
  summary: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
};

const MAX_SIZE = 5 * 1024 * 1024;

function scoreHex(score: number) {
  if (score >= 75) return "#16a34a";
  if (score >= 50) return "#eab308";
  return "#dc2626";
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 128 128" className="w-32 h-32 -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={scoreHex(clamped)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{clamped}</span>
        <span className="text-xs text-gray-500">ATS Score</span>
      </div>
    </div>
  );
}

function ListCard({ title, items, color }: { title: string; items?: string[]; color: string }) {
  return (
    <div className={`${color} p-4 rounded-lg`}>
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="list-disc list-inside space-y-1 text-sm">
        {items?.map((item, i) => (
          <li key={`${title}-${i}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const selectFile = (selected: File | null | undefined) => {
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError("File size must be less than 5 MB.");
      setFile(null);
      return;
    }
    setError(null);
    setFile(selected);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    selectFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    if (jobDesc.trim()) formData.append("jobDescription", jobDesc.trim());

    try {
      const data = await analyzeResume(formData);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <header className="my-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">AI Resume Analyzer</h1>
        <p className="text-gray-500 mt-2">Upload your resume and get an ATS score with suggestions</p>
      </header>

      <div className="w-full max-w-3xl bg-white rounded-xl shadow p-6 space-y-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <p className="text-gray-600 mb-2">Click or drag and drop a PDF (max 5 MB)</p>
          {file && <p className="font-medium text-blue-700">Selected: {file.name}</p>}
          <input
            id="fileInput"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <textarea
          placeholder="Job description (optional)"
          className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />

        <button
          disabled={!file || loading}
          onClick={handleSubmit}
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${!file || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          Analyze Resume
        </button>

        {loading && (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span>Analyzing your resume...</span>
          </div>
        )}

        {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

        {result && (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <ScoreGauge score={result.atsScore} />
              <div>
                <h2 className="font-semibold mb-1">Summary</h2>
                <p className="text-gray-700">{result.summary}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Matched skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills?.map((skill, i) => (
                  <span key={`m-${i}`} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Missing skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills?.map((skill, i) => (
                  <span key={`x-${i}`} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ListCard title="Strengths" items={result.strengths} color="bg-blue-50" />
              <ListCard title="Weaknesses" items={result.weaknesses} color="bg-orange-50" />
              <ListCard title="Suggestions" items={result.suggestions} color="bg-purple-50" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;