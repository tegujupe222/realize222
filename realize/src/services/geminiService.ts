import { GoogleGenAI, Type } from "@google/genai";
import { Announcement, Member, ScheduleEvent, Task, TimetableEntry } from "../types";

// Ensure the API_KEY is available as an environment variable
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn("VITE_API_KEY for Gemini is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = "gemini-2.5-flash";

export const fetchInspirationalQuote = async (): Promise<string> => {
  if (!API_KEY) {
    return "The best way to predict the future is to create it. — Peter Drucker";
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: 'Generate a short, one-sentence inspirational quote suitable for teachers in a staff room. Keep it concise and uplifting.',
      config: {
        temperature: 0.9,
      }
    });
    
    if (!response.text) return "The best way to predict the future is to create it. — Peter Drucker";
    return response.text.trim();
  } catch (error) {
    console.error("Error fetching inspirational quote:", error);
    return "In learning you will teach, and in teaching you will learn. — Phil Collins";
  }
};

export const parseTimetableFromPdfText = async (pdfText: string): Promise<any[]> => {
    if (!API_KEY) {
        throw new Error("API Key not configured. Cannot parse timetable.");
    }

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                period: { type: Type.STRING, description: 'The class period number (e.g., "1", "2").' },
                time: { type: Type.STRING, description: 'The time for the class (e.g., "09:00 - 09:50").' },
                subject: { type: Type.STRING, description: 'The subject being taught (e.g., "Science", "P.E.").' },
                class: { type: Type.STRING, description: 'The class or group being taught (e.g., "Class 2-A").' },
            },
            required: ['period', 'time', 'subject', 'class']
        }
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Parse the following timetable text extracted from a PDF and convert it into a structured JSON format. Identify each class period, its time, the subject, and the target class. The text is:\n\n---\n${pdfText}\n---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        if (!response.text) return [];
        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);
        
        if (!Array.isArray(parsedData)) {
            throw new Error("Parsed data is not an array.");
        }
        
        return parsedData;

    } catch (error) {
        console.error("Error parsing timetable with Gemini:", error);
        throw new Error("AI was unable to parse the timetable from the PDF. Please check the document format.");
    }
};

interface BriefingData {
    tasks: Task[];
    events: ScheduleEvent[];
    announcements: Announcement[];
}

export const generateDailyBriefing = async (data: BriefingData): Promise<string> => {
    if (!API_KEY) {
        return "AI Briefing is unavailable. Please configure the API Key.";
    }

    const today = new Date().toLocaleDateString('ja-JP', { weekday: 'long' });

    const prompt = `
    You are an AI assistant for a school staff room dashboard. Generate a concise and helpful "Daily Briefing" for the teachers.
    Today is ${today}.
    
    Here is the data for today:
    - Upcoming Events: ${JSON.stringify(data.events.map(e => ({ title: e.title, time: e.isAllDay ? 'All Day' : e.start.toLocaleTimeString('ja-JP') })))}
    - Announcements: ${JSON.stringify(data.announcements.map(a => ({ title: a.title, type: a.type })))}
    - Pending Tasks: ${data.tasks.filter(t => !t.completed).length} items.

    Based on this data, create a summary in Japanese. Structure it with these sections:
    1.  A friendly greeting.
    2.  "今日の予定" (Today's Schedule): List today's key events.
    3.  "お知らせ" (Announcements): Mention any 'Important' announcements first, then others.
    4.  "リマインダー" (Reminders): Briefly mention the number of pending tasks.
    5.  A motivational closing sentence.
    
    Keep it clear, friendly, and professional. Use markdown for simple formatting like bolding (**text**).
    `;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        if (!response.text) return "";
        return response.text.trim();
    } catch (error) {
        console.error("Error generating daily briefing:", error);
        return "ブリーフィングの生成中にエラーが発生しました。";
    }
};

interface ChatContext {
    query: string;
    members: Member[];
    tasks: Task[];
    timetables: TimetableEntry[];
    events: ScheduleEvent[];
    announcements: Announcement[];
}

export const getAiChatResponse = async (context: ChatContext): Promise<string> => {
    if (!API_KEY) {
        return "AIアシスタントは現在利用できません。APIキーを設定してください。";
    }

    const systemInstruction = `
あなたは学校の職員室で使われるダッシュボードの、賢くて親切なAIアシスタントです。
提供されたJSONデータを基に、ユーザーからの質問に日本語で的確に答えてください。
データにない情報は「分かりません」と正直に答えてください。
回答は簡潔で、フレンドリーな口調を心がけてください。
- 今日の日付: ${new Date().toLocaleDateString('ja-JP')}
`;

    const prompt = `
ユーザーからの質問: "${context.query}"

以下が現在のダッシュボードのデータです。この情報を参考にして回答を生成してください。

- **職員メンバー:** ${JSON.stringify(context.members)}
- **タスクリスト:** ${JSON.stringify(context.tasks)}
- **時間割:** ${JSON.stringify(context.timetables)}
- **週間予定:** ${JSON.stringify(context.events)}
- **お知らせ:** ${JSON.stringify(context.announcements)}
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
            }
        });
        if (!response.text) return "";
        return response.text.trim();
    } catch (error) {
        console.error("Error getting AI chat response:", error);
        return "申し訳ありません、エラーが発生しました。もう一度お試しください。";
    }
};
