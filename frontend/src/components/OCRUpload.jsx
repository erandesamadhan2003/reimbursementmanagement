import { useState, useRef } from "react";
import { Upload, X, Image, Loader2 } from "lucide-react";

export const OCRUpload = ({ onScan, ocrLoading, ocrData, onClear }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) {
      handleFile(f);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    onClear?.();
  };

  const handleScan = () => {
    if (file && onScan) {
      onScan(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8
            flex flex-col items-center justify-center gap-3
            cursor-pointer transition-all duration-300
            ${dragOver
              ? "border-teal-500 bg-teal-50 scale-[1.01]"
              : "border-beige-300 bg-beige-50/50 hover:border-teal-400 hover:bg-teal-50/30"
            }
          `}
          role="button"
          tabIndex={0}
          aria-label="Upload receipt image"
          onKeyDown={(e) => { if (e.key === "Enter") inputRef.current?.click(); }}
        >
          <div className={`p-3 rounded-full ${dragOver ? "bg-teal-100" : "bg-beige-100"} transition-colors`}>
            <Upload className={`w-6 h-6 ${dragOver ? "text-teal-500" : "text-teal-400"}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-teal-800">
              Drag & drop your receipt here
            </p>
            <p className="text-xs text-teal-500 mt-1">
              or click to browse • JPEG, PNG, WebP (max 10MB)
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-beige-200 bg-white animate-scale-in">
          {/* Preview */}
          <div className="relative aspect-video bg-beige-50 flex items-center justify-center">
            <img
              src={preview}
              alt="Receipt preview"
              className="max-h-full max-w-full object-contain"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow-sm hover:bg-red-50 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>

          {/* File info */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-beige-100">
            <div className="flex items-center gap-2 text-sm text-teal-700">
              <Image className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{file?.name}</span>
              <span className="text-teal-400">
                ({(file?.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              onClick={handleScan}
              disabled={ocrLoading}
              className="px-4 py-1.5 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 rounded-lg transition-all flex items-center gap-2"
            >
              {ocrLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Scan Receipt"
              )}
            </button>
          </div>
        </div>
      )}

      {/* OCR Loading State */}
      {ocrLoading && (
        <div className="flex items-center gap-3 px-4 py-3 bg-teal-50 rounded-lg border border-teal-100 animate-fade-in">
          <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
          <div>
            <p className="text-sm font-medium text-teal-800">Processing receipt...</p>
            <p className="text-xs text-teal-500">Extracting information with OCR</p>
          </div>
        </div>
      )}

      {/* OCR Results */}
      {ocrData && !ocrLoading && (
        <div className="p-4 bg-status-approved-bg rounded-lg border border-green-200 animate-slide-up">
          <p className="text-sm font-semibold text-green-800 mb-2">
            ✓ Receipt scanned successfully
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {ocrData.amount && (
              <div>
                <span className="text-green-600">Amount:</span>{" "}
                <span className="font-medium text-green-800">
                  {ocrData.currency || "$"}{ocrData.amount}
                </span>
              </div>
            )}
            {ocrData.date && (
              <div>
                <span className="text-green-600">Date:</span>{" "}
                <span className="font-medium text-green-800">{ocrData.date}</span>
              </div>
            )}
            {ocrData.vendor && (
              <div>
                <span className="text-green-600">Vendor:</span>{" "}
                <span className="font-medium text-green-800">{ocrData.vendor}</span>
              </div>
            )}
            {ocrData.category && (
              <div>
                <span className="text-green-600">Category:</span>{" "}
                <span className="font-medium text-green-800">{ocrData.category}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
