import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Check, 
  ChevronLeft, 
  Zap,
  Shield,
  Wind,
  Sparkles,
  Box,
  X,
  RotateCcw,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ScanType, Category, BeyItem, SCAN_TYPES, determineCategory } from './types';

type View = 'camera' | 'review' | 'form' | 'gallery';

// Local storage key
const STORAGE_KEY = 'bey-collection-v3';

// Category colors
const CATEGORY_STYLES: Record<Category, { bg: string; text: string; icon: React.ReactNode }> = {
  Attack: { 
    bg: 'bg-gradient-to-br from-red-500 to-orange-500', 
    text: 'text-red-100',
    icon: <Zap size={14} />
  },
  Stamina: { 
    bg: 'bg-gradient-to-br from-green-500 to-emerald-500', 
    text: 'text-green-100',
    icon: <Wind size={14} />
  },
  Defense: { 
    bg: 'bg-gradient-to-br from-blue-500 to-cyan-500', 
    text: 'text-blue-100',
    icon: <Shield size={14} />
  },
  Balance: { 
    bg: 'bg-gradient-to-br from-purple-500 to-pink-500', 
    text: 'text-purple-100',
    icon: <Sparkles size={14} />
  },
};

// Scan type styles
const SCAN_TYPE_STYLES: Record<ScanType, { bg: string; border: string; icon: string }> = {
  Top: { bg: 'bg-gradient-to-br from-red-500/20 to-orange-500/20', border: 'border-red-500/30', icon: '◆' },
  Middle: { bg: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', icon: '◎' },
  Tip: { bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', icon: '▼' },
  Build: { bg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', icon: '⚡' },
};

export default function App() {
  // State
  const [view, setView] = useState<View>('camera');
  const [selectedType, setSelectedType] = useState<ScanType>('Top');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [collection, setCollection] = useState<BeyItem[]>(() => {
    // Load from localStorage on initial render
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load collection:', err);
      return [];
    }
  });
  
  // Form state
  const [name, setName] = useState('');
  const [stats, setStats] = useState({ attack: 3, stamina: 3, defense: 3 });
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // Initialize camera
  useEffect(() => {
    initCamera();
    return () => {
      // Cleanup camera stream on unmount
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [isMobile]);

  const initCamera = async () => {
    try {
      // Stop existing stream
      streamRef.current?.getTracks().forEach(track => track.stop());
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
    }
  };

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    
    setIsCapturing(true);
    
    setTimeout(() => {
      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // For desktop (mirrored camera), flip the image back
      if (!isMobile) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(imageData);
      setIsCapturing(false);
      setView('review');
    }, 150);
  }, [isMobile, isCapturing]);

  // Save item to collection
  const saveToCollection = () => {
    const category = determineCategory(stats.attack, stats.stamina, stats.defense);
    
    const newItem: BeyItem = {
      id: crypto.randomUUID(),
      name: name || `Unnamed ${selectedType}`,
      type: selectedType,
      category,
      stats: { ...stats },
      image: capturedImage,
      createdAt: Date.now()
    };
    
    const updatedCollection = [newItem, ...collection];
    setCollection(updatedCollection);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCollection));
    
    // Reset form
    setName('');
    setStats({ attack: 3, stamina: 3, defense: 3 });
    setView('gallery');
  };

  // Delete item from collection
  const deleteItem = (id: string) => {
    const updatedCollection = collection.filter(item => item.id !== id);
    setCollection(updatedCollection);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCollection));
  };

  // Keyboard shortcut for capture (Space bar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && view === 'camera') {
        e.preventDefault();
        capturePhoto();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, capturePhoto]);

  // Get collection stats
  const collectionStats = {
    total: collection.length,
    top: collection.filter(item => item.type === 'Top').length,
    middle: collection.filter(item => item.type === 'Middle').length,
    tip: collection.filter(item => item.type === 'Tip').length,
    build: collection.filter(item => item.type === 'Build').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Box size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                BEY-SCANNER
              </h1>
              <p className="text-xs text-slate-400">Beyblade Collection Tracker</p>
            </div>
          </div>
          
          <button
            onClick={() => setView('gallery')}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            title="View Collection"
          >
            <Layers size={20} className="text-slate-300" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-6 px-4 max-w-md mx-auto">
        {/* CAMERA VIEW */}
        {view === 'camera' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Camera Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-800 shadow-2xl shadow-black/50">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-[60vh] object-cover ${!isMobile ? 'scale-x-[-1]' : ''}`}
              />
              
              {/* Flash effect */}
              {isCapturing && (
                <div className="absolute inset-0 bg-white animate-flash" />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Center guide */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-24 h-24 border-2 border-white/30 rounded-lg">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/70 rounded-full" />
                </div>
                
                {/* Corner markers */}
                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white/40 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white/40 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white/40 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white/40 rounded-br-lg" />
                
                {/* Type indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <div className={`px-4 py-1.5 rounded-full ${SCAN_TYPE_STYLES[selectedType].bg} border ${SCAN_TYPE_STYLES[selectedType].border}`}>
                    <span className="text-xs font-bold text-white tracking-wider">
                      {selectedType.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Type Selection */}
            <div className="grid grid-cols-4 gap-2">
              {SCAN_TYPES.map(({ type, icon, desc }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                    selectedType === type
                      ? `${SCAN_TYPE_STYLES[type].bg} border ${SCAN_TYPE_STYLES[type].border} scale-105`
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg mb-1">{icon}</span>
                  <span className="text-xs font-medium">{type}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{desc.split('/')[0]}</span>
                </button>
              ))}
            </div>
            
            {/* Capture Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="relative group"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="relative w-20 h-20 rounded-full bg-slate-900 border-4 border-white/10 flex items-center justify-center transition-transform group-active:scale-95">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-inner">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm" />
                  </div>
                </div>
              </button>
            </div>
            
            <p className="text-center text-sm text-slate-400">
              Tap button or press SPACE to capture
            </p>
          </div>
        )}
        
        {/* REVIEW VIEW */}
        {view === 'review' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('camera')}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">Review Photo</h2>
            </div>
            
            <div className="rounded-2xl overflow-hidden bg-slate-800 shadow-xl">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-[60vh] object-cover"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setView('camera')}
                className="py-4 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw size={18} className="text-slate-400" />
                <span className="font-medium text-slate-300">Retake</span>
              </button>
              <button
                onClick={() => setView('form')}
                className="py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Check size={18} className="text-white" />
                <span className="font-bold text-white">Continue</span>
              </button>
            </div>
          </div>
        )}
        
        {/* FORM VIEW */}
        {view === 'form' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('review')}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">Add Details</h2>
            </div>
            
            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-800">
              <img 
                src={capturedImage} 
                alt="Preview" 
                className="w-full h-40 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 to-transparent">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${SCAN_TYPE_STYLES[selectedType].bg} border ${SCAN_TYPE_STYLES[selectedType].border}`}>
                  <span className="text-xs font-bold text-white">{selectedType}</span>
                </div>
              </div>
            </div>
            
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Part Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Storm Pegasus, Diablo Nemesis..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none transition-colors text-white placeholder:text-slate-500"
                autoFocus
              />
            </div>
            
            {/* Stats */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Stats (1-5)
              </label>
              
              <div className="space-y-4">
                {[
                  { key: 'attack' as const, label: 'Attack', color: 'red', icon: <Zap size={16} /> },
                  { key: 'stamina' as const, label: 'Stamina', color: 'green', icon: <Wind size={16} /> },
                  { key: 'defense' as const, label: 'Defense', color: 'blue', icon: <Shield size={16} /> },
                ].map((stat) => (
                  <div key={stat.key} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center text-${stat.color}-400`}>
                      {stat.icon}
                    </div>
                    <span className="text-sm font-medium w-20">{stat.label}</span>
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => setStats(s => ({ ...s, [stat.key]: value }))}
                          className={`flex-1 h-10 rounded-lg transition-all ${
                            stats[stat.key] >= value
                              ? `bg-${stat.color}-500 shadow-lg shadow-${stat.color}-500/25`
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`w-6 text-center font-bold text-${stat.color}-400`}>
                      {stats[stat.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Category Preview */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Detected Category</p>
                  <p className="text-xs text-slate-500">Based on your stats</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${CATEGORY_STYLES[determineCategory(stats.attack, stats.stamina, stats.defense)].bg}`}>
                  {CATEGORY_STYLES[determineCategory(stats.attack, stats.stamina, stats.defense)].icon}
                  <span className="text-sm font-bold text-white">
                    {determineCategory(stats.attack, stats.stamina, stats.defense)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <button
              onClick={saveToCollection}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg hover:opacity-90 transition-opacity active:scale-95"
            >
              Save to Collection
            </button>
          </div>
        )}
        
        {/* GALLERY VIEW */}
        {view === 'gallery' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView('camera')}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-xl font-bold">My Collection</h2>
                  <p className="text-sm text-slate-400">{collection.length} items</p>
                </div>
              </div>
              <button
                onClick={() => setView('camera')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Camera size={16} className="inline mr-2" />
                New Scan
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', value: collectionStats.total, color: 'slate' },
                { label: 'Top', value: collectionStats.top, color: 'red' },
                { label: 'Mid', value: collectionStats.middle, color: 'green' },
                { label: 'Tip', value: collectionStats.tip, color: 'blue' },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl bg-white/5 text-center">
                  <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                  <div className="text-xs text-slate-400 uppercase mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            
            {/* Collection Items */}
            {collection.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Box size={36} className="text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">No Beyblades Yet</h3>
                <p className="text-slate-500 mb-6">Start scanning your collection!</p>
                <button
                  onClick={() => setView('camera')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Scan Your First Bey
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {collection.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl overflow-hidden bg-slate-800 animate-in fade-in zoom-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="aspect-square">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-70" />
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} className="text-white" />
                    </button>
                    
                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${CATEGORY_STYLES[item.category].bg}`} />
                        <span className="text-xs font-medium text-slate-300">{item.type}</span>
                      </div>
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      <div className="flex gap-3 mt-2 text-xs text-slate-400">
                        <span className="text-red-400">A:{item.stats.attack}</span>
                        <span className="text-green-400">S:{item.stats.stamina}</span>
                        <span className="text-blue-400">D:{item.stats.defense}</span>
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full ${CATEGORY_STYLES[item.category].bg}`}>
                      <span className="text-xs font-bold text-white">{item.category[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </main>
      
      {/* Bottom Navigation */}
      {view !== 'camera' && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 px-4 py-3">
          <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
            <button
              onClick={() => setView('camera')}
              className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <Camera size={20} />
              <span className="text-xs mt-1">Camera</span>
            </button>
            <button
              onClick={() => setView('review')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                view === 'review' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box size={20} />
              <span className="text-xs mt-1">Review</span>
            </button>
            <button
              onClick={() => setView('form')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                view === 'form' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChevronRight size={20} />
              <span className="text-xs mt-1">Details</span>
            </button>
            <button
              onClick={() => setView('gallery')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                view === 'gallery' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={20} />
              <span className="text-xs mt-1">Gallery</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}