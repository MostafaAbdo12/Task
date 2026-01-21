import { GoogleGenAI, Type, Modality } from "@google/genai";

/**
 * محرك الذكاء الاصطناعي المتقدم للمنصة.
 */

const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. الموجز الصوتي الذكي - محسن
export const getSystemBriefingAudio = async (username: string, tasks: any[]) => {
  try {
    const ai = getAIInstance();
    const pending = tasks.filter(t => t.status !== 'COMPLETED');
    const urgent = pending.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH');
    
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "صباح الخير" : "مساء الخير";

    let context = `${greeting} يا ${username}. `;
    if (pending.length === 0) {
      context += "سجلك نظيف تماماً اليوم، أنت في قمة الإنتاجية!";
    } else {
      context += `لديك ${pending.length} مهام نشطة، منها ${urgent.length} مهام ذات أولوية قصوى. `;
      if (urgent.length > 0) context += `أنصحك بالبدء فوراً بـ: ${urgent[0].title}.`;
    }

    const prompt = `أنت مساعد إنتاجية ذكي جداً. بأسلوب محفز، عملي، ومختصر جداً، قل باللغة العربية: ${context}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    return part?.inlineData?.data || null;
  } catch (error) {
    console.error("AI Briefing Error:", error);
    return null;
  }
};

// 2. التعبئة السحرية للنماذج (Magic Fill)
export const getMagicFillData = async (title: string) => {
  try {
    const ai = getAIInstance();
    const prompt = `بناءً على عنوان المهمة: "${title}"، اقترح بيانات كاملة للمهمة. 
يجب أن يكون الرد بصيغة JSON تحتوي على:
- description: وصف مشجع ومختصر (عربي)
- priority: اختر من [LOW, MEDIUM, HIGH, URGENT]
- category: اختر من [عمل, شخصي, دراسة, صحة, تسوق, أخرى]
- subTasks: مصفوفة من 3 خطوات تنفيذية ذكية (عربي)`;

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
    console.error("AI Magic Fill Error:", error);
    return null;
  }
};

// 3. تحليل المهمة الفردية (Task Insight)
export const getTaskInsight = async (task: any) => {
  try {
    const ai = getAIInstance();
    const prompt = `المهمة: "${task.title}". الوصف: "${task.description}".
قدم نصيحة تنفيذية واحدة (أقل من 15 كلمة) باللغة العربية تجعل تنفيذ هذه المهمة أسهل أو أسرع.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text?.trim() || "ابدأ بالخطوة الأصغر دائماً.";
  } catch (error) {
    return "ركز على إنجاز الخطوة الأولى الآن.";
  }
};

export const getSmartAdvice = async (tasks: any[]) => {
  try {
    const ai = getAIInstance();
    const pending = tasks.filter(t => t.status !== 'COMPLETED').map(t => t.title).join(', ');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `المهام: [${pending}]. قدم نصيحة إدارية واحدة ملهمة ومختصرة جداً للعقل البشري باللغة العربية.`,
    });
    
    return response.text?.trim() || "التنظيم هو مفتاح الحرية الإبداعية.";
  } catch (error) {
    return "النظام جاهز لدعم إنتاجيتك.";
  }
};

export const getSmartSubtasks = async (taskTitle: string, taskDescription: string) => {
    try {
      const ai = getAIInstance();
      const prompt = `فكك المهمة لـ 3 خطوات: "${taskTitle}". الرد JSON array strings.`;
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
      return [];
    }
};