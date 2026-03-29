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
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[1.5rem] border-2 border-dashed p-6 transition-all duration-300 sm:p-8
            ${dragOver
              ? "scale-[1.01] border-teal-500 bg-teal-50 shadow-[0_20px_40px_rgba(66,122,118,0.08)]"
              : "border-beige-300 bg-white/65 hover:border-teal-400 hover:bg-teal-50/30"
            }
          `}
          role="button"
          tabIndex={0}
          aria-label="Upload receipt image"
          onKeyDown={(e) => {
            if (e.key === "Enter") inputRef.current?.click();
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,122,118,0.08),transparent_45%)]" />
          <div className={`rounded-full p-3 transition-colors ${dragOver ? "bg-teal-100" : "bg-beige-100"}`}>
            <Upload className={`h-6 w-6 ${dragOver ? "text-teal-500" : "text-teal-400"}`} />
          </div>
          <div className="relative z-10 text-center">
            <p className="text-sm font-medium text-teal-800">
              Drag and drop your receipt here
            </p>
            <p className="mt-1 text-xs text-teal-500">
              or click to browse, JPEG PNG WebP up to 10MB
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
        <div className="page-section relative overflow-hidden animate-scale-in">
          <div className="relative flex aspect-video items-center justify-center bg-beige-50">
            <img
              src={preview}
              alt="Receipt preview"
              className="max-h-full max-w-full object-contain"
            />
            <button
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-red-50"
              aria-label="Remove image"
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>

          <div className="flex flex-col gap-3 border-t border-beige-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex items-center gap-2 text-sm text-teal-700">
              <Image className="h-4 w-4" />
              <span className="truncate">{file?.name}</span>
              <span className="text-teal-400">
                ({(file?.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              onClick={handleScan}
              disabled={ocrLoading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-teal-600 disabled:bg-teal-300 sm:self-auto"
            >
              {ocrLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Scan Receipt"
              )}
            </button>
          </div>
        </div>
      )}

      {ocrLoading && (
        <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
          <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
          <div>
            <p className="text-sm font-medium text-teal-800">Processing receipt...</p>
            <p className="text-xs text-teal-500">Extracting information with OCR</p>
          </div>
        </div>
      )}

      {ocrData && !ocrLoading && (
        <div className="animate-slide-up rounded-xl border border-green-200 bg-status-approved-bg p-4">
          <p className="mb-2 text-sm font-semibold text-green-800">
            Receipt scanned successfully
          </p>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
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
