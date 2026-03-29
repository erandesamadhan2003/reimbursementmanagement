import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUser";
import { useRules } from "@/hooks/useRules";
import { toast } from "@/components/ui/Toast";
import {
  Building2,
  ShieldCheck,
  Users,
  UserPlus,
  Workflow,
  Mail,
  Globe2,
  Briefcase,
} from "lucide-react";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  role: "employee",
  manager_id: "",
  is_manager_approver: false,
};

const conditionalLabels = {
  none: "Sequential only",
  percentage: "Percentage approval",
  specific: "Specific approver override",
  hybrid: "Hybrid conditional rule",
};

export const Settings = () => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const { users, managers, createUser, loading: usersLoading } = useUsers(isAdmin);
  const { rules, loading: rulesLoading } = useRules(isAdmin);

  const [formData, setFormData] = useState(initialForm);
  const [savingUser, setSavingUser] = useState(false);

  const roleCapabilities = useMemo(() => {
    if (isAdmin) {
      return [
        "Create employees and managers",
        "Assign reporting relationships",
        "Configure approval rules and overrides",
        "Review company-wide reimbursement behavior",
      ];
    }

    if (isManager) {
      return [
        "Review requests awaiting your approval",
        "Approve or reject with comments",
        "View team reimbursement activity",
        "Forward flow to the next approver by decision",
      ];
    }

    return [
      "Submit reimbursement requests",
      "Track personal approval status",
      "Review expense history and outcomes",
      "Use OCR to auto-generate receipt details",
    ];
  }, [isAdmin, isEmployee, isManager]);

  const activeRules = Array.isArray(rules) ? rules : [];
  const activeUsers = Array.isArray(users) ? users : [];

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Name, email, and password are required.");
      return;
    }

    if (formData.role === "employee" && !formData.manager_id) {
      toast.error("Assign a manager for the employee.");
      return;
    }

    setSavingUser(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        is_manager_approver: formData.is_manager_approver,
      };

      if (formData.role === "employee" && formData.manager_id) {
        payload.manager_id = formData.manager_id;
      }

      await createUser(payload);
      toast.success("Team member created successfully.");
      setFormData(initialForm);
    } catch (error) {
      toast.error(error?.message || "Failed to create team member.");
    } finally {
      setSavingUser(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.85fr)]">
        <div className="glass-card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Settings</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
            Manage your workspace, approval policy, and team structure.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            This settings area maps to the reimbursement workflow: company context, role permissions,
            manager relationships, and the approval rules that drive multi-level reimbursement decisions.
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Current role</p>
              <p className="mt-2 text-2xl font-bold capitalize text-slate-950">{user?.role || "User"}</p>
              <p className="mt-2 text-sm text-slate-500">
                Company: {user?.company?.name || "Workspace company"} · Currency: {user?.company?.currency || "Default currency"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-teal-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Workspace profile</h2>
              <p className="text-sm text-slate-500">Basic company and account identity used by the reimbursement engine.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">Full name</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{user?.fullName || "Not available"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">Email</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{user?.email || "Not available"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Building2 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">Company</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{user?.company?.name || "Not available"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Globe2 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">Currency</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{user?.company?.currency || "Not available"}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-teal-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Role permissions</h2>
              <p className="text-sm text-slate-500">What your current role can control in the reimbursement workflow.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {roleCapabilities.map((capability) => (
              <div key={capability} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                {capability}
              </div>
            ))}
          </div>
        </div>
      </section>

      {isAdmin && (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Create team member</h2>
                  <p className="text-sm text-slate-500">Add employees or managers and connect them to the correct approval path.</p>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                  <input
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                    placeholder="name@company.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                    placeholder="Temporary password"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Manager</label>
                  <select
                    value={formData.manager_id}
                    onChange={(e) => updateField("manager_id", e.target.value)}
                    disabled={formData.role !== "employee"}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:bg-slate-50"
                  >
                    <option value="">Select manager</option>
                    {managers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_manager_approver}
                    onChange={(e) => updateField("is_manager_approver", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  Require the employee's manager as an approver in the approval chain
                </label>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingUser || usersLoading}
                    className="rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-800 disabled:bg-teal-300"
                  >
                    {savingUser ? "Creating..." : "Create team member"}
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-teal-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Team structure</h2>
                  <p className="text-sm text-slate-500">Current users available in the company reimbursement flow.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {activeUsers.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No users found yet.
                  </div>
                ) : (
                  activeUsers.map((member) => (
                    <div key={member._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <div>
                        <p className="font-semibold text-slate-900">{member.fullName}</p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize text-slate-800">{member.role}</p>
                        <p className="text-xs text-slate-500">
                          {member.is_manager_approver ? "Manager approver enabled" : "Standard approval path"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Workflow className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Approval rules</h2>
                <p className="text-sm text-slate-500">Configured rule logic for sequential and conditional approvals.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {rulesLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Loading approval rules...
                </div>
              ) : activeRules.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No approval rules configured yet.
                </div>
              ) : (
                activeRules.map((rule) => (
                  <div key={rule._id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{rule.name || "Approval rule"}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {rule.category ? `${rule.category} · ` : ""}
                          {rule.amount_min ? `From ${rule.amount_min}` : "Any amount"}
                          {rule.amount_max ? ` to ${rule.amount_max}` : "+"}
                        </p>
                      </div>
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                        {conditionalLabels[rule.conditional_type] || "Configured rule"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {(rule.steps || []).length > 0 ? (
                        rule.steps.map((step, index) => (
                          <div key={index} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                            Step {step.order ?? index + 1}: {step.label || "Approver step"}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
                          No explicit steps defined.
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
