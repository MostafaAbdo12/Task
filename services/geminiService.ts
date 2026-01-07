
import { GoogleGenAI, Type } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartSubtasks = async (taskTitle: string, taskDescription: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على المهمة التالية: "${taskTitle}" (${taskDescription})، اقترح قائمة مكونة من 3 إلى 5 مهام فرعية منطقية لإنجازها بالكامل. أجب بصيغة JSON فقط كقائمة من النصوص.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    // The GenerateContentResponse object features a text property (not a method).
    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr) as string[];
  } catch (error) {
    console.error("Error fetching smart subtasks:", error);
    return [];
  }
};

export const getSmartAdvice = async (tasks: any[]) => {
  try {
    const summary = tasks.map(t => `${t.title} (${t.status})`).join(', ');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `أنا مدير مهام ذكي. لدي المهام التالية للمستخدم: [${summary}]. قدم نصيحة واحدة موجزة جداً ومشجعة باللغة العربية لمساعدة المستخدم على زيادة إنتاجيته اليوم.`,
    });
    // The GenerateContentResponse object features a text property.
    return response.text || "ابدأ بالمهمة الأكثر إلحاحاً وحقق أهدافك اليوم!";
  } catch (error) {
    return "واصل العمل الجاد، الإنتاجية هي مفتاح النجاح.";
  }
};
