import React, { useState, useEffect, useRef } from 'react';
import { 
  Languages, Book, Search, RotateCcw, Volume2, Send, 
  Save, Sparkles, ChevronRight, Brain, ArrowLeft, Loader2, Star, Settings, CheckCircle, Key, Eye, EyeOff,
  Download, Upload, Trash2
} from 'lucide-react';
import { 
  AppView, 
  DictionaryEntry, 
  SUPPORTED_LANGUAGES, 
  ChatMessage,
  AI_MODELS
} from './types';
import * as GeminiService from './services/geminiService';
import { playAudio } from './utils/audioUtils';

// --- COMPONENTS ---

// 0. Config View (New)
const ConfigView: React.FC<{
  onComplete: (model: string) => void;
  initialModel: string;
}> = ({ onComplete, initialModel }) => {
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Load saved key from localStorage if exists
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else if (process.env.API_KEY) {
      // If environment key is preset (e.g. in dev), we can use that, 
      // but we don't show it in the input for security unless user types it.
      // We can just let the service handle process.env.
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    }
    onComplete(selectedModel);
  };

  // Check if we have a valid "Ready" state (either input filled OR env var exists)
  const isReady = apiKey.length > 0 || !!process.env.API_KEY;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pop-bg p-6">
      <div className="text-4xl font-bold text-pop-primary mb-2">LingoPop AI</div>
      <p className="text-gray-500 mb-8">Configure your AI Brain</p>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-8">
        
        {/* API Key Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Key className="w-5 h-5 text-pop-accent" /> 
            API Key
          </h3>
          
          <div className="relative">
            <input 
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={process.env.API_KEY ? "Using Environment Key" : "Enter Gemini API Key"}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-pop-primary focus:outline-none text-gray-700 font-mono text-sm"
            />
            <button 
              onClick={() => setShowKey(!showKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <p className="text-[10px] text-gray-400 text-center">
            Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline text-pop-primary">Google AI Studio</a>.
            Stored locally in your browser.
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Brain className="w-5 h-5 text-pop-secondary" /> 
            Select Model
          </h3>
          <div className="space-y-2">
            {AI_MODELS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all flex justify-between items-center ${
                  selectedModel === m.id 
                  ? 'border-pop-secondary bg-pink-50' 
                  : 'border-gray-100 hover:border-pink-100'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-gray-800">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.desc}</div>
                </div>
                {selectedModel === m.id && <CheckCircle className="w-5 h-5 text-pop-secondary" />}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={!isReady}
          onClick={handleSave}
          className="w-full bg-pop-primary disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
        >
          Continue <ChevronRight />
        </button>
      </div>
    </div>
  );
};

// 1. Language Setup Component
const SetupView: React.FC<{
  onComplete: (native: string, target: string) => void;
}> = ({ onComplete }) => {
  const [native, setNative] = useState('en');
  const [target, setTarget] = useState('es');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pop-bg p-6">
      <div className="text-4xl font-bold text-pop-primary mb-2 animate-bounce">LingoPop AI</div>
      <p className="text-gray-500 mb-10">Your fun, AI-powered language buddy.</p>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I speak...</label>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.slice(0, 4).map(l => (
              <button
                key={l.code}
                onClick={() => setNative(l.code)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  native === l.code ? 'border-pop-primary bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'
                }`}
              >
                {l.flag} {l.name}
              </button>
            ))}
          </div>
          <select 
            className="mt-2 w-full p-2 border rounded-xl"
            value={native}
            onChange={(e) => setNative(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <RotateCcw className="text-gray-300" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I want to learn...</label>
           <select 
            className="w-full p-2 border rounded-xl"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onComplete(native, target)}
          className="w-full bg-pop-primary text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
        >
          Start Journey <ChevronRight />
        </button>
      </div>
    </div>
  );
};

// 2. Search Bar Component
const SearchHeader: React.FC<{
  onSearch: (term: string) => void;
  onOpenSettings: () => void;
  loading: boolean;
}> = ({ onSearch, onOpenSettings, loading }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) onSearch(term);
  };

  return (
    <div className="sticky top-0 z-20 bg-pop-bg/90 backdrop-blur-sm p-4 border-b border-gray-100">
      <div className="relative max-w-lg mx-auto flex gap-2">
        <form onSubmit={handleSubmit} className="relative flex-1">
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Type a word, phrase, or sentence..."
            className="w-full pl-12 pr-4 py-3.5 rounded-full border-2 border-gray-200 focus:border-pop-primary focus:outline-none shadow-sm text-gray-800 placeholder-gray-400 transition-colors"
            disabled={loading}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button 
            type="submit"
            disabled={loading || !term}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-pop-primary text-white p-2 rounded-full disabled:opacity-50 hover:bg-indigo-600"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </form>
        <button 
          onClick={onOpenSettings}
          className="p-3 bg-white border-2 border-gray-200 text-gray-400 rounded-full hover:border-pop-primary hover:text-pop-primary transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// 3. Result Card Component
const ResultView: React.FC<{
  entry: DictionaryEntry | null;
  loading: boolean;
  onSave: (entry: DictionaryEntry) => void;
  isSaved: boolean;
  nativeLang: string;
  targetLang: string;
  model: string;
}> = ({ entry, loading, onSave, isSaved, nativeLang, targetLang, model }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    // Reset chat when entry changes
    setChatHistory([]);
    setChatOpen(false);
  }, [entry?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-pop-primary/30 border-t-pop-primary rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Sparkles className="text-pop-secondary w-6 h-6 animate-pulse" />
            </div>
        </div>
        <p className="text-gray-500 animate-pulse font-medium">Consulting the AI brain...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Search className="w-16 h-16 mb-4 opacity-20" />
        <p>Enter a word to get started!</p>
      </div>
    );
  }

  const handlePlayAudio = async (text: string, id: string) => {
    if (playingAudio) return;
    setPlayingAudio(id);
    const base64 = await GeminiService.generateSpeech(text);
    if (base64) {
      await playAudio(base64);
    }
    setPlayingAudio(null);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await GeminiService.chatWithAssistant(
        chatHistory, 
        userMsg.text, 
        entry.term,
        targetLang,
        model
      );
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="px-4 pb-24 max-w-lg mx-auto space-y-6 animate-[fadeIn_0.5s_ease-out]">
      
      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          {entry.imageUrl ? (
            <img src={`data:image/png;base64,${entry.imageUrl}`} alt={entry.term} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-300 flex flex-col items-center">
               <Loader2 className="animate-spin mb-2"/>
               <span className="text-xs">Drawing...</span>
            </div>
          )}
          <div className="absolute top-4 right-4">
             <button 
              onClick={() => onSave(entry)}
              className={`p-2 rounded-full shadow-md backdrop-blur-md transition-colors ${isSaved ? 'bg-pop-secondary text-white' : 'bg-white/80 text-gray-500 hover:text-pop-secondary'}`}
            >
              <Save className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-pop-dark">{entry.term}</h2>
            <button 
              onClick={() => handlePlayAudio(entry.term, 'main')}
              disabled={!!playingAudio}
              className="p-2 bg-indigo-50 rounded-full text-pop-primary hover:bg-indigo-100 transition"
            >
              <Volume2 className={`w-6 h-6 ${playingAudio === 'main' ? 'animate-pulse' : ''}`} />
            </button>
          </div>
          <p className="text-lg text-gray-600 mb-6 font-medium">{entry.definition}</p>

          {/* Examples */}
          <div className="space-y-4 mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Examples</h3>
            {entry.examples.map((ex, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative group">
                <p className="text-pop-dark font-medium pr-8">{ex.original}</p>
                <p className="text-gray-500 text-sm mt-1">{ex.translation}</p>
                <button 
                  onClick={() => handlePlayAudio(ex.original, `ex-${idx}`)}
                  className="absolute right-2 top-2 p-2 text-gray-300 hover:text-pop-primary"
                >
                   <Volume2 className={`w-4 h-4 ${playingAudio === `ex-${idx}` ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Fun Explanation */}
          <div className="bg-pop-accent/10 p-5 rounded-2xl border border-pop-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💡</span>
              <h3 className="font-bold text-yellow-700">Local's Take</h3>
            </div>
            <p className="text-yellow-800 text-sm leading-relaxed">
              {entry.funExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Module */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-pop-primary to-indigo-600 text-white"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Ask AI Assistant</span>
          </div>
          <ChevronRight className={`transition-transform ${chatOpen ? 'rotate-90' : ''}`} />
        </button>
        
        {chatOpen && (
          <div className="p-4 bg-gray-50">
            <div className="h-60 overflow-y-auto mb-4 space-y-3 no-scrollbar p-2">
               {chatHistory.length === 0 && (
                 <div className="text-center text-gray-400 text-sm mt-10">
                   Ask specifically about "{entry.term}"...
                 </div>
               )}
               {chatHistory.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                     msg.role === 'user' 
                     ? 'bg-pop-primary text-white rounded-br-none' 
                     : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'
                   }`}>
                     {msg.text}
                   </div>
                 </div>
               ))}
               {chatLoading && (
                 <div className="flex justify-start">
                   <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm">
                     <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                   </div>
                 </div>
               )}
            </div>
            <form onSubmit={handleChatSubmit} className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border-gray-200 focus:border-pop-primary focus:ring-0"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-pop-primary hover:bg-indigo-50 rounded-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Notebook Component
const NotebookView: React.FC<{
  entries: DictionaryEntry[];
  targetLang: string;
  nativeLang: string;
  onDelete: (id: string) => void;
  model: string;
  onImport: (data: DictionaryEntry[]) => void;
}> = ({ entries, targetLang, nativeLang, onDelete, model, onImport }) => {
  const [story, setStory] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateStory = async () => {
    if (entries.length < 3) {
      alert("Save at least 3 words to generate a story!");
      return;
    }
    setLoadingStory(true);
    setStory(null);
    try {
      const result = await GeminiService.generateStory(
        entries.map(e => e.term),
        targetLang,
        nativeLang,
        model
      );
      setStory(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStory(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lingopop_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          onImport(importedData);
          alert("Notebook restored successfully!");
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to read backup file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="px-4 pb-24 max-w-lg mx-auto pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-pop-dark">My Collection ({entries.length})</h2>
        <button 
          onClick={handleGenerateStory}
          disabled={loadingStory || entries.length < 3}
          className="flex items-center gap-2 text-xs font-bold text-pop-primary bg-indigo-50 px-3 py-2 rounded-full hover:bg-indigo-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingStory ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Magic Story
        </button>
      </div>

      {/* Data Management Section */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="text-sm text-gray-500 font-medium">Data Backup</div>
        <div className="flex gap-2">
           <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden" 
            accept=".json"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1 text-xs"
            title="Import Backup"
          >
            <Upload className="w-4 h-4" /> Import
          </button>
          <button 
            onClick={handleExport}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1 text-xs"
            title="Export Backup"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[40vh] text-gray-400 p-6 text-center">
          <Book className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-bold text-gray-500">Your notebook is empty</h3>
          <p className="text-sm mt-2">Save words or import a backup to get started.</p>
        </div>
      )}

      {story && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-3xl border border-purple-100 shadow-sm animate-[fadeIn_0.5s]">
          <div className="flex justify-between mb-2">
             <h3 className="font-bold text-purple-800">AI Story</h3>
             <button onClick={() => setStory(null)} className="text-xs text-gray-400">Close</button>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{story}</p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map(entry => (
          <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start group">
             {entry.imageUrl && (
               <img src={`data:image/png;base64,${entry.imageUrl}`} className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0" alt="" />
             )}
             <div className="flex-1">
               <div className="flex justify-between items-start">
                 <h3 className="font-bold text-lg text-gray-800">{entry.term}</h3>
                 <button onClick={() => onDelete(entry.id)} className="text-gray-300 hover:text-red-400 p-1">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
               <p className="text-sm text-gray-500 line-clamp-2">{entry.definition}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Flashcards Component
const FlashcardsView: React.FC<{
  entries: DictionaryEntry[];
}> = ({ entries }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 p-6 text-center">
        <Brain className="w-20 h-20 mb-4 opacity-20" />
        <p>Add words to your notebook to unlock Learning Mode.</p>
      </div>
    );
  }

  const current = entries[currentIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % entries.length);
    }, 200); // fast transition
  };

  return (
    <div className="px-4 pb-24 max-w-lg mx-auto pt-10 h-[80vh] flex flex-col">
      <div className="text-center mb-6">
         <h2 className="text-2xl font-bold text-pop-dark">Flashcards</h2>
         <p className="text-gray-400 text-sm">{currentIndex + 1} / {entries.length}</p>
      </div>

      <div className="flex-1 relative perspective-1000">
        <div 
          onClick={() => setFlipped(!flipped)}
          className={`relative w-full h-96 cursor-pointer transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT */}
          <div className="absolute w-full h-full bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-8 backface-hidden">
             {current.imageUrl && (
               <img src={`data:image/png;base64,${current.imageUrl}`} className="w-32 h-32 rounded-full object-cover mb-6 shadow-md" alt="" />
             )}
             <h3 className="text-4xl font-black text-pop-primary text-center">{current.term}</h3>
             <p className="text-gray-400 text-sm mt-4 animate-pulse">Tap to flip</p>
          </div>

          {/* BACK */}
          <div className="absolute w-full h-full bg-pop-primary rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 text-white">
             <h4 className="text-xl font-bold mb-4 text-center border-b border-white/20 pb-2 w-full">Definition</h4>
             <p className="text-center text-lg font-medium mb-6">{current.definition}</p>
             
             <div className="bg-white/10 p-4 rounded-xl w-full">
               <p className="text-sm italic opacity-90">"{current.examples[0].original}"</p>
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button 
          onClick={handleNext}
          className="bg-pop-dark text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          Next Card <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 6. Navigation Bar
const NavBar: React.FC<{
  currentView: AppView;
  setView: (v: AppView) => void;
}> = ({ currentView, setView }) => {
  const items = [
    { id: AppView.SEARCH, icon: Search, label: 'Search' },
    { id: AppView.NOTEBOOK, icon: Book, label: 'Notebook' },
    { id: AppView.FLASHCARDS, icon: Brain, label: 'Learn' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-pop-dark text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-8">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center gap-1 transition-opacity ${
            currentView === item.id ? 'text-pop-accent opacity-100' : 'text-gray-400 opacity-60 hover:opacity-100'
          }`}
        >
          <item.icon className={`w-6 h-6 ${currentView === item.id ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  );
};

// --- MAIN APP CONTAINER ---

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.CONFIG);
  const [nativeLang, setNativeLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [model, setModel] = useState('gemini-2.5-flash');
  
  // Dictionary Data
  const [currentEntry, setCurrentEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Notebook Data
  const [notebook, setNotebook] = useState<DictionaryEntry[]>(() => {
    const saved = localStorage.getItem('lingopop_notebook');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lingopop_notebook', JSON.stringify(notebook));
  }, [notebook]);

  const handleConfigComplete = (selectedModel: string) => {
    setModel(selectedModel);
    setView(AppView.SETUP);
  };

  const handleSetupComplete = (native: string, target: string) => {
    setNativeLang(native);
    setTargetLang(target);
    setView(AppView.SEARCH);
  };

  const handleSearch = async (term: string) => {
    setLoading(true);
    setView(AppView.SEARCH); // Ensure we are on search view
    setCurrentEntry(null);
    
    try {
      // 1. Get text data
      const data = await GeminiService.lookupWord(term, nativeLang, targetLang, model);
      
      // 2. Start image generation (async)
      // We render the text result first, then update with image when ready for perceived speed
      const tempId = Date.now().toString();
      const newEntry: DictionaryEntry = {
        id: tempId,
        term,
        ...data,
        timestamp: Date.now()
      };
      setCurrentEntry(newEntry);
      setLoading(false); // Show content immediately

      // 3. Fetch image in background
      GeminiService.generateConceptImage(term).then(img => {
        if (img) {
          setCurrentEntry(prev => prev && prev.id === tempId ? { ...prev, imageUrl: img } : prev);
        }
      });

    } catch (error) {
      console.error(error);
      setLoading(false);
      // Could add error toast here
    }
  };

  const toggleSave = (entry: DictionaryEntry) => {
    const exists = notebook.find(n => n.term === entry.term);
    if (exists) {
      setNotebook(prev => prev.filter(n => n.term !== entry.term));
    } else {
      setNotebook(prev => [entry, ...prev]);
    }
  };

  const handleImportData = (data: DictionaryEntry[]) => {
    // Merge strategy: Add unique items by term
    setNotebook(prev => {
      const existingTerms = new Set(prev.map(p => p.term));
      const newItems = data.filter(d => !existingTerms.has(d.term));
      return [...newItems, ...prev];
    });
  };

  const isSaved = (term: string) => notebook.some(n => n.term === term);

  if (view === AppView.CONFIG) {
    return <ConfigView onComplete={handleConfigComplete} initialModel={model} />;
  }

  if (view === AppView.SETUP) {
    return <SetupView onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-pop-bg text-gray-800 font-sans">
      {view === AppView.SEARCH && (
        <>
          <SearchHeader 
            onSearch={handleSearch} 
            loading={loading} 
            onOpenSettings={() => setView(AppView.CONFIG)} 
          />
          <div className="pt-6">
            <ResultView 
              entry={currentEntry} 
              loading={loading} 
              onSave={toggleSave}
              isSaved={currentEntry ? isSaved(currentEntry.term) : false}
              nativeLang={nativeLang}
              targetLang={targetLang}
              model={model}
            />
          </div>
        </>
      )}

      {view === AppView.NOTEBOOK && (
        <NotebookView 
          entries={notebook} 
          targetLang={targetLang} 
          nativeLang={nativeLang} 
          onDelete={(id) => setNotebook(prev => prev.filter(n => n.id !== id))}
          model={model}
          onImport={handleImportData}
        />
      )}

      {view === AppView.FLASHCARDS && (
        <FlashcardsView entries={notebook} />
      )}

      <NavBar currentView={view} setView={setView} />
    </div>
  );
};

export default App;