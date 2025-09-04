import React, { useState, useCallback } from 'react';
import type { Mode, CreateFunction, EditFunction } from './types';
import { CREATE_FUNCTIONS, EDIT_FUNCTIONS } from './constants';
import FunctionCard from './components/FunctionCard';
import Spinner from './components/Spinner';
import { generateImageFromPrompt, editImage, composeImages } from './services/geminiService';

// --- Component: ImageUploadArea ---
interface ImageUploadAreaProps {
  id: string;
  preview: string | null;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  title?: string;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({ id, preview, onChange, title = "Clique ou arraste uma imagem" }) => (
    <div 
        id={`uploadArea-${id}`} 
        className={`upload-area bg-gray-900/70 border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200 relative ${preview ? 'h-64' : 'h-32'}`}
        onClick={() => document.getElementById(id)?.click()}>
        <input type="file" id={id} accept="image/*" className="hidden" onChange={onChange} />
        {preview ? (
            <img src={preview} alt="Preview" className="image-preview absolute inset-0 w-full h-full object-cover rounded-lg" />
        ) : (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-3xl text-gray-500">📁</div>
                <p className="font-semibold text-gray-300">{title}</p>
                <p className="upload-text text-xs text-gray-500">PNG, JPG, WebP</p>
            </div>
        )}
    </div>
);

// --- Component: LeftPanel ---
interface LeftPanelProps {
  mode: Mode;
  prompt: string;
  setPrompt: (value: string) => void;
  aspectRatio: string;
  setAspectRatio: (value: string) => void;
  handleModeChange: (newMode: Mode) => void;
  activeCreateFunc: CreateFunction;
  setActiveCreateFunc: (func: CreateFunction) => void;
  activeEditFunc: EditFunction;
  handleEditFuncSelect: (id: string, requiresTwo?: boolean) => void;
  showTwoImagesView: boolean;
  setShowTwoImagesView: (show: boolean) => void;
  image1Preview: string | null;
  image2Preview: string | null;
  onImage1Change: React.ChangeEventHandler<HTMLInputElement>;
  onImage2Change: React.ChangeEventHandler<HTMLInputElement>;
  generateImage: () => void;
  isLoading: boolean;
  error: string | null;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  mode, prompt, setPrompt, aspectRatio, setAspectRatio, handleModeChange,
  activeCreateFunc, setActiveCreateFunc, activeEditFunc, handleEditFuncSelect,
  showTwoImagesView, setShowTwoImagesView, image1Preview, image2Preview,
  onImage1Change, onImage2Change, generateImage, isLoading, error
}) => (
  <div className="left-panel md:w-1/3 lg:w-1/4 bg-gray-800/50 p-6 rounded-2xl flex flex-col gap-4 h-full overflow-y-auto">
    <header>
      <h1 className="panel-title text-2xl font-bold">🎨 AI Image Studio</h1>
      <p className="panel-subtitle text-gray-400">Gerador profissional de imagens</p>
    </header>
    
    <div className="prompt-section">
      <div className="section-title text-sm font-semibold mb-2 text-gray-300">💭 Descreva sua ideia</div>
      <textarea
        id="prompt"
        className="prompt-input w-full bg-gray-900/70 border-2 border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none h-28"
        placeholder="Descreva a imagem que você deseja criar..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
    </div>

    {mode === 'create' && (
      <div className="aspect-ratio-section">
        <div className="section-title text-sm font-semibold mb-2 text-gray-300">📐 Proporção</div>
        <div className="grid grid-cols-5 gap-2">
          {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`p-2 rounded-md text-sm font-mono transition-colors duration-200 ${aspectRatio === ratio ? 'bg-blue-600' : 'bg-gray-900/70 hover:bg-gray-700'}`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>
    )}

    <div className="mode-toggle grid grid-cols-2 gap-2 bg-gray-900/70 p-1 rounded-lg">
      <button
        className={`mode-btn p-2 rounded-md transition-colors duration-200 ${mode === 'create' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
        onClick={() => handleModeChange('create')}
      >Criar</button>
      <button
        className={`mode-btn p-2 rounded-md transition-colors duration-200 ${mode === 'edit' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
        onClick={() => handleModeChange('edit')}
      >Editar</button>
    </div>

    {mode === 'create' && (
      <div id="createFunctions" className="functions-section">
        <div className="functions-grid grid grid-cols-4 gap-2">
          {CREATE_FUNCTIONS.map(card => (
            <FunctionCard key={card.id} card={card} isActive={activeCreateFunc === card.id} onClick={(id) => setActiveCreateFunc(id as CreateFunction)} />
          ))}
        </div>
      </div>
    )}

    {mode === 'edit' && !showTwoImagesView && (
      <div id="editFunctions" className="functions-section">
         <div className="functions-grid grid grid-cols-4 gap-2">
          {EDIT_FUNCTIONS.map(card => (
            <FunctionCard key={card.id} card={card} isActive={activeEditFunc === card.id} onClick={handleEditFuncSelect} />
          ))}
        </div>
      </div>
    )}

    {mode === 'edit' && showTwoImagesView && (
       <div id="twoImagesSection" className="functions-section flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-300">📸 Duas Imagens Necessárias</h3>
          <ImageUploadArea id='imageUpload1' preview={image1Preview} onChange={onImage1Change} title='Primeira Imagem' />
          <ImageUploadArea id='imageUpload2' preview={image2Preview} onChange={onImage2Change} title='Segunda Imagem' />
          <button className="back-btn text-sm p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" onClick={() => setShowTwoImagesView(false)}>← Voltar para Edição</button>
       </div>
    )}

    {mode === 'edit' && !showTwoImagesView && (
        <div className="dynamic-content">
           <ImageUploadArea id='imageUpload' preview={image1Preview} onChange={onImage1Change} />
        </div>
    )}
    
    <button id="generateBtn" className="generate-btn mt-auto w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
      onClick={generateImage}
      disabled={isLoading}
    >
      {isLoading ? <Spinner /> : <span className="btn-text">🚀 Gerar Imagem</span>}
    </button>

    {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm text-center">{error}</div>}
  </div>
);

// --- Component: RightPanel ---
interface RightPanelProps {
    generatedImageUrl: string | null;
    isLoading: boolean;
    editCurrentImage: () => void;
    downloadImage: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ generatedImageUrl, isLoading, editCurrentImage, downloadImage }) => (
    <div className="right-panel md:w-2/3 lg:w-3/4 p-6 flex items-center justify-center h-full relative">
      {!generatedImageUrl && !isLoading && (
        <div id="resultPlaceholder" className="result-placeholder text-center text-gray-500">
          <div className="result-placeholder-icon text-6xl">🎨</div>
          <p className="mt-2">Sua obra de arte aparecerá aqui</p>
        </div>
      )}
      {isLoading && (
        <div id="loadingContainer" className="loading-container flex flex-col items-center gap-4 text-center">
            <div className="loading-spinner w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
            <p className="loading-text text-lg">Gerando sua imagem...</p>
        </div>
      )}
      {generatedImageUrl && !isLoading && (
        <div id="imageContainer" className="image-container w-full h-full flex flex-col items-center justify-center gap-4">
          <img id="generatedImage" src={generatedImageUrl} alt="Generated Art" className="generated-image max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"/>
          <div className="image-actions flex gap-4 bg-gray-900/50 p-2 rounded-full">
             <button className="action-btn w-12 h-12 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center text-xl transition-colors" title="Editar" onClick={editCurrentImage}>✏️</button>
             <button className="action-btn w-12 h-12 bg-gray-700 hover:bg-green-600 rounded-full flex items-center justify-center text-xl transition-colors" title="Download" onClick={downloadImage}>💾</button>
          </div>
        </div>
      )}
    </div>
);

// --- Component: MobileModal ---
interface MobileModalProps {
    isModalOpen: boolean;
    generatedImageUrl: string | null;
    editCurrentImage: () => void;
    setIsModalOpen: (isOpen: boolean) => void;
    setGeneratedImageUrl: (url: string | null) => void;
    downloadImage: () => void;
}

const MobileModal: React.FC<MobileModalProps> = ({ isModalOpen, generatedImageUrl, editCurrentImage, setIsModalOpen, setGeneratedImageUrl, downloadImage }) => (
    <div id="mobileModal" className={`mobile-modal fixed inset-0 bg-black/80 flex flex-col justify-center items-center z-50 p-4 transition-opacity duration-300 ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="modal-content w-full max-w-md bg-gray-800 rounded-2xl p-4 flex flex-col gap-4">
            {generatedImageUrl && <img id="modalImage" src={generatedImageUrl} alt="Generated Art" className="modal-image w-full rounded-lg" />}
            <div className="modal-actions grid grid-cols-3 gap-2">
                <button className="modal-btn edit p-3 bg-blue-600 rounded-lg" onClick={() => { editCurrentImage(); setIsModalOpen(false); }}>✏️ Editar</button>
                <button className="modal-btn download p-3 bg-green-600 rounded-lg" onClick={downloadImage}>💾 Salvar</button>
                <button className="modal-btn new p-3 bg-gray-600 rounded-lg" onClick={() => { setGeneratedImageUrl(null); setIsModalOpen(false); }}>✨ Nova</button>
            </div>
        </div>
    </div>
);

// --- Main App Component ---
const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('create');
  const [activeCreateFunc, setActiveCreateFunc] = useState<CreateFunction>('free');
  const [activeEditFunc, setActiveEditFunc] = useState<EditFunction>('add-remove');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image1Preview, setImage1Preview] = useState<string | null>(null);
  const [image2Preview, setImage2Preview] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTwoImagesView, setShowTwoImagesView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageUpload = (input: HTMLInputElement, previewSetter: React.Dispatch<React.SetStateAction<string | null>>, imageSetter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      imageSetter(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        previewSetter(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setShowTwoImagesView(false);
    setError(null);
    // Reset images when switching modes
    setImage1(null);
    setImage2(null);
    setImage1Preview(null);
    setImage2Preview(null);
  };

  const handleEditFuncSelect = (id: string, requiresTwo?: boolean) => {
    setActiveEditFunc(id as EditFunction);
    setShowTwoImagesView(!!requiresTwo);
  };

  const generateImage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      let imageUrlResult: string;
      if (mode === 'create') {
        if (!prompt) {
          throw new Error('Por favor, descreva sua ideia.');
        }
        imageUrlResult = await generateImageFromPrompt(prompt, activeCreateFunc, aspectRatio);
      } else {
        if (showTwoImagesView) { // Compose mode
          if (!image1 || !image2) {
            throw new Error('Por favor, envie duas imagens para unir.');
          }
          imageUrlResult = await composeImages(prompt, image1, image2);
        } else { // Other edit modes
          if (!image1) {
            throw new Error('Por favor, envie uma imagem para editar.');
          }
          imageUrlResult = await editImage(prompt, image1, activeEditFunc);
        }
      }
      setGeneratedImageUrl(imageUrlResult);
      if (window.innerWidth < 768) {
          setIsModalOpen(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [mode, prompt, activeCreateFunc, activeEditFunc, image1, image2, showTwoImagesView, aspectRatio]);
  
  const editCurrentImage = () => {
    if (generatedImageUrl) {
      // Simulate loading the generated image into the editor
      fetch(generatedImageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "edited_image.png", { type: blob.type });
          setImage1(file);
          setImage1Preview(generatedImageUrl);
          setMode('edit');
          setActiveEditFunc('add-remove');
          setShowTwoImagesView(false);
          setGeneratedImageUrl(null);
          if (isModalOpen) setIsModalOpen(false);
          window.scrollTo(0,0);
        });
    }
  };

  const downloadImage = () => {
    if (generatedImageUrl) {
        const link = document.createElement('a');
        link.href = generatedImageUrl;
        link.download = `ai_image_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="container min-h-screen max-w-screen-2xl mx-auto p-4 flex flex-col md:flex-row gap-4">
      <LeftPanel
        mode={mode}
        prompt={prompt}
        setPrompt={setPrompt}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        handleModeChange={handleModeChange}
        activeCreateFunc={activeCreateFunc}
        setActiveCreateFunc={setActiveCreateFunc}
        activeEditFunc={activeEditFunc}
        handleEditFuncSelect={handleEditFuncSelect}
        showTwoImagesView={showTwoImagesView}
        setShowTwoImagesView={setShowTwoImagesView}
        image1Preview={image1Preview}
        image2Preview={image2Preview}
        onImage1Change={(e) => handleImageUpload(e.target as HTMLInputElement, setImage1Preview, setImage1)}
        onImage2Change={(e) => handleImageUpload(e.target as HTMLInputElement, setImage2Preview, setImage2)}
        generateImage={generateImage}
        isLoading={isLoading}
        error={error}
      />
      <RightPanel 
        generatedImageUrl={generatedImageUrl}
        isLoading={isLoading}
        editCurrentImage={editCurrentImage}
        downloadImage={downloadImage}
      />
      <MobileModal 
        isModalOpen={isModalOpen}
        generatedImageUrl={generatedImageUrl}
        editCurrentImage={editCurrentImage}
        setIsModalOpen={setIsModalOpen}
        setGeneratedImageUrl={setGeneratedImageUrl}
        downloadImage={downloadImage}
      />
    </div>
  );
};

export default App;
