package com.divya.Resume_Analyzer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final RestClient restClient = RestClient.create();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    public String analyze(String resumeText, String jobDescription) {
        String jd = (jobDescription == null || jobDescription.isBlank())
                ? "Not provided. Evaluate for a general entry-level Java software engineer role."
                : jobDescription;

        String prompt = "You are an expert ATS (Applicant Tracking System) and technical recruiter. "
                + "Analyze the resume against the job description. Be strict, specific and honest. "
                + "Do not invent anything that is not in the resume. "
                + "Return ONLY valid JSON with exactly this shape: "
                + "{\"atsScore\": number 0-100, \"summary\": string, \"matchedSkills\": [string], "
                + "\"missingSkills\": [string], \"strengths\": [string], \"weaknesses\": [string], "
                + "\"suggestions\": [string]}.\n\n"
                + "JOB DESCRIPTION:\n" + jd + "\n\nRESUME:\n" + resumeText;

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("responseMimeType", "application/json")
        );

        Map<?, ?> response = restClient.post()
                .uri("https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", model)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        List<?> candidates = (List<?>) response.get("candidates");
        Map<?, ?> content = (Map<?, ?>) ((Map<?, ?>) candidates.get(0)).get("content");
        List<?> parts = (List<?>) content.get("parts");
        return (String) ((Map<?, ?>) parts.get(0)).get("text");
    }
}
