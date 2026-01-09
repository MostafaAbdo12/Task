
import { GoogleGenAI, Type, Modality } from "@google/genai";

/**
 * دالة مساعدة لإنشاء نسخة جديدة من المحرك لضمان استخدام أحدث الإعدادات/المفاتيح
 */
const getAIInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getSystemBriefingAudio = async (username: string, tasks: any[]) => {
  try {
    const ai = getAIInstance();
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
    console.error("Gemini TTS Error:", error);
    return null;
  }
};

export const getSmartAdvice = async (tasks: any[]) => {
  try {
    const ai = getAIInstance();
    const pending = tasks.filter(t => t.status !== 'COMPLETED').map(t => t.title).slice(0, 3).join(', ');
    
    // استخدام نموذج gemini-3-flash-preview للمهام السريعة
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `قائمة المهام الحالية: [${pending || 'لا توجد مهام'}]. قدم نصيحة إدارية تقنية مقتضبة جداً (3-5 كلمات) باللغة العربية بأسلوب محترف ومستقبلي.`,
    });
    
    return response.text?.trim() || "تحسين سير العمل هو الأولوية.";
  } catch (error: any) {
    console.error("Gemini Advice Error:", error);
    return "النظام جاهز لاستقبال المهام.";
  }
};

export const getSmartSubtasks = async (taskTitle: string, taskDescription: string) => {
    try {
      const ai = getAIInstance();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `قم بتفكيك المهمة التقنية التالية إلى 3 خطوات تنفيذية دقيقة ومختصرة: "${taskTitle}". الرد بصيغة JSON array strings حصراً.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      let rawText = response.text?.trim() || "[]";
      // تنظيف النص في حال وجود Markdown
      if (rawText.includes("```json")) {
        rawText = rawText.split("```json")[1].split("```")[0].trim();
      } else if (rawText.includes("```")) {
        rawText = rawText.split("```")[1].split("```")[0].trim();
      }
      
      return JSON.parse(rawText) as string[];
    } catch (error: any) {
      console.error("Gemini Subtasks Error:", error);
      return [];
    }
};
