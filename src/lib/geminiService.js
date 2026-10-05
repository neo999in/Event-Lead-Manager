const axios = require('axios');

/**
 * Gemini AI Service for Event Lead Summarization and Follow-up Drafting
 * Uses the Google Generative Language REST API via Axios as required:
 * `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`
 */

// Tried top-to-bottom; advances to the next on HTTP 503 (model overloaded) or 404 (deprecated).
const GEMINI_MODELS = [
  'gemini-3.8-flash',       // Primary — confirmed available
  'gemini-3.6-flash',       // Fallback 2
  'gemini-3.5-flash',       // Fallback 3
  'gemini-3.5-flash-lite',  // Fallback 4 — confirmed lite
];

/**
 * Call the official Gemini REST API with a single model
 */
async function callGemini(prompt, model) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'your_gemini_api_key_here') {
    throw new Error('NO_API_KEY');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000
    }
  };

  const response = await axios.post(endpoint, payload, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 20000
  });

  const candidates = response.data?.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('Gemini API returned no candidates');
  }

  const text = candidates[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned empty text part');
  }

  return text.trim();
}

/**
 * Try each model in GEMINI_MODELS in order.
 * Advances to the next model on HTTP 503 (model overloaded / unavailable).
 * Throws the last error if all models are exhausted.
 */
async function callGeminiWithFallback(prompt) {
  let lastError;
  for (const model of GEMINI_MODELS) {
    try {
      const result = await callGemini(prompt, model);
      if (GEMINI_MODELS.indexOf(model) > 0) {
        console.info(`Gemini fallback: responded on model "${model}"`);
      }
      return result;
    } catch (err) {
      const status = err.response?.status;
      if (status === 503 || status === 404) {
        const reason = status === 503 ? 'overloaded' : 'unavailable/deprecated';
        console.warn(`Gemini model "${model}" returned ${status} (${reason}), trying next model…`);
        lastError = err;
        continue;
      }
      // Any other error (auth, quota, network) – bubble up immediately
      throw err;
    }
  }
  throw lastError;
}

/**
 * High-quality heuristic fallback generator when API key is missing or quota exceeded
 */
function generateFallbackSummary(notes, lead) {
  if (!notes || notes.trim() === '') {
    return 'Lead met at event. No interaction notes entered yet.';
  }

  const lines = notes.split(/(?<=[.?!])\s+/);
  const coreDiscussion = lines[0] || 'Discussed initial business requirements and capabilities.';
  const nextStepLine = lines.find(l => /demo|tuesday|call|email|meeting|schedule|pricing|send/i.test(l));
  const nextStep = nextStepLine ? nextStepLine.trim() : 'Follow up with further technical information and schedule an introductory call.';

  return `• Met ${lead.name || 'Lead'} from ${lead.company || 'their organization'} at ${lead.event || 'the event'}.\n• Core discussion: ${coreDiscussion}\n• Next steps: ${nextStep}`;
}

function getGreetingName(fullName) {
  if (!fullName) return 'there';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2 && /^(dr\.?|mr\.?|ms\.?|mrs\.?|prof\.?)$/i.test(parts[0])) {
    return `${parts[0]} ${parts[1]}`;
  }
  return parts[0];
}

function generateFallbackEmail(notes, lead, tone = 'professional') {
  const name = getGreetingName(lead.name);
  const company = lead.company || 'your team';
  const event = lead.event || 'the event';

  let subject = `Great connecting at ${event}`;
  let opening = `It was a pleasure meeting you at ${event}. I enjoyed learning more about what you're doing at ${company}.`;
  let body = `Following up on our conversation regarding:\n"${notes || 'our shared industry focus'}"\n\nI’d love to continue the dialogue and explore how we can support your upcoming initiatives.`;
  let signoff = `Best regards,\nThe Event Team`;

  if (tone === 'casual') {
    subject = `Quick follow up post-${event}!`;
    opening = `Hey ${name}! It was really great bumping into you at ${event}.`;
    body = `Loved chatting about what you're building at ${company}. Here’s a quick follow-up based on our notes:\n${notes ? `> ${notes}\n` : ''}\nWould love to grab a virtual coffee sometime next week if you're open to it!`;
    signoff = `Cheers,\nThe Team`;
  } else if (tone === 'executive') {
    subject = `Action Items: ${event} discussion / ${company}`;
    opening = `Hi ${name}, thank you for your time at ${event}.`;
    body = `Key takeaway from our discussion:\n• Opportunity to streamline your workflow at ${company}.\n• Agreed to review integration scope.\n\nLet’s arrange a brief 15-minute briefing to align on next steps.`;
    signoff = `Sincerely,\nSenior Solutions Team`;
  } else if (tone === 'meeting_request') {
    subject = `15-min follow-up: ${event} <> ${company}`;
    opening = `Hi ${name}, hope you had a productive close to ${event}!`;
    body = `Per our conversation about your team's current priorities, I'd like to schedule our 15-minute introductory walkthrough.\n\nWould any of these slots work for your calendar?\n• Tuesday at 2:30 PM IST\n• Wednesday at 11:30 AM IST\n• Thursday at 4:00 PM IST`;
    signoff = `Looking forward to connecting,\nAccount Team`;
  }

  return `Subject: ${subject}\n\n${opening}\n\n${body}\n\n${signoff}`;
}

const geminiService = {
  /**
   * Summarize lead interaction notes using Gemini
   */
  async summarizeNotes({ notes, name, company, event }) {
    const lead = { name, company, event };

    if (!notes || notes.trim() === '') {
      return {
        summary: 'No interaction notes available to summarize. Please enter conversation notes first.',
        provider: 'local_validation'
      };
    }

    const prompt = `
You are an expert sales strategist and CRM assistant.
Analyze and summarize the following event interaction notes for a lead met at a business event:

Lead Name: ${name || 'Unknown'}
Company: ${company || 'Unknown'}
Event: ${event || 'Business Event'}
Interaction Notes:
"""
${notes}
"""

Please provide:
1. A concise 2-3 bullet point summary highlighting key discussion points, pain points, and lead intent.
2. Immediate next action items.
Keep it crisp, professional, and directly actionable for a sales/partnerships team.
`.trim();

    try {
      const summaryText = await callGeminiWithFallback(prompt);
      return {
        summary: summaryText,
        provider: 'gemini'
      };
    } catch (err) {
      const errDetail = err.response?.data?.error?.message || err.message;
      console.warn('Gemini API call failed or unconfigured, utilizing smart local synthesis:', errDetail);
      const fallback = generateFallbackSummary(notes, lead);
      return {
        summary: fallback,
        provider: 'fallback',
        notice: err.message === 'NO_API_KEY'
          ? 'Notice: Set GEMINI_API_KEY in .env to use live Gemini 1.5/2.0 AI. Using smart local synthesis.'
          : `Notice: Gemini API returned (${errDetail}). Using smart local synthesis.`
      };
    }
  },

  /**
   * Draft a personalized follow-up email using Gemini
   */
  async draftFollowUpEmail({ notes, name, company, email, event, tone = 'professional', customInstruction = '' }) {
    const lead = { name, company, email, event };

    const toneDescriptions = {
      professional: 'Polite, clear, and business-focused',
      casual: 'Warm, personable, and conversational',
      executive: 'Concise, high-level, and value-driven for C-suite/leadership',
      meeting_request: 'Action-oriented with a clear 15-minute calendar invite call-to-action',
      value_pitch: 'Consultative, addressing pain points mentioned in notes with targeted solutions'
    };

    const selectedToneDesc = toneDescriptions[tone] || toneDescriptions.professional;

    const prompt = `
You are a senior business development lead crafting a personalized post-event follow-up email.

Lead Details:
- Name: ${name || 'Valued Contact'}
- Company: ${company || 'Company'}
- Event Where Met: ${event || 'Recent Event'}
- Lead's Email: ${email || ''}
- Tone Required: ${tone.toUpperCase()} (${selectedToneDesc})
${customInstruction ? `- Additional Instructions: ${customInstruction}` : ''}

Conversation Notes from the Event:
"""
${notes || 'Met at our booth and discussed future collaboration possibilities.'}
"""

Draft a high-converting, personalized follow-up email:
- Include a compelling "Subject:" line at the very top.
- Reference the event warmly and authentically.
- Specifically weave in details from the conversation notes so it feels bespoke and authentic, not like a template.
- End with a low-friction call to action and professional signature.
Do NOT output robotic placeholders like "[Your Name]". Use "The Event Team" or contextual signatures.
`.trim();

    try {
      const emailDraft = await callGeminiWithFallback(prompt);
      return {
        draft: emailDraft,
        provider: 'gemini'
      };
    } catch (err) {
      const errDetail = err.response?.data?.error?.message || err.message;
      console.warn('Gemini API call failed or unconfigured, utilizing smart email synthesis:', errDetail);
      const fallback = generateFallbackEmail(notes, lead, tone);
      return {
        draft: fallback,
        provider: 'fallback',
        notice: err.message === 'NO_API_KEY'
          ? 'Notice: Set GEMINI_API_KEY in .env to use live Gemini 1.5/2.0 AI. Using smart local synthesis.'
          : `Notice: Gemini API returned (${errDetail}). Using smart local synthesis.`
      };
    }
  }
};

module.exports = geminiService;
