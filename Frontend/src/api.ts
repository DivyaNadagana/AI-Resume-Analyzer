export const API_URL = "http://localhost:8081";

export async function analyzeResume(formData: FormData) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/resumes/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Server not reachable. Make sure the backend is running on port 8081.");
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // response was not JSON
  }

  if (!res.ok) {
    throw new Error(data?.error ?? `Server error (${res.status})`);
  }
  return data;
}