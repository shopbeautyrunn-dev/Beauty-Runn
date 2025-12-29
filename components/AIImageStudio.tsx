
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface AIImageStudioProps {
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'hair-extensions', label: 'Hair Extensions', icon: 'fa-scissors', prompt: 'High-quality realistic professional product photography of packaged human hair extensions, neatly arranged, bright clean studio background, high-end beauty supply aesthetic' },
  { id: 'wigs', label: 'Wigs', icon: 'fa-user-tie', prompt: 'Realistic high-quality professional product photography of a premium human hair wig on a mannequin head, elegantly styled, soft studio lighting, clean white background' },
  { id: 'braiding-hair', label: 'Braiding Hair', icon: 'fa-layer-group', prompt: 'Realistic professional product photography of a 3-pack of Outre X-Pression pre-stretched braiding hair in retail packaging, 1B color, bright clean background, professional catalog style' },
  { id: 'hair-bundles', label: 'Hair Bundles', icon: 'fa-bundle', prompt: 'High-quality realistic professional product photography of 3 virgin hair bundles neatly stacked with a matching closure, silky texture visible, bright clean studio background' },
  { id: 'hot-tools', label: 'Hot Tools', icon: 'fa-fire', prompt: 'High-quality realistic professional product photography of a sleek matte black ceramic flat iron and ionic hair dryer set, professional salon grade, bright clean minimal background' },
];

const AIImageStudio: React.FC<AIImageStudioProps> = ({ onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    // Check if an API key has been selected before proceeding
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // Assume the key selection was successful and proceed to the app
    }

    setIsGenerating(true);
    setError(null);
    try {
      // Always use the latest API key from the dialog
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              text: selectedCategory.prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        },
      });

      let imageUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        setGeneratedImage(imageUrl);
      } else {
        setError("The model did not return an image. Please try again.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      // If the request fails with "Requested entity was not found.", reset key selection
      if (err.message && err.message.includes("Requested entity was not found.")) {
        setError("API Key error. Please select a valid paid API key.");
        await (window as any).aistudio.openSelectKey();
      } else {
        setError("Failed to generate image. Please check your connection and billing status.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] bg-white safe-top animate-fadeIn flex flex-col">
      <nav className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="font-black text-xl uppercase tracking-tighter">AI Catalog Studio</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Realistic Beauty Product Generation</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center">
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`p-6 rounded-[32px] flex flex-col items-center gap-3 transition-all ${
                selectedCategory.id === cat.id 
                  ? 'bg-gray-900 text-white shadow-xl scale-105' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              <i className={`fa-solid ${cat.icon} text-xl`}></i>
              <span className="text-[9px] font-black uppercase tracking-widest text-center">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="aspect-square w-full max-w-lg mx-auto bg-gray-50 rounded-[50px] overflow-hidden relative shadow-inner border border-gray-100 flex items-center justify-center">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-6 animate-pulse">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 text-2xl">
                <i className="fa-solid fa-camera-retro animate-bounce"></i>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Developing Studio Assets...</p>
            </div>
          ) : generatedImage ? (
            <img src={generatedImage} className="w-full h-full object-cover animate-fadeIn" alt="Generated" />
          ) : (
            <div className="text-center p-12 space-y-4">
              <i className="fa-solid fa-image text-4xl text-gray-200"></i>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select a category and hit generate to create professional catalog imagery.</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center p-8 text-center">
              <div className="space-y-4">
                <i className="fa-solid fa-circle-exclamation text-red-500 text-2xl"></i>
                <p className="text-xs font-bold text-gray-900">{error}</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setError(null)} className="text-[10px] font-black uppercase text-pink-600">Dismiss</button>
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[9px] text-gray-400 underline">Billing Info</a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-lg mx-auto space-y-6">
          <div className="bg-pink-50/50 p-6 rounded-[32px] border border-pink-100">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-pink-600 mb-2">Prompt Strategy</h4>
            <p className="text-xs font-medium text-gray-600 leading-relaxed italic">"{selectedCategory.prompt}"</p>
          </div>

          <button 
            onClick={generateImage} 
            disabled={isGenerating}
            className="w-full bg-gray-900 text-white py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-pink-600 transition-all active:scale-95 disabled:bg-gray-200"
          >
            {isGenerating ? 'Synthesizing...' : `Generate ${selectedCategory.label} Asset`}
          </button>
          
          {generatedImage && (
            <button className="w-full bg-white text-gray-900 border-2 border-gray-900 py-6 rounded-full font-black text-xs uppercase tracking-widest transition-all">
              Save to Beauty Runn Catalog
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIImageStudio;
