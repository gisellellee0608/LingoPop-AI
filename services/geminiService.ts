import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DictionaryEntry } from "../types";

// Helper to ensure API Key exists
const getClient = () => {
  // Check environment variable first, then local storage for user-provided key
  const apiKey = process.env.API_KEY || localStorage.getItem('gemini_api_key') || '';
  
  if (!apiKey) {
    console.error("API_KEY is missing");
    // We don't throw immediately to allow the UI to handle the "missing key" state gracefully if needed,
    // but for actual calls, the SDK will throw.
  }
  return new GoogleGenAI({ apiKey });
};

export const lookupWord = async (
  term: string,
  nativeLang: string,
  targetLang: string,
  model: string = 'gemini-2.5-flash'
): Promise<Omit<DictionaryEntry, 'id' | 'timestamp' | 'imageUrl'>> => {
  const ai = getClient();
  
  const prompt = `
    Explain the term/phrase "${term}" (which is in ${targetLang}) for a native ${nativeLang} speaker.
    
    I need:
    1. A clear definition in ${nativeLang}.
    2. Two distinct example sentences in ${targetLang} with ${nativeLang} translation.
    3. A "Fun Explanation": Imagine you are a cool, witty local friend explaining this. Talk about cultural context, slang usage, specific tone, or how to avoid embarrassing mistakes. Be concise and fun. NOT a textbook definition.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                translation: { type: Type.STRING },
              }
            }
          },
          funExplanation: { type: Type.STRING },
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No text returned from API");
  return JSON.parse(text);
};

export const generateConceptImage = async (term: string, mainModel: string = 'gemini-2.5-flash'): Promise<string | undefined> => {
  const ai = getClient();
  
  // Intelligent Model Selection:
  // If user selected a "Pro" text model (2.5 Pro or 3 Pro), switch to "gemini-3-pro-image-preview" for high quality.
  // If user selected a "Flash" text model, switch to "gemini-2.5-flash-image" (standard generation).
  const isPro = mainModel.includes('pro') || mainModel.includes('3');
  const imageModel = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  // Config: Pro models support explicit size setting
  // CRITICAL: We MUST set safety settings to BLOCK_ONLY_HIGH to prevent false positives from blocking the image.
  const safetySettings = [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' }
  ];

  const config = isPro 
    ? { 
        imageConfig: { aspectRatio: "1:1", imageSize: "1K" },
        safetySettings: safetySettings
      } 
    : { 
        imageConfig: { aspectRatio: "1:1" },
        safetySettings: safetySettings
      };

  try {
    // Simplified prompt for Flash Image to ensure better success rate
    const promptText = isPro 
      ? `A clean, vibrant, minimal, flat vector illustration representing the concept of "${term}". White background. No text.`
      : `A simple, colorful, vector icon representing "${term}". White background.`;

    const response = await ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: [{ text: promptText }]
      },
      config: config
    });

    // Iterate through parts to find the image data
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
    }
  } catch (e) {
    console.warn(`Image generation failed using model ${imageModel}.`, e);
  }
  return undefined;
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | undefined> => {
  const ai = getClient();
  
  // Currently, gemini-2.5-flash-preview-tts is the primary TTS model.
  // We use this regardless of the main text model.
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};

export const chatWithAssistant = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string,
  contextWord: string,
  targetLang: string,
  model: string = 'gemini-2.5-flash'
): Promise<string> => {
  const ai = getClient();
  
  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: `You are a helpful language tutor assistant. The user is currently looking at the word "${contextWord}" in ${targetLang}. Answer their questions briefly and helpfully. Keep the tone friendly and encouraging.`
    },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "I couldn't understand that.";
};

export const generateStory = async (
  words: string[], 
  targetLang: string, 
  nativeLang: string,
  model: string = 'gemini-2.5-flash'
): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
    Write a short, funny, and coherent story in ${targetLang} using the following words: ${words.join(', ')}.
    After the story, provide a brief summary in ${nativeLang}.
    Highlight the used words in the story if possible (e.g., by capitalization).
    Keep it under 150 words.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt
  });

  return response.text || "Could not generate story.";
};