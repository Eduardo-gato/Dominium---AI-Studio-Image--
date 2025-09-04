import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { CreateFunction, EditFunction } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<{mimeType: string, data: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        if (typeof reader.result !== 'string') {
            return reject(new Error('FileReader did not return a string.'));
        }
        const result = reader.result;
        const mimeType = result.substring(result.indexOf(':') + 1, result.indexOf(';'));
        const data = result.substring(result.indexOf(',') + 1);
        resolve({ mimeType, data });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const getCreatePrompt = (prompt: string, func: CreateFunction): string => {
    switch(func) {
        case 'sticker': return `design a high-quality, vibrant, die-cut sticker of: ${prompt}. a clean white background.`;
        case 'text': return `design a modern, minimalist logo with the text "${prompt}". vector style, high contrast, on a plain white background.`;
        case 'comic': return `a single comic book panel illustration of: ${prompt}. in a dynamic, american comic book style with bold lines and vibrant colors.`;
        case 'free':
        default: return prompt;
    }
};

export const generateImageFromPrompt = async (prompt: string, func: CreateFunction, aspectRatio: string): Promise<string> => {
    const fullPrompt = getCreatePrompt(prompt, func);
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('API did not return any images.');
    }
    
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const editImage = async (prompt: string, image: File, editFunc: EditFunction): Promise<string> => {
    const { mimeType, data } = await fileToBase64(image);

    let fullPrompt = prompt;
    if (editFunc === 'retouch') {
        fullPrompt = `Retouch this image: ${prompt}`;
    } else if (editFunc === 'style') {
        fullPrompt = `Apply a new style to this image based on the following description: ${prompt}`;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                { inlineData: { data, mimeType } },
                { text: fullPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error('API did not return an edited image.');
};


export const composeImages = async (prompt: string, image1: File, image2: File): Promise<string> => {
    const [img1Data, img2Data] = await Promise.all([fileToBase64(image1), fileToBase64(image2)]);

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                { inlineData: { data: img1Data.data, mimeType: img1Data.mimeType } },
                { inlineData: { data: img2Data.data, mimeType: img2Data.mimeType } },
                { text: `Combine these two images. ${prompt}` },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error('API did not return a composed image.');
};