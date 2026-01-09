
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSystemBriefingAudio = async (username: string, tasks: any[]) => {
  try {
    const pendingCount = tasks.filter(t => t.status !== 'COMPLETED').length;
    let message = "";
    
    if (pendingCount === 0) {
      message = `تحية طيبة يا ${username}. النظام في حالة استقرار تام. لا توجد عمليات معلقة حالياً.`;
    } else {
      const topTask = tasks.find(t => t.status !== 'COMPLETED')?.title;
      message = `مرحباً ${username}. تم رصد ${pendingCount} مهام نشطة في النظام. الأولوية القصوى تتجه حالياً نحو: ${topTask}. لنبدأ التنفيذ.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: message }] }],
      config: {
        systemInstruction: "أنت محلل الأداء (Performance Analyst). صوتك ذكي، عملي، واثق ومحترف جداً. تتحدث بلهجة عربية فصحى عصرية ومختصرة. تجنب الكلمات العاطفية المبالغ فيها وركز على 'التنفيذ'، 'الأولوية'، 'التحسين'، 'النتائج'.",
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    return part?.inlineData?.data || null;
  } catch (error: any) {
    return null;
  }
};

export const getSmartAdvice = async (tasks: any[]) => {
  try {
    const pending = tasks.filter(t => t.status !== 'COMPLETED').map(t => t.title).slice(0, 3).join(', ');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `قائمة المهام الحالية: [${pending}]. قدم نصيحة إدارية تقنية مقتضبة جداً (3-5 كلمات) باللغة العربية بأسلوب محترف.`,
    });
    return response.text?.trim() || "تحسين سير العمل هو الأولوية.";
  } catch (e) { return "النظام جاهز لاستقبال المهام."; }
};

export const getSmartSubtasks = async (taskTitle: string, taskDescription: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `قم بتفكيك المهمة التقنية التالية إلى 3 خطوات تنفيذية دقيقة: "${taskTitle}". الرد بصيغة JSON array strings حصراً.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text?.trim() || "[]") as string[];
    } catch (e) { return []; }
};
