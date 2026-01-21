import { GoogleGenAI, Type, Modality } from "@google/genai";

/**
 * AI Services for Task Management using Google Gemini API.
 */

export const getSystemBriefingAudio = async (username: string, tasks: any[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // نركز التقرير على المهام النشطة فقط
    const activeTasks = tasks.filter(t => t.status !== 'COMPLETED');
    const pendingCount = activeTasks.length;
    
    let messageText = "";
    if (pendingCount === 0) {
      messageText = `مرحباً ${username}. مصفوفة المهام فارغة حالياً، يومك هادئ ومستقر.`;
    } else {
      const topTask = activeTasks[0]?.title || "مهمة غير محددة";
      messageText = `أهلاً ${username}. لديك ${pendingCount} مهام نشطة. الأولوية الآن هي: ${topTask}.`;
    }

    // تبسيط الطلب لتجنب خطأ 500 الداخلي في موديل TTS
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ 
        parts: [{ 
          text: `بصوت احترافي ومستقبلي وهادئ، قل للمستخدم: ${messageText}` 
        }] 
      }],
      config: {
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
    console.error("Gemini TTS Error Detail:", error);
    return null;
  }
};

export const getSmartAdvice = async (tasks: any[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const activePending = tasks.filter(t => t.status !== 'COMPLETED').map(t => t.title).slice(0, 3).join(', ');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على المهام النشطة: [${activePending || 'لا توجد مهام نشطة'}]. قدم نصيحة إدارية تقنية واحدة مقتضبة جداً (أقل من 6 كلمات) لتحفيز المستخدم.`,
    });
    
    return response.text?.trim() || "الإنتاجية تبدأ بخطوة صغيرة اليوم.";
  } catch (error: any) {
    console.error("Gemini Advice Error:", error);
    return "نظامك جاهز لتحقيق أهدافك.";
  }
};

export const getSmartSubtasks = async (taskTitle: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `فكك هذه المهمة إلى 3 خطوات عملية بسيطة: "${taskTitle}". أريد النتيجة بتنسيق JSON array فقط.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const rawText = response.text?.trim() || "[]";
      return JSON.parse(rawText) as string[];
    } catch (error: any) {
      console.error("Gemini Subtasks Error:", error);
      return [];
    }
};