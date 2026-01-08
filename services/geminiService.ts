
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  try {
    // محاولة الوصول للمفتاح بشكل آمن لتجنب أخطاء ReferenceError
    const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || "";
    
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn("AI Client initialization failed", error);
    return null;
  }
};

export const getSmartSubtasks = async (taskTitle: string, taskDescription: string) => {
  try {
    const ai = getAIClient();
    if (!ai) return [];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على المهمة: "${taskTitle}" (${taskDescription}). اقترح 3 مهام فرعية ذكية. أجب بصيغة JSON array strings فقط.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text || "[]";
    const jsonStr = text.trim();
    return JSON.parse(jsonStr) as string[];
  } catch (error) {
    console.error("Smart Breakdown Error:", error);
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
      contents: `المهام الحالية للمستخدم هي: [${summary}]. قدم نصيحة تشجيعية موجزة جداً ومبدعة باللغة العربية لتحسين يومه.`,
    });
    return response.text || "ابدأ بالمهمة الأكثر إلحاحاً وحقق أهدافك اليوم!";
  } catch (error) {
    return "واصل العمل الجاد، الإنتاجية هي مفتاح النجاح.";
  }
};
