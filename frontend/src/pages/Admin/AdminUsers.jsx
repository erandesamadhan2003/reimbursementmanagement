import { useState } from "react";
import { useUsers } from "@/hooks/useUser";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "@/components/ui/Toast";
import {
  Users, Plus, Search, PencilLine, Trash2, ShieldCheck,
  UserCheck, UserX, Mail, ChevronDown, X, Check, AlertTriangle,
} from "lucide-react";

const ROLES = ["employee", "manager"];

const roleMeta = {
  admin: { label: "Admin", color: "bg-peach-400/20 text-peach-500 border-peach-400/30" },
  manager: { label: "Manager", color: "bg-teal-100 text-teal-600 border-teal-200" },
  employee: { label: "Employee", color: "bg-beige-100 text-teal-700 border-beige-200" },
};

const RoleBadge = ({ role }) => {
  const meta = roleMeta[role] || roleMeta.employee;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.color}`}>
      {meta.label}
    </span>
  );
};

const UserModal = ({ user, managers, onClose, onSave, loading }) => {
  const isEdit = !!user;
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "employee",
    manager_id: user?.manager_id?._id || user?.manager_id || "",
    is_manager_approver: user?.is_manager_approver || false,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!isEdit && !form.password) e.password = "Password is required for new users";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    if (payload.role !== "employee") {
      payload.manager_id = null;
      payload.is_manager_approver = false;
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-beige-100">
          <div>
            <h2 className="text-xl font-bold text-teal-900">{isEdit ? "Edit User" : "Add New User"}</h2>
            <p className="text-sm text-teal-500 mt-0.5">
              {isEdit ? "Update user details or role" : "Create a user in your company"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-beige-100 transition-colors">
            <X className="w-5 h-5 text-teal-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">
              Full Name
            </label>
            <input
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.fullName ? "border-red-300 bg-red-50" : "border-beige-200 bg-beige-50"} text-teal-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all`}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Priya Sharma"
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? "border-red-300 bg-red-50" : "border-beige-200 bg-beige-50"} text-teal-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="priya@company.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">
              Password {isEdit && <span className="font-normal text-teal-400 normal-case">(leave blank to keep unchanged)</span>}
            </label>
            <input
              type="password"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.password ? "border-red-300 bg-red-50" : "border-beige-200 bg-beige-50"} text-teal-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all`}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={isEdit ? "••••••••" : "Create a password"}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">
              Role
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-beige-200 bg-beige-50 text-teal-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 appearance-none pr-10 transition-all"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400 pointer-events-none" />
            </div>
          </div>

          {/* Manager (only for employees) */}
          {form.role === "employee" && (
            <>
              <div>
                <label className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1.5 block">
                  Assigned Manager <span className="font-normal text-teal-400 normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-beige-200 bg-beige-50 text-teal-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 appearance-none pr-10 transition-all"
                    value={form.manager_id}
                    onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                  >
                    <option value="">No manager assigned</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>{m.fullName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400 pointer-events-none" />
                </div>
              </div>

              {/* Manager Approver toggle */}
              <div
                className="flex items-center justify-between p-3 rounded-xl bg-beige-50 border border-beige-200 cursor-pointer hover:bg-beige-100 transition-colors"
                onClick={() => setForm({ ...form, is_manager_approver: !form.is_manager_approver })}
              >
                <div>
                  <p className="text-sm font-semibold text-teal-900">Manager Pre-Approval</p>
                  <p className="text-xs text-teal-500">Manager must approve before rule steps begin</p>
                </div>
                <div className={`w-10 h-5.5 rounded-full flex items-center transition-colors ${form.is_manager_approver ? "bg-teal-500" : "bg-teal-200"}`}>
                  <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all ${form.is_manager_approver ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-beige-200 text-sm font-semibold text-teal-600 hover:bg-beige-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white text-sm font-semibold hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Check className="w-4 h-4" />}
              {isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirm = ({ user, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/40 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-scale-in">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-teal-900 text-center">Deactivate User?</h2>
      <p className="text-sm text-teal-500 text-center mt-2">
        <strong>{user.fullName}</strong> will be soft-deleted. Their data is preserved but they'll lose access.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-beige-200 text-sm font-semibold text-teal-600 hover:bg-beige-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
          Deactivate
        </button>
      </div>
    </div>
  </div>
);

export const AdminUsers = () => {
  const { users, managers, loading, error, createUser, updateUser, deleteUser, refetch } = useUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalUser, setModalUser] = useState(null); // null=closed, {}=create, obj=edit
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtered = users.filter((u) => {
    const matchesSearch = u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreate = () => { setModalUser({}); setShowModal(true); };
  const handleEdit = (u) => { setModalUser(u); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setModalUser(null); };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (modalUser?._id) {
        await updateUser(modalUser._id, data);
        toast.success("User updated successfully");
      } else {
        await createUser(data);
        toast.success("User created successfully");
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteUser(deleteTarget._id);
      toast.success(`${deleteTarget.fullName} deactivated`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || "Failed to deactivate user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">User Management</h1>
          <p className="text-sm text-teal-500 mt-1">{users.length} team members in your company</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-beige-200 rounded-xl text-sm text-teal-900 placeholder:text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-beige-100 rounded-xl p-1">
          {["all", "admin", "manager", "employee"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${roleFilter === r ? "bg-white text-teal-900 shadow-sm" : "text-teal-500 hover:text-teal-700"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User Grid */}
      {loading ? (
        <LoadingSpinner message="Loading users..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <div
              key={u._id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-base font-bold shrink-0 shadow-sm">
                  {u.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-teal-900 text-sm truncate">{u.fullName}</h3>
                    <RoleBadge role={u.role} />
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-teal-400 shrink-0" />
                    <p className="text-xs text-teal-500 truncate">{u.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {u.manager_id && (
                  <div className="flex items-center gap-1.5 text-xs text-teal-500">
                    <UserCheck className="w-3.5 h-3.5" />
                    Manager: {u.manager_id?.fullName || "—"}
                  </div>
                )}
                {u.is_manager_approver && (
                  <div className="flex items-center gap-1.5 text-xs text-peach-500">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Manager pre-approval enabled
                  </div>
                )}
                {!u.is_active && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400">
                    <UserX className="w-3.5 h-3.5" />
                    Deactivated
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(u)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 border border-teal-100 transition-all"
                >
                  <PencilLine className="w-3.5 h-3.5" />
                  Edit
                </button>
                {u.role !== "admin" && (
                  <button
                    onClick={() => setDeleteTarget(u)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-16 flex flex-col items-center gap-3 text-teal-400">
              <Users className="w-10 h-10 opacity-40" />
              <p className="text-sm font-medium">No users found</p>
              {search && <p className="text-xs">Try a different search term</p>}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <UserModal
          user={modalUser?._id ? modalUser : null}
          managers={managers}
          onClose={handleCloseModal}
          onSave={handleSave}
          loading={saving}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={saving}
        />
      )}
    </div>
  );
};
