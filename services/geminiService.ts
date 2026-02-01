import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role, AffinityStage, Language } from '../types';
import { SYSTEM_PROMPTS, AFFINITY_THRESHOLDS, UI_TEXT } from '../constants';

const API_KEY = process.env.API_KEY || ''; 

let genAI: GoogleGenAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenAI({ apiKey: API_KEY });
}

export const getAffinityStageName = (affinity: number, lang: Language): string => {
  const stages = UI_TEXT[lang].stages;
  if (affinity <= AFFINITY_THRESHOLDS[AffinityStage.STRANGER]) return stages.stranger;
  if (affinity <= AFFINITY_THRESHOLDS[AffinityStage.ACQUAINTANCE]) return stages.acquaintance;
  if (affinity <= AFFINITY_THRESHOLDS[AffinityStage.COMPANION]) return stages.companion;
  return stages.soulmate;
};

const getSystemPrompt = (affinity: number, lang: Language) => {
  const stageName = getAffinityStageName(affinity, lang);
  const basePrompt = SYSTEM_PROMPTS[lang].base;
  return basePrompt.replace('{{AFFINITY_LEVEL}}', stageName);
};

export const sendMessageToMoChen = async (
  history: Message[], 
  newMessage: string, 
  affinity: number,
  lang: Language
): Promise<string> => {
  if (!genAI) return lang === 'zh' ? "错误：缺失灵石秘钥 (API_KEY)。" : "Error: Missing Spiritual Key (API_KEY).";

  const modelId = 'gemini-3-flash-preview'; 
  const prompt = getSystemPrompt(affinity, lang);

  const recentHistory = history.slice(-8).map(msg => ({
    role: msg.role === Role.USER ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  try {
    const chat = genAI.chats.create({
      model: modelId,
      config: {
        systemInstruction: prompt,
        temperature: 0.8,
      },
      history: recentHistory,
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === 'zh' ? "虚空破碎，传音中断…… (API 错误)" : "The void disrupts my voice... (API Error)";
  }
};

export const analyzeArtifact = async (
  mimeType: string, 
  base64Data: string, 
  affinity: number,
  context: 'file' | 'screen',
  lang: Language
): Promise<string> => {
  if (!genAI) return lang === 'zh' ? "错误：缺失灵石秘钥。" : "Error: Missing Spiritual Key.";

  const modelId = 'gemini-2.5-flash-image';
  
  let prompt = "";
  
  if (context === 'screen') {
     prompt = lang === 'zh' 
      ? "系统：用户正在展示他们的屏幕（“幻境”）。分析他们在做什么（写代码、购物、游戏？），并以墨尘（修仙者）的身份进行吐槽或点评。" 
      : "SYSTEM: The user is showing you their screen (The 'Illusion Realm'). Analyze what they are doing (Coding, Shopping, Gaming?) and comment on it as Mo Chen.";
  } else {
    prompt = SYSTEM_PROMPTS[lang].analysis;
  }

  try {
    const parts: any[] = [{ text: prompt }];
    
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    });

    const response: GenerateContentResponse = await genAI.models.generateContent({
        model: modelId,
        contents: { parts }
    });

    return response.text || (lang === 'zh' ? "此幻境模糊不清，本座看不真切。" : "This illusion is too blurry for my Divine Eyes.");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return lang === 'zh' ? "神识受阻。" : "My Divine Sense has been blocked.";
  }
};