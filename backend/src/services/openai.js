const OpenAI = require("openai");

const defaultBlueprint = {
  name: "Workout Mix",
  explicit_allowed: false,
  sections: [
    {
      label: "Warm-up",
      minutes: 10,
      genres: ["pop"],
      bpm: [100, 115],
      energy: 0.6,
      target_tempo: 108
    }
  ],
  seed_artists: [],
  search_keywords: ["workout"],
  explanation: "Fallback blueprint used because model output was unavailable."
};

function extractTextFromResponse(response) {
  if (typeof response?.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  const parts = [];
  for (const item of response?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && content?.text) {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

function stripCodeFences(raw) {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractLikelyJson(raw) {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1);
  }
  return raw;
}

function tryParseBlueprint(rawText) {
  const attempts = [rawText, stripCodeFences(rawText), extractLikelyJson(stripCodeFences(rawText))];

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate);
      return parsed;
    } catch (_error) {
      // try next repair strategy
    }
  }

  throw new Error("Unable to parse model output as JSON.");
}

function normalizeBlueprint(data) {
  return {
    name: typeof data?.name === "string" ? data.name : defaultBlueprint.name,
    explicit_allowed: Boolean(data?.explicit_allowed),
    sections: Array.isArray(data?.sections) ? data.sections : defaultBlueprint.sections,
    seed_artists: Array.isArray(data?.seed_artists) ? data.seed_artists : [],
    search_keywords: Array.isArray(data?.search_keywords) ? data.search_keywords : [],
    explanation: typeof data?.explanation === "string" ? data.explanation : ""
  };
}

async function generateBlueprint(workout) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const workoutText =
    typeof workout === "string"
      ? workout.trim() || "General workout"
      : JSON.stringify(workout || { name: "General workout" });

  if (!apiKey) {
    return {
      ...defaultBlueprint,
      name: `${workoutText} Mix`,
      explanation: "OPENAI_API_KEY is missing, so a local fallback blueprint was returned."
    };
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model,
    instructions:
      "You are a music programming assistant for workout playlists. Use any provided user profile context (age, workout frequency, favorite genres) to personalize recommendations. Return ONLY valid JSON, no markdown.",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              `Create a playlist blueprint for this workout: "${workoutText}". ` +
              "Use this exact JSON shape: " +
              '{"name":string,"explicit_allowed":boolean,"sections":[{"label":string,"minutes":number,"genres":string[],"bpm":[number,number],"energy":number,"target_tempo":number}],"seed_artists":string[],"search_keywords":string[],"explanation":string}.'
          }
        ]
      }
    ]
  });

  const text = extractTextFromResponse(response);
  const parsed = tryParseBlueprint(text);
  return normalizeBlueprint(parsed);
}

async function generatePlaylistSeed(prompt) {
  const blueprint = await generateBlueprint(prompt);
  return blueprint.search_keywords[0] || prompt.trim() || "workout mix";
}

module.exports = {
  generateBlueprint,
  generatePlaylistSeed
};
