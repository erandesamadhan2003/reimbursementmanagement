import { useState } from "react";
import { useRules } from "@/hooks/useRules";
import { useUsers } from "@/hooks/useUser";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "@/components/ui/Toast";
import {
  Settings, Plus, Trash2, PencilLine, ChevronDown, X, Check,
  GitBranch, ArrowDownUp, AlertTriangle, GripVertical, DollarSign,
} from "lucide-react";

const CONDITIONAL_TYPES = [
  { value: "none", label: "None — All steps must approve" },
  { value: "percentage", label: "Percentage — X% of approvers approve" },
  { value: "specific", label: "Specific — Key approver approves" },
  { value: "hybrid", label: "Hybrid — X% OR key approver" },
];

const CATEGORIES = ["all", "travel", "food", "accommodation", "utilities", "other"];

const conditionalColor = {
  none: "bg-teal-50 text-teal-600 border-teal-100",
  percentage: "bg-amber-50 text-amber-600 border-amber-100",
  specific: "bg-peach-300/20 text-peach-500 border-peach-400/20",
  hybrid: "bg-purple-50 text-purple-600 border-purple-100",
};

const RuleModal = ({ rule, users, onClose, onSave, loading }) => {
  const isEdit = !!rule;
  const [form, setForm] = useState({
    name: rule?.name || "",
    amount_min: rule?.amount_min ?? 0,
    amount_max: rule?.amount_max ?? "",
    category: rule?.category || null,
    conditional_type: rule?.conditional_type || "none",
    conditional_pct: rule?.conditional_pct || 60,
    conditional_approver_id: rule?.conditional_approver_id || "",
    steps: rule?.steps?.map((s) => ({ ...s, approver_id: s.approver_id?._id || s.approver_id })) || [
      { order: 0, approver_id: "", label: "Approver 1" }
    ],
  });
  const [errors, setErrors] = useState({});

  const addStep = () => {
    setForm({
      ...form,
      steps: [...form.steps, { order: form.steps.length, approver_id: "", label: `Approver ${form.steps.length + 1}` }],
    });
  };

  const removeStep = (idx) => {
    const steps = form.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i }));
    setForm({ ...form, steps });
  };

  const updateStep = (idx, field, val) => {
    const steps = form.steps.map((s, i) => i === idx ? { ...s, [field]: val } : s);
    setForm({ ...form, steps });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.amount_min === "" || form.amount_min < 0) e.amount_min = "Min amount required";
    if (form.steps.some((s) => !s.approver_id)) e.steps = "All steps need an approver";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      amount_min: parseFloat(form.amount_min),
      amount_max: form.amount_max !== "" ? parseFloat(form.amount_max) : null,
      category: form.category === "all" || !form.category ? null : form.category,
      conditional_pct: ["percentage", "hybrid"].includes(form.conditional_type)
        ? parseFloat(form.conditional_pct) : undefined,
      conditional_approver_id: ["specific", "hybrid"].includes(form.conditional_type)
        ? form.conditional_approver_id || null : null,
    };
    onSave(payload);
  };

  const approvers = users.filter((u) => u.role !== "employee");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl animate-scale-in my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-beige-100">
          <div>
            <h2 className="text-xl font-bold text-teal-900">{isEdit ? "Edit Rule" : "New Approval Rule"}</h2>
            <p className="text-sm text-teal-500 mt-0.5">Define when and who approves expenses</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-beige-100 transition-colors">
            <X className="w-5 h-5 text-teal-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">Rule Name</label>
            <input
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? "border-red-300 bg-red-50" : "border-beige-200 bg-beige-50"} text-teal-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. High Value Travel"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">Min Amount (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                <input
                  type="number"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.amount_min ? "border-red-300 bg-red-50" : "border-beige-200 bg-beige-50"} text-teal-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300`}
                  value={form.amount_min}
                  onChange={(e) => setForm({ ...form, amount_min: e.target.value })}
                  placeholder="0"
                />
              </div>
              {errors.amount_min && <p className="text-xs text-red-500 mt-1">{errors.amount_min}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">
                Max Amount (₹) <span className="font-normal text-teal-400 normal-case">— blank = no limit</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                <input
                  type="number"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-beige-200 bg-beige-50 text-teal-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  value={form.amount_max}
                  onChange={(e) => setForm({ ...form, amount_max: e.target.value })}
                  placeholder="No limit"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, category: c })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${(form.category === c || (!form.category && c === "all"))
                    ? "bg-teal-500 text-white border-teal-500"
                    : "bg-beige-50 text-teal-600 border-beige-200 hover:bg-beige-100"
                    }`}
                >
                  {c === "all" ? "All Categories" : c}
                </button>
              ))}
            </div>
          </div>

          {/* Approval Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Approval Steps</label>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1 text-xs text-teal-500 hover:text-teal-700 font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>
            <div className="space-y-2">
              {form.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-beige-50 rounded-xl p-3 border border-beige-100">
                  <GripVertical className="w-4 h-4 text-teal-300 shrink-0" />
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-teal-100 rounded-lg">
                    <span className="text-xs font-bold text-teal-700">Step {idx + 1}</span>
                  </div>
                  <input
                    className="flex-1 px-3 py-1.5 rounded-lg border border-beige-200 bg-white text-xs text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    value={step.label}
                    onChange={(e) => updateStep(idx, "label", e.target.value)}
                    placeholder="Label (e.g. Manager, CFO)"
                  />
                  <div className="relative flex-1">
                    <select
                      className="w-full px-3 py-1.5 rounded-lg border border-beige-200 bg-white text-xs text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-200 appearance-none pr-7"
                      value={step.approver_id}
                      onChange={(e) => updateStep(idx, "approver_id", e.target.value)}
                    >
                      <option value="">Select approver…</option>
                      {approvers.map((u) => (
                        <option key={u._id} value={u._id}>{u.fullName} ({u.role})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-teal-400 pointer-events-none" />
                  </div>
                  {form.steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(idx)} className="p-1 rounded-lg hover:bg-red-100 text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {errors.steps && <p className="text-xs text-red-500 mt-1">{errors.steps}</p>}
            </div>
          </div>

          {/* Conditional Logic */}
          <div>
            <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">Conditional Logic</label>
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-beige-200 bg-beige-50 text-teal-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 appearance-none pr-10"
                value={form.conditional_type}
                onChange={(e) => setForm({ ...form, conditional_type: e.target.value })}
              >
                {CONDITIONAL_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400 pointer-events-none" />
            </div>

            {["percentage", "hybrid"].includes(form.conditional_type) && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">
                  Approval Threshold (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="w-full px-4 py-2.5 rounded-xl border border-beige-200 bg-beige-50 text-teal-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  value={form.conditional_pct}
                  onChange={(e) => setForm({ ...form, conditional_pct: e.target.value })}
                />
              </div>
            )}

            {["specific", "hybrid"].includes(form.conditional_type) && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">
                  Key Approver
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-beige-200 bg-beige-50 text-teal-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 appearance-none pr-10"
                    value={form.conditional_approver_id}
                    onChange={(e) => setForm({ ...form, conditional_approver_id: e.target.value })}
                  >
                    <option value="">Select key approver…</option>
                    {approvers.map((u) => (
                      <option key={u._id} value={u._id}>{u.fullName} ({u.role})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-beige-200 text-sm font-semibold text-teal-600 hover:bg-beige-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white text-sm font-semibold hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
              {loading ? <LoadingSpinner size="sm" /> : <Check className="w-4 h-4" />}
              {isEdit ? "Save Changes" : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AdminRules = () => {
  const { rules, loading, createRule, updateRule, deleteRule, refetch } = useRules();
  const { users } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editRule?._id) {
        await updateRule(editRule._id, data);
        toast.success("Rule updated");
      } else {
        await createRule(data);
        toast.success("Rule created");
      }
      setShowModal(false);
      setEditRule(null);
      refetch();
    } catch (err) {
      toast.error(err?.message || "Failed to save rule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteRule(deleteTarget._id);
      toast.success("Rule deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || "Failed to delete rule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Approval Rules</h1>
          <p className="text-sm text-teal-500 mt-1">Configure multi-step expense approval chains</p>
        </div>
        <button
          onClick={() => { setEditRule(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          New Rule
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex gap-3">
        <GitBranch className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
        <div className="text-sm text-teal-700">
          <p className="font-semibold">How rules work:</p>
          <p className="mt-0.5 text-teal-600">Rules match expenses by amount range and category. The first matching rule's approval chain is triggered. If no rule matches, the expense is auto-approved.</p>
        </div>
      </div>

      {/* Rules List */}
      {loading ? (
        <LoadingSpinner message="Loading rules..." />
      ) : rules.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3 text-teal-400 bg-white/50 rounded-2xl border border-beige-100">
          <Settings className="w-10 h-10 opacity-40" />
          <p className="text-sm font-medium">No approval rules yet</p>
          <button onClick={() => setShowModal(true)} className="text-xs text-teal-500 hover:text-teal-700 font-semibold underline underline-offset-2">
            Create your first rule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, i) => (
            <div
              key={rule._id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5 hover:shadow-md transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-teal-900">{rule.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${conditionalColor[rule.conditional_type] || conditionalColor.none}`}>
                      {rule.conditional_type}
                    </span>
                    {rule.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-beige-100 text-teal-600 border border-beige-200 capitalize">
                        {rule.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    <ArrowDownUp className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-sm text-teal-600">
                      ₹{rule.amount_min?.toLocaleString()} → {rule.amount_max ? `₹${rule.amount_max.toLocaleString()}` : "No limit"}
                    </span>
                  </div>

                  {/* Steps chain */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {rule.steps?.map((step, si) => (
                      <div key={si} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-xs font-semibold text-teal-700">
                          <span className="w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center text-[9px] font-bold">{si + 1}</span>
                          {step.label || step.approver_id?.fullName || "Approver"}
                        </div>
                        {si < rule.steps.length - 1 && <span className="text-teal-300 text-xs">→</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => { setEditRule(rule); setShowModal(true); }}
                    className="p-2 rounded-xl text-teal-500 bg-teal-50 hover:bg-teal-100 border border-teal-100 transition-all"
                    title="Edit rule"
                  >
                    <PencilLine className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(rule)}
                    className="p-2 rounded-xl text-red-400 bg-red-50 hover:bg-red-100 border border-red-100 transition-all"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <RuleModal
          rule={editRule}
          users={users}
          onClose={() => { setShowModal(false); setEditRule(null); }}
          onSave={handleSave}
          loading={saving}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-scale-in">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-teal-900 text-center">Delete Rule?</h2>
            <p className="text-sm text-teal-500 text-center mt-2">
              <strong>{deleteTarget.name}</strong> will be permanently deleted. In-flight expenses keep their original rule.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-beige-200 text-sm font-semibold text-teal-600 hover:bg-beige-50">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                {saving ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
