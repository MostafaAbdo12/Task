
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  // الاعتماد على process.env الموفر من البيئة بشكل مباشر
  const apiKey = process.env.API_KEY || "";
  
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getSmartSubtasks = async (taskTitle: string, taskDescription: string) => {
  try {
    const ai = getAIClient();
    if (!ai) return [];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `المهمة: "${taskTitle}" (${taskDescription}). اقترح 3 مهام فرعية قصيرة. JSON array strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr) as string[];
  } catch (error) {
    return [];
  }
};

export const getSmartAdvice = async (tasks: any[]) => {
  try {
    const ai = getAIClient();
    if (!ai || tasks.length === 0) return "واصل العمل الجاد، الإنتاجية هي مفتاح النجاح.";

    const summary = tasks.map(t => t.title).slice(0, 5).join(', ');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `المهام: [${summary}]. قدم نصيحة تشجيعية قصيرة جداً بالعربية.`,
    });
    return response.text || "ابدأ بالمهمة الأكثر إلحاحاً وحقق أهدافك اليوم!";
  } catch (error) {
    return "واصل العمل الجاد، الإنتاجية هي مفتاح النجاح.";
  }
};
