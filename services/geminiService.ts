
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini AI engine using the provided process environment key
const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates high-level strategic advice based on the current task list.
 */
export const getSmartAdvice = async (tasks: any[]) => {
  try {
    const ai = getAIInstance();
    const pending = tasks.filter(t => t.status !== 'COMPLETED').map(t => t.title).join(', ');
    
    if (tasks.length === 0) return "مصفوفة العمل خاملة حالياً. بادر بإدراج أهدافك لتفعيل نظام التوجيه الذكي.";

    const prompt = `أنت نظام ذكاء اصطناعي فائق الذكاء متخصص في الإنتاجية. حلل قائمة المهام هذه: [${pending}]. 
قدم استراتيجية تنفيذية واحدة مقتضبة جداً (أقل من 10 كلمات) تركز على الأولوية القصوى باللغة العربية.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    // Using response.text property directly as per instructions
    return response.text?.trim() || "ركز على إتمام المهمة الأكثر تأثيراً في جدولك الآن.";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "نظام التوجيه الذكي جاهز لمساعدتك في ترتيب أولوياتك.";
  }
};

/**
 * Intelligent field auto-fill based on task title.
 */
export const getMagicFillData = async (title: string) => {
  try {
    const ai = getAIInstance();
    const prompt = `استناداً إلى عنوان المهمة: "${title}"، اقترح بيانات كاملة للهوية الرقمية للمهمة. 
الرد يجب أن يكون بتنسيق JSON حصراً:
- description: وصف دقيق وملهم (عربي)
- priority: [LOW, MEDIUM, HIGH, URGENT]
- category: [عمل, شخصي, دراسة, صحة, تسوق, أخرى]
- subTasks: قائمة بـ 3 مراحل تنفيذية دقيقة (عربي)`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            priority: { type: Type.STRING },
            category: { type: Type.STRING },
            subTasks: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Magic Fill Error:", error);
    return null;
  }
};

/**
 * Breaks down a large task into smaller manageable stages.
 */
export const getSmartSubtasks = async (taskTitle: string) => {
    try {
      const ai = getAIInstance();
      const prompt = `فكك المهمة التالية إلى 3 خطوات تنفيذية برمجية/عملية: "${taskTitle}". الرد بتنسيق JSON array من النصوص فقط.`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Gemini Subtasks Error:", error);
      return [];
    }
};
