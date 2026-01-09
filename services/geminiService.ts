
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSystemBriefingAudio = async (username: string, tasks: any[]) => {
  try {
    const summary = tasks.length > 0 
      ? tasks.map(t => t.title).slice(0, 3).join('، ')
      : "لا توجد مهام عاجلة حالياً";
    
    const prompt = `أهلاً ${username}. إليك إحاطة موجزة: ${summary}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "أنت مساعد شخصي احترافي، هادئ، وعملي جداً. تحدث باللغة العربية الفصحى البسيطة. كن مقتضباً جداً (أقل من 15 كلمة). لا تستخدم ألقاباً مبالغ فيها، فقط 'أهلاً بك'.",
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
    const summary = tasks.map(t => t.title).slice(0, 3).join(', ');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على: [${summary}]. قدم نصيحة إنتاجية واحدة قصيرة جداً باللغة العربية (5 كلمات كحد أقصى).`,
    });
    return response.text?.trim() || "ابدأ بالأهم دائماً.";
  } catch (e) { return "ركز على هدف واحد."; }
};

export const getSmartSubtasks = async (taskTitle: string, taskDescription: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `قسم المهمة: "${taskTitle}" إلى 3 خطوات عملية قصيرة جداً باللغة العربية. الرد JSON array strings.`,
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
