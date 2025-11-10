import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Camera, FolderOpen } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('O arquivo é muito grande. O tamanho máximo é 10MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Compress and fix orientation using browser-image-compression
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: false,
        fileType: 'image/jpeg',
        // This will fix EXIF rotation issues
        initialQuality: 0.8
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const formData = new FormData();
      formData.append('avatar', compressedFile);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro no upload');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = (capture = false) => {
    if (!disabled && fileInputRef.current) {
      // Set capture attribute dynamically
      if (capture) {
        fileInputRef.current.setAttribute('capture', 'camera');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-gray-200"
          />
          {!disabled && onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile-friendly upload options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => openFileDialog(false)}
              disabled={disabled || isUploading}
              className="flex-1"
              data-testid="button-upload-gallery"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              {isUploading ? "Enviando..." : "Galeria"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => openFileDialog(true)}
              disabled={disabled || isUploading}
              className="flex-1"
              data-testid="button-upload-camera"
            >
              <Camera className="w-4 h-4 mr-2" />
              {isUploading ? "Enviando..." : "Câmera"}
            </Button>
          </div>
          
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              disabled={disabled}
              className="text-xs"
            >
              URL
            </Button>
          </div>
          
          {showUrlInput && (
            <Input
              placeholder="https://example.com/avatar.jpg"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="text-sm"
            />
          )}
          
          <div
            className={cn(
              "border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer transition-colors",
              disabled && "cursor-not-allowed opacity-50",
              !disabled && "hover:border-gray-400"
            )}
            onClick={() => openFileDialog(false)}
          >
            <div className="flex flex-col items-center space-y-1">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF até 10MB
              </p>
              <p className="text-xs text-gray-400">
                Orientação corrigida automaticamente
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}