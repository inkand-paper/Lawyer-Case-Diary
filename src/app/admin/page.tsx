"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  ShieldAlert, 
  Search, 
  Activity, 
  Database, 
  Clock,
  CheckCircle2,
  X,
  Zap,
  Star,
  Crown,
  ArrowLeft,
  Loader2,
  Settings2,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@/lib/types";

// Simplified plans, with Premium at the top per request
const PLANS = [
  { id: "ULTIMATE", name: "Premium", icon: Crown, color: "text-[var(--accent)]" },
  { id: "EXECUTIVE", name: "Pro", icon: Star, color: "text-blue-500" },
  { id: "ESSENTIAL", name: "Basic", icon: Zap, color: "text-zinc-500" }
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const router = useRouter();

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(result => {
        if (result.success) setUsers(result.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Sync failed:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(res => {
        if (!res.success || res.data.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        fetchUsers();
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleUpdatePlan = async (userId: string, plan: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      if (res.ok) {
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to update plan:", err);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? All their cases and data will be lost.")) return;
    
    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: "var(--muted)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans p-4 sm:p-8" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col gap-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 font-bold text-sm w-max hover:opacity-80 transition-all" style={{ color: "var(--muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Go Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-12" style={{ borderColor: "var(--border)" }}>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none">Admin Panel</h1>
              <p className="font-medium text-lg" style={{ color: "var(--muted)" }}>Manage all users in the system.</p>
            </div>
            
            <div className="flex items-center gap-6 p-6 rounded-[2rem] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="text-right">
                <p className="text-2xl font-black">{users.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Total Users</p>
              </div>
              <div className="h-8 w-[1px]" style={{ background: "var(--border)" }} />
              <div className="text-right">
                <p className="text-2xl font-black">
                  {users.reduce((acc, u) => acc + (u._count?.cases || 0), 0)}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Total Cases</p>
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM STATUS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
           <div className="border p-6 rounded-3xl flex items-center gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>System Health</p>
                <p className="text-sm font-bold uppercase">Optimal</p>
              </div>
           </div>
           <div className="border p-6 rounded-3xl flex items-center gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <Database className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Database</p>
                <p className="text-sm font-bold uppercase">Secured</p>
              </div>
           </div>
           <div className="border p-6 rounded-3xl flex items-center gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Uptime</p>
                <p className="text-sm font-bold uppercase">99.9%</p>
              </div>
           </div>
           <div className="border p-6 rounded-3xl flex items-center gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Security</p>
                <p className="text-sm font-bold uppercase">Active</p>
              </div>
           </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" style={{ color: "var(--muted)" }} />
          <input 
            type="text" 
            placeholder="Search User (Name or Email)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-[2rem] py-5 pl-14 pr-8 text-sm w-full focus:outline-none transition-all font-medium"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        {/* USERS TABLE */}
        <div className="border rounded-[2.5rem] overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>User Info</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Status</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Plan</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Role</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: "var(--muted)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors group border-b last:border-b-0 hover:bg-[var(--surface-2)]" style={{ borderColor: "var(--border)" }}>
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0" style={{ background: "var(--foreground)", color: "var(--background)" }}>
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-base font-bold tracking-tight">{user.name}</p>
                          <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      {user.emailVerified ? (
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--accent)" }}>
                          <div className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--muted)" }}>
                          <div className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--muted)" }} />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
                          {PLANS.find(p => p.id === (user.plan || 'ESSENTIAL'))?.name || "Basic"}
                        </span>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md" style={user.role === "ADMIN" ? { background: "var(--foreground)", color: "var(--background)" } : { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                        {user.role === "ADMIN" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-3 rounded-2xl transition-all border hover:opacity-80"
                          style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                          title="Manage User"
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingId === user.id}
                          className="p-3 rounded-2xl transition-all border hover:border-red-500 hover:text-red-500"
                          style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--muted)" }}
                          title="Delete Permanently"
                        >
                          {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <Users className="w-12 h-12 mx-auto" style={{ color: "var(--muted)" }} />
              <div className="space-y-1">
                <p className="text-lg font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>No Users Found</p>
                <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>Try a different search term.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MANAGE USER MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md border rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
              style={{ background: "var(--background)", borderColor: "var(--border)" }}
            >
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: "var(--foreground)", color: "var(--background)" }}>
                    <Settings2 className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-2 rounded-full hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <X className="w-5 h-5" style={{ color: "var(--muted)" }} />
                  </button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight uppercase">Manage User</h2>
                  <p className="text-sm font-bold" style={{ color: "var(--muted)" }}>For {selectedUser.name}</p>
                </div>

                <div className="space-y-6">
                  {/* Plan Selection */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Subscription Plan</h3>
                    {PLANS.map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => handleUpdatePlan(selectedUser.id, plan.id)}
                        className="w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between"
                        style={selectedUser.plan === plan.id 
                          ? { background: "var(--foreground)", borderColor: "var(--foreground)", color: "var(--background)" } 
                          : { background: "var(--surface)", borderColor: "var(--border)" }
                        }
                      >
                        <div className="flex items-center gap-4">
                          <plan.icon className="w-5 h-5" />
                          <div>
                            <p className="text-sm font-black uppercase tracking-widest">{plan.name}</p>
                          </div>
                        </div>
                        {selectedUser.plan === plan.id && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                    <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>System Role</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleUpdateRole(selectedUser.id, "LAWYER")}
                        className="p-4 rounded-2xl border text-center transition-all font-black uppercase tracking-widest text-sm"
                        style={selectedUser.role === "LAWYER" || !selectedUser.role
                          ? { background: "var(--foreground)", borderColor: "var(--foreground)", color: "var(--background)" }
                          : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }
                        }
                      >
                        User
                      </button>
                      <button
                        onClick={() => handleUpdateRole(selectedUser.id, "ADMIN")}
                        className="p-4 rounded-2xl border text-center transition-all font-black uppercase tracking-widest text-sm"
                        style={selectedUser.role === "ADMIN"
                          ? { background: "var(--foreground)", borderColor: "var(--foreground)", color: "var(--background)" }
                          : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }
                        }
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
