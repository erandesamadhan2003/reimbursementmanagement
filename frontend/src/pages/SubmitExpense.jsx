import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { OCRUpload } from "@/components/OCRUpload";
import { toast } from "@/components/ui/Toast";
import { ArrowLeft, Send } from "lucide-react";

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

  const inputClass = (hasError) =>
    `w-full rounded-2xl border ${hasError ? "border-red-300" : "border-slate-200"} bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10`;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Submit expense</p>
          <h1 className="mt-2 text-[clamp(2.2rem,4vw,4.2rem)] font-extrabold leading-[0.95] text-slate-950">
            Create a new reimbursement request.
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-600">
            Fill in the expense details on the left and optionally scan a receipt on the right to auto-fill fields.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_420px]">
        <div className="page-section p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="expense-title" className="mb-2 block text-sm font-semibold text-slate-700">
                  Title *
                </label>
                <input
                  id="expense-title"
                  type="text"
                  placeholder="Client dinner, flight ticket, hotel stay"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className={inputClass(errors.title)}
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="expense-category" className="mb-2 block text-sm font-semibold text-slate-700">
                  Category *
                </label>
                <select
                  id="expense-category"
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className={`${inputClass(errors.category)} cursor-pointer`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="expense-amount" className="mb-2 block text-sm font-semibold text-slate-700">
                  Amount *
                </label>
                <input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  className={inputClass(errors.amount)}
                />
                {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
              </div>

              <div>
                <label htmlFor="expense-date" className="mb-2 block text-sm font-semibold text-slate-700">
                  Date *
                </label>
                <input
                  id="expense-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className={inputClass(errors.date)}
                />
                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="expense-description" className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  id="expense-description"
                  placeholder="Add supporting detail, attendee names, project codes, or business purpose"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={6}
                  className={`${inputClass(false)} resize-y`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Make sure the title, amount, and date match the receipt before submitting.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-800 disabled:bg-teal-300"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Expense
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="page-section p-6">
            <h2 className="text-2xl font-bold text-slate-950">Receipt scan</h2>
            <p className="mt-2 text-base text-slate-500">
              Upload a receipt image to auto-fill the form details.
            </p>
            <div className="mt-5">
              <OCRUpload
                onScan={scanOcr}
                ocrLoading={ocrLoading}
                ocrData={ocrData}
                onClear={clearOcr}
              />
            </div>
          </div>

          <div className="page-section p-6">
            <h3 className="text-lg font-bold text-slate-950">Tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Use a short, clear title.</li>
              <li>Upload a flat, readable receipt image.</li>
              <li>Add context if the expense might need explanation.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
