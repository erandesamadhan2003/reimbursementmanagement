import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { OCRUpload } from "@/components/OCRUpload";
import { toast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  FileText,
  Tag,
  DollarSign,
  Calendar,
  AlignLeft,
  Send,
} from "lucide-react";

const categories = [
  "Travel",
  "Meals",
  "Office Supplies",
  "Transportation",
  "Accommodation",
  "Software",
  "Training",
  "Communication",
  "Miscellaneous",
];

export const SubmitExpense = () => {
  const navigate = useNavigate();
  const { submit, scanOcr, ocrData, ocrLoading, loading, clearOcr } = useExpenses({ autoFetch: false });

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [errors, setErrors] = useState({});

  // Auto-fill from OCR
  useEffect(() => {
    if (ocrData) {
      setFormData((prev) => ({
        ...prev,
        amount: ocrData.amount ? String(ocrData.amount) : prev.amount,
        date: ocrData.date || prev.date,
        title: ocrData.vendor || prev.title,
        category: ocrData.category
          ? categories.find((c) => c.toLowerCase() === ocrData.category.toLowerCase()) || prev.category
          : prev.category,
        description: ocrData.description || prev.description,
      }));
    }
  }, [ocrData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category) newErrors.category = "Select a category";
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "Enter a valid amount";
    if (!formData.date) newErrors.date = "Select a date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await submit({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success("Expense submitted successfully!");
      clearOcr();
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.message || "Failed to submit expense");
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-lg hover:bg-beige-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-teal-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Submit Expense</h1>
          <p className="text-sm text-teal-500">Fill in the details or scan a receipt</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-beige-200 p-6 space-y-5 animate-slide-up">
            {/* Title */}
            <div>
              <label htmlFor="expense-title" className="block text-sm font-medium text-teal-800 mb-1.5">
                Title *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                <input
                  id="expense-title"
                  type="text"
                  placeholder="e.g., Client dinner, Flight ticket"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.title ? "border-red-300" : "border-beige-200"} bg-beige-50/50 text-sm text-teal-900 placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all`}
                />
              </div>
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="expense-category" className="block text-sm font-medium text-teal-800 mb-1.5">
                Category *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                <select
                  id="expense-category"
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.category ? "border-red-300" : "border-beige-200"} bg-beige-50/50 text-sm text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all appearance-none cursor-pointer`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>

            {/* Amount & Date row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expense-amount" className="block text-sm font-medium text-teal-800 mb-1.5">
                  Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                  <input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.amount ? "border-red-300" : "border-beige-200"} bg-beige-50/50 text-sm text-teal-900 placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all`}
                  />
                </div>
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label htmlFor="expense-date" className="block text-sm font-medium text-teal-800 mb-1.5">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                  <input
                    id="expense-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.date ? "border-red-300" : "border-beige-200"} bg-beige-50/50 text-sm text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all`}
                  />
                </div>
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="expense-description" className="block text-sm font-medium text-teal-800 mb-1.5">
                Description
              </label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-teal-400" />
                <textarea
                  id="expense-description"
                  placeholder="Additional details about this expense..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-beige-200 bg-beige-50/50 text-sm text-teal-900 placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Expense
                </>
              )}
            </button>
          </form>
        </div>

        {/* OCR Upload */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-beige-200 p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h3 className="text-sm font-bold text-teal-900 mb-3">Scan Receipt</h3>
            <p className="text-xs text-teal-500 mb-4">Upload a receipt image to auto-fill fields</p>
            <OCRUpload
              onScan={scanOcr}
              ocrLoading={ocrLoading}
              ocrData={ocrData}
              onClear={clearOcr}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
