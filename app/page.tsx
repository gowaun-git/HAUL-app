"use client";

import React, { useState, useRef } from 'react';
import { Plus, Camera, Image as ImageIcon, Tag, DollarSign, Loader2, Store, X } from 'lucide-react';
import { analyzeItem } from './actions'; 

export default function HaulmoAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);
      setResults(null);
      setShowOptions(false);
      setIsAnalyzing(true);

      const img = new Image();
      img.src = previewUrl;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        try {
          const aiResponse = await analyzeItem(compressedBase64);
          setResults(aiResponse);
        } catch (error) {
          console.error("Analysis failed:", error);
        } finally {
          setIsAnalyzing(false);
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] p-6 font-sans text-gray-800">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#C17B4E] tracking-tight">Haulmo</h1>
        <p className="text-sm text-gray-500 mt-1">AI-Powered Reselling</p>
      </header>

      <main className="max-w-md mx-auto space-y-6">
        <div className="relative">
          {!selectedImage && !showOptions ? (
            <button 
              onClick={() => setShowOptions(true)} 
              className="w-full aspect-square max-h-64 bg-white rounded-2xl shadow-sm border-2 border-dashed border-[#C17B4E]/30 flex flex-col items-center justify-center hover:bg-[#C17B4E]/5 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-[#C17B4E] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Plus size={40} />
              </div>
              <p className="mt-4 font-semibold text-[#C17B4E]">Identify New Item</p>
            </button>
          ) : showOptions && !selectedImage ? (
            <div className="w-full bg-white rounded-2xl shadow-md border border-[#C17B4E]/20 p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-700">Add Photo</h3>
                <button onClick={() => setShowOptions(false)}><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 bg-[#FFFBF7] border border-[#C17B4E]/10 rounded-xl hover:bg-[#C17B4E]/10 transition-colors">
                  <Camera size={32} className="text-[#C17B4E] mb-2" />
                  <span className="text-sm font-medium">Take Photo</span>
                </button>
                <button onClick={() => galleryInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 bg-[#FFFBF7] border border-[#C17B4E]/10 rounded-xl hover:bg-[#C17B4E]/10 transition-colors">
                  <ImageIcon size={32} className="text-[#C17B4E] mb-2" />
                  <span className="text-sm font-medium">From Gallery</span>
                </button>
              </div>
              <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
              <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <div className="relative w-full aspect-square max-h-64 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
              <img src={selectedImage!} alt="Preview" className="w-full h-full object-cover" />
              {!isAnalyzing && (
                <button 
                  onClick={() => {setSelectedImage(null); setResults(null);}} 
                  className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-md"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-8 h-8 text-[#C17B4E] animate-spin" />
            <p className="text-sm font-medium text-gray-600 italic">Haulmo is thinking...</p>
          </div>
        )}

        {results && !isAnalyzing && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#C17B4E] p-4 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Tag size={18} className="opacity-80" />
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Item Found</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{results.confidence} Match</span>
              </div>
              <h2 className="text-lg font-semibold mt-2 leading-tight">{results.title}</h2>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center space-x-4 bg-[#FFFBF7] p-4 rounded-xl border border-[#C17B4E]/10">
                <div className="bg-[#C17B4E]/10 p-3 rounded-full text-[#C17B4E]">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Resale Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {/* 👇 This is the fix for the nested object error */}
                    {typeof results.valueRange === 'object' && results.valueRange !== null
                      ? `$${results.valueRange.min} - $${results.valueRange.max}`
                      : results.valueRange}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Store size={16} className="mr-2 text-[#C17B4E]" /> Best Platforms
                </p>
                <div className="flex flex-wrap gap-2">
                  {results.platforms?.map((p: string) => (
                    <span key={p} className="px-3 py-1 bg-gray-50 border border-gray-200 text-xs text-gray-700 rounded-full font-medium">{p}</span>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                <p className="text-[10px] text-[#C17B4E] font-bold uppercase mb-1">AI Pro Tip</p>
                <p className="text-sm text-gray-600 leading-snug">{results.description}</p>
              </div>
              
              <button 
                onClick={() => {setSelectedImage(null); setResults(null);}}
                className="w-full bg-[#C17B4E] hover:bg-[#a66840] text-white font-medium py-3 rounded-xl shadow-sm transition-colors"
              >
                Scan Another Item
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}