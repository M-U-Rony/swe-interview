/**
 * One-time (and re-runnable) setup of the ElevenLabs interviewer agent (D7).
 *
 *   npm run setup:agent
 *
 * Reads ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID from .env.local and puts the
 * agent into the state the app expects. Running it again gives the same result.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const apiKey = process.env.ELEVENLABS_API_KEY;
const agentId = process.env.ELEVENLABS_AGENT_ID;
if (!apiKey || !agentId) {
  console.error("ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID must be set (see .env.example).");
  process.exit(1);
}

const prompt = readFileSync(join(import.meta.dirname, "..", "prompts", "interviewer.md"), "utf8");

const body = {
  conversation_config: {
    agent: {
      // D4: prompt and first message live on the agent, never sent from the browser.
      first_message: "Hi, I'm Marcus. Thanks for joining. Let's start your interview for the {{target_role}} role — could you briefly introduce yourself?",
      language: "en", // D5: English only
      max_conversation_duration_message: "We're out of time. Thank you, that's the end of the interview.",
      prompt: {
        prompt,
        built_in_tools: {
          // D5: lets Marcus end the call (closing remarks, or conduct).
          end_call: {
            type: "system",
            name: "end_call",
            description: "End the call when the interview is finished or the candidate keeps using inappropriate language after one warning.",
            params: { system_tool_type: "end_call" },
          },
        },
      },
    },
    // D3: re-engage after ~10 s of silence, hang up after ~60 s.
    turn: {
      turn_timeout: 10,
      silence_end_call_timeout: 60,
    },
    // D3: 15-minute cap.
    conversation: {
      max_duration_seconds: 15 * 60,
    },
  },
  platform_settings: {
    // D4: the browser may not override the prompt, first message or language.
    overrides: {
      conversation_config_override: {
        agent: {
          prompt: { prompt: false },
          first_message: false,
          language: false,
        },
      },
    },
    // D5: evaluation is done by our own scoring, not by ElevenLabs.
    data_collection: {},
    evaluation: { criteria: [] },
  },
};

const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${encodeURIComponent(agentId)}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error(`Agent setup failed: ${res.status} ${res.statusText}`);
  console.error(await res.text());
  process.exit(1);
}

console.log(`Agent ${agentId} is set up.`);
