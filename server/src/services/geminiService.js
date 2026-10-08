const getGeminiClient = require('../config/gemini');

/**
 * Parses raw natural language text into a structured task object using Gemini API.
 * 
 * @param {string} rawText - User input text (e.g. "submit report by Friday 5pm, high priority")
 * @param {string} timeZone - User timezone (e.g. "Asia/Kolkata", "America/New_York")
 * @param {string} clientNowIso - Client local time ISO string (optional)
 * @returns {Promise<Object>} Structured task payload { title, description, dueDate, priority, labels, isFallback }
 */
const parseTaskText = async (rawText, timeZone = 'UTC', clientNowIso = null) => {
  const fallbackObj = {
    title: rawText ? rawText.trim() : 'New Task',
    description: '',
    dueDate: null,
    priority: 'medium',
    labels: [],
    isFallback: true,
  };

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return fallbackObj;
  }

  const genAI = getGeminiClient();
  if (!genAI) {
    console.warn('[Gemini Service] Client uninitialized (missing API key). Using smart local fallback.');
    return smartFallbackParse(rawText);
  }

  const referenceDate = clientNowIso ? new Date(clientNowIso) : new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone };
  const formattedRefTime = new Intl.DateTimeFormat('en-US', options).format(referenceDate);

  const systemPrompt = `
You are a precise task parsing AI. Convert the user's natural language input into a structured JSON object for a task management application.

Context Information:
- Current Local Time: ${formattedRefTime} (${referenceDate.toISOString()})
- User Timezone: ${timeZone}

User Input: "${rawText.trim()}"

Rules for Parsing:
1. "title": Extract a concise, clear task title in Title Case.
2. "description": Extract any extra details or leave as empty string "".
3. "dueDate": Extract and convert relative date phrases ("tomorrow", "next Friday", "in 3 days", "tonight at 8pm") into an exact ISO 8601 string (e.g., "2026-10-09T17:00:00.000Z"). If no year or time is specified, assume current year and default to 09:00:00 local time. If no date is mentioned, set to null.
4. "priority": Classify as "low", "medium", or "high". Default to "medium" if unspecified.
5. "labels": Extract category tags (e.g. ["college", "work", "shopping"]) as an array of lowercase strings.

Output Requirement:
Return ONLY a valid JSON object matching this exact structure with no extra text, explanations, or markdown fences:
{
  "title": "string",
  "description": "string",
  "dueDate": "ISO 8601 string or null",
  "priority": "low | medium | high",
  "labels": ["string"]
}
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // 8s timeout promise for API response
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API response timeout (8s limit)')), 8000)
    );

    const result = await Promise.race([
      model.generateContent(systemPrompt),
      timeoutPromise,
    ]);

    const responseText = result.response.text();

    if (!responseText) {
      return fallbackObj;
    }

    // Clean potential markdown fences (```json ... ```)
    let cleanedJsonText = responseText.trim();
    if (cleanedJsonText.startsWith('```')) {
      cleanedJsonText = cleanedJsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    const parsed = JSON.parse(cleanedJsonText);

    // Validate and sanitize parsed attributes
    const validPriority = ['low', 'medium', 'high'].includes((parsed.priority || '').toLowerCase())
      ? parsed.priority.toLowerCase()
      : 'medium';

    let validDueDate = null;
    if (parsed.dueDate && parsed.dueDate !== 'null') {
      const parsedDate = new Date(parsed.dueDate);
      if (!isNaN(parsedDate.getTime())) {
        validDueDate = parsedDate.toISOString();
      }
    }

    const validLabels = Array.isArray(parsed.labels)
      ? [...new Set(parsed.labels.map(l => String(l).toLowerCase().trim()).filter(Boolean))]
      : [];

    return {
      title: parsed.title || rawText.trim(),
      description: parsed.description || '',
      dueDate: validDueDate,
      priority: validPriority,
      labels: validLabels,
      isFallback: false,
    };
  } catch (error) {
    console.error('[Gemini Parsing Error]:', error.message);
    return smartFallbackParse(rawText);
  }
};

/**
 * Relative date parser for offline fallback
 */
const parseRelativeDate = (text) => {
  const now = new Date();
  const lower = text.toLowerCase();
  
  let hour = 9;
  let minute = 0;
  const timeMatch = lower.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (timeMatch) {
    let h = parseInt(timeMatch[1], 10);
    const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3].toLowerCase();
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    hour = h;
    minute = m;
  }

  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < weekdays.length; i++) {
    if (lower.includes(weekdays[i])) {
      const targetDay = i;
      const currentDay = now.getDay();
      let daysAhead = targetDay - currentDay;
      if (daysAhead <= 0) daysAhead += 7;
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + daysAhead);
      targetDate.setHours(hour, minute, 0, 0);
      return targetDate.toISOString();
    }
  }

  if (lower.includes('tomorrow')) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  if (lower.includes('today') || lower.includes('tonight')) {
    const d = new Date(now);
    if (lower.includes('tonight') && !timeMatch) hour = 20;
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  return null;
};

/**
 * Smart local offline parser fallback using regex heuristics.
 */
const smartFallbackParse = (rawText) => {
  const text = rawText ? rawText.trim() : '';

  // Extract hashtags (#work, #college, etc.)
  const hashtagRegex = /#([a-zA-Z0-9_\-]+)/g;
  const labels = [];
  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    labels.push(match[1].toLowerCase());
  }

  // Detect priority
  let priority = 'medium';
  if (/high\s*priority|urgent|p1/i.test(text)) {
    priority = 'high';
  } else if (/low\s*priority|p3/i.test(text)) {
    priority = 'low';
  }

  // Extract relative due date
  const dueDate = parseRelativeDate(text);

  // Clean title by removing priority keywords, date phrases, and hashtags
  let cleanTitle = text
    .replace(/#([a-zA-Z0-9_\-]+)/g, '')
    .replace(/,\s*(high|low|medium)\s*priority/gi, '')
    .replace(/(high|low|medium)\s*priority\s*,?/gi, '')
    .replace(/(?:next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|tonight)(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?/gi, '')
    .replace(/(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, '')
    .trim();

  // Strip trailing commas
  cleanTitle = cleanTitle.replace(/,\s*$/, '').trim() || text;

  return {
    title: cleanTitle,
    description: '',
    dueDate,
    priority,
    labels: [...new Set(labels)],
    isFallback: true,
  };
};

module.exports = {
  parseTaskText,
};
