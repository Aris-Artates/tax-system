"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Mail,
  ShieldCheck,
  UserCircle2,
  Loader2,
  User,
  Phone,
  MapPin,
  Briefcase,
  Calendar as CalendarIcon,
  Settings,
  Bell,
  Shield,
  CheckCircle2,
  ChevronRight,
  UserCheck2,
  Fingerprint,
  AtSign,
  Globe,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type ProfileForm = {
  empID: string;
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  birthdate: string;
  age: string;
  sex: boolean;
  email: string;
  role: string;
  role_id: number;
  status: boolean;
  contactNumber: string;
  officeAddress: string;
  position: string;
  receiveEmailUpdates: boolean;
  receiveSystemAlerts: boolean;
  profilePicture: string;
};

const initialForm: ProfileForm = {
  empID: "",
  username: "",
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  birthdate: "",
  age: "",
  sex: true,
  email: "",
  role: "",
  role_id: 0,
  status: true,
  contactNumber: "",
  officeAddress: "",
  position: "",
  receiveEmailUpdates: true,
  receiveSystemAlerts: true,
  profilePicture: "",
};

type TabType = "personal" | "employment" | "security" | "notifications";

export default function UserProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup for object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();

        if (!sessionData.user?.empID) {
          toast.error("Not authenticated", {
            description: "Please login to view your profile.",
          });
          router.push("/");
          return;
        }

        const detailRes = await fetch(
          `/api/user/detail?empID=${sessionData.user.empID}`,
        );
        const detailData = await detailRes.json();

        if (detailData.user) {
          const u = detailData.user;
          setForm({
            empID: u.empID,
            username: u.username || "",
            firstName: u.firstname || "",
            middleName: u.middlename || "",
            lastName: u.lastname || "",
            suffix: u.suffix || "",
            birthdate: u.birthdate || "",
            age: u.age ? String(u.age) : (u.birthdate ? calculateAge(u.birthdate) : ""),
            sex: u.sex ?? true,
            email: u.email || "",
            role: u.roles?.name || "User",
            role_id: u.role_id,
            status: u.status ?? true,
            contactNumber: u.phone || "",
            officeAddress: u.department || "",
            position: u.position || "",
            receiveEmailUpdates: true,
            receiveSystemAlerts: true,
            profilePicture: u.image_path || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile", {
          description: "An error occurred while fetching your data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", {
        description: "Please select an image file.",
      });
      return;
    }

    // Revoke previous URL if any
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);

    toast.success("Image selected", {
      description: "Visual preview updated. Click 'Save Changes' to upload.",
    });
  };

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return "";
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const updateField = <K extends keyof ProfileForm>(
    field: K,
    value: ProfileForm[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "birthdate") {
        next.age = calculateAge(value as string);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    let currentImagePath = form.profilePicture;

    try {
      // If a new file is selected, upload it first
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/user/profile/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (uploadData.path) {
          currentImagePath = uploadData.path;
          // Also update the form state so it's consistent if the user continues editing
          updateField("profilePicture", currentImagePath);
          setSelectedFile(null); // Clear the selected file after successful upload
        } else {
          throw new Error(uploadData.error || "Upload failed");
        }
      }

      const payload = {
        originalEmpID: form.empID,
        empID: form.empID,
        username: form.username,
        firstname: form.firstName,
        middlename: form.middleName,
        lastname: form.lastName,
        suffix: form.suffix,
        birthdate: form.birthdate,
        age: form.age,
        sex: form.sex,
        email: form.email,
        phone: form.contactNumber,
        department: form.officeAddress,
        position: form.position,
        role_id: form.role_id,
        status: form.status,
        image_path: currentImagePath,
      };

      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated", {
          description: "Your changes have been successfully persisted.",
        });
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Save failed", {
        description: error.message || "An error occurred while saving.",
      });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const profileCompletion = () => {
    const fields: (keyof ProfileForm)[] = [
      "firstName",
      "lastName",
      "email",
      "birthdate",
      "contactNumber",
      "position",
      "profilePicture",
    ];
    const filled = fields.filter((f) => {
      if (f === "profilePicture") return !!form[f] || !!selectedFile;
      return !!form[f];
    }).length;
    return Math.round((filled / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col p-6 animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/user")}
            className="cursor-pointer mb-4 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to User Management
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-lexend text-3xl font-bold text-slate-800 tracking-tight">
              Account Settings
            </h1>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-100 uppercase tracking-wider">
              Official Profile
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="h-10 text-xs font-semibold px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 max-w-7xl">
        {/* Left Sidebar: Profile Summary */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <div className="absolute -inset-1 rounded-full bg-linear-to-tr from-indigo-500 to-emerald-500 opacity-20 blur group-hover:opacity-40 transition duration-500" />
                <div className="relative">
                  {previewUrl || form.profilePicture ? (
                    <img
                      src={previewUrl || form.profilePicture}
                      alt="Profile"
                      className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-2xl transition hover:scale-105"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-slate-50 flex items-center justify-center border-4 border-white shadow-2xl">
                      <UserCircle2 className="h-20 w-20 text-slate-300" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border-4 border-white">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 hover:scale-110 transition-all border-4 border-white"
                    title="Update photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePictureChange}
                  />
                </div>
              </div>

              <h2 className="font-lexend text-xl font-bold text-slate-800">
                {form.firstName || "Update"} {form.lastName || "Name"}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5 justify-center">
                <UserCheck2 className="h-3.5 w-3.5 text-indigo-500" />
                {form.role || "User"}
              </p>

              <div className="mt-8 w-full space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Profile Strength</span>
                  <span className="text-indigo-600">
                    {profileCompletion()}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                    style={{ width: `${profileCompletion()}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Completing your profile improves security and trust.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-indigo-900 p-6 text-white overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <Fingerprint className="h-5 w-5 text-indigo-200" />
                </div>
                <h3 className="font-lexend font-bold">2FA Security</h3>
              </div>
              <p className="text-xs text-indigo-200 mb-5 leading-relaxed">
                Enhance your account safety by enabling two-factor
                authentication. Available soon.
              </p>
              <div className="w-full h-1 bg-indigo-800 rounded-full">
                <div className="w-1/3 h-full bg-indigo-400 rounded-full" />
              </div>
            </div>
          </div>
        </aside>

        {/* Right Section: Form Content */}
        <main className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-1 flex items-center gap-1 shadow-sm overflow-x-auto no-scrollbar">
            {[
              { id: "personal", label: "Personal", icon: User },
              { id: "employment", label: "Employment", icon: Briefcase },
              { id: "security", label: "Security", icon: Shield },
              { id: "notifications", label: "Alerts", icon: Bell },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "cursor-pointer flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-white text-indigo-600 shadow-sm shadow-indigo-100 border border-slate-200/50"
                    : "text-slate-500 hover:bg-white/50 hover:text-slate-900",
                )}
              >
                <tab.icon
                  className={cn(
                    "h-3.5 w-3.5",
                    activeTab === tab.id ? "text-indigo-500" : "text-slate-400",
                  )}
                />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-xl shadow-slate-200/50">
            <div className="p-7">
              {/* Personal Tab */}
              {activeTab === "personal" && (
                <div className="space-y-8 py-2 animate-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="font-lexend text-xl font-bold text-slate-800">
                      Personal Information
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Manage your legal identity and public profile details.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label="First Name"
                      icon={User}
                      value={form.firstName}
                      onChange={(v) => updateField("firstName", v)}
                      placeholder="Enter legal first name"
                    />
                    <Field
                      label="Last Name"
                      icon={User}
                      value={form.lastName}
                      onChange={(v) => updateField("lastName", v)}
                      placeholder="Enter legal last name"
                    />
                    <Field
                      label="Middle Name"
                      icon={User}
                      value={form.middleName}
                      onChange={(v) => updateField("middleName", v)}
                      placeholder="Optional"
                    />
                    <Field
                      label="Suffix"
                      icon={AtSign}
                      value={form.suffix}
                      onChange={(v) => updateField("suffix", v)}
                      placeholder="Jr., Sr., III"
                    />

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                        Birthdate
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium transition-all hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                            <CalendarIcon className="h-4 w-4 text-indigo-500" />
                            {form.birthdate ? (
                              format(new Date(form.birthdate), "PPP")
                            ) : (
                              <span className="text-slate-400 text-xs">
                                Select date
                              </span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 border-none shadow-2xl"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={
                              form.birthdate
                                ? new Date(form.birthdate)
                                : undefined
                            }
                            onSelect={(d) =>
                              d &&
                              updateField(
                                "birthdate",
                                d.toISOString().split("T")[0],
                              )
                            }
                            initialFocus
                            className="rounded-xl border border-slate-100 bg-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                        Gender Identity
                      </label>
                      <div className="flex h-12 w-full items-center p-1 bg-slate-50 rounded-xl border border-slate-200">
                        <button
                          onClick={() => updateField("sex", true)}
                          className={cn(
                            "cursor-pointer flex-1 h-full rounded-lg text-xs font-bold transition-all",
                            form.sex === true
                              ? "bg-white text-indigo-600 shadow-sm"
                              : "text-slate-400 hover:text-slate-600",
                          )}
                        >
                          Male
                        </button>
                        <button
                          onClick={() => updateField("sex", false)}
                          className={cn(
                            "cursor-pointer flex-1 h-full rounded-lg text-xs font-bold transition-all",
                            form.sex === false
                              ? "bg-white text-indigo-600 shadow-sm"
                              : "text-slate-400 hover:text-slate-600",
                          )}
                        >
                          Female
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <Separator className="opacity-50" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field
                        label="Email Address"
                        icon={Mail}
                        type="email"
                        value={form.email}
                        onChange={(v) => updateField("email", v)}
                      />
                      <Field
                        label="Contact Number"
                        icon={Phone}
                        value={form.contactNumber}
                        onChange={(v) => updateField("contactNumber", v)}
                        placeholder="+63 9XX XXX XXXX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Employment Tab */}
              {activeTab === "employment" && (
                <div className="space-y-8 py-2 animate-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="font-lexend text-xl font-bold text-slate-800">
                      Employment Details
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Information regarding your office placement and role.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label="Employee ID"
                      icon={UserCheck2}
                      value={form.empID}
                      readOnly
                      className="bg-slate-50 opacity-80"
                    />
                    <Field
                      label="Assigned Role"
                      icon={ShieldCheck}
                      value={form.role}
                      readOnly
                      className="bg-slate-50 opacity-80"
                    />
                    <Field
                      label="Position"
                      icon={Briefcase}
                      value={form.position}
                      onChange={(v) => updateField("position", v)}
                    />
                    <Field
                      label="Department / Office"
                      icon={Globe}
                      value={form.officeAddress}
                      onChange={(v) => updateField("officeAddress", v)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Official Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                      <Textarea
                        className="rounded-2xl border-slate-200 bg-slate-50/50 pl-11 focus:ring-indigo-100 min-h-[100px] text-sm"
                        value={form.officeAddress}
                        onChange={(e) =>
                          updateField("officeAddress", e.target.value)
                        }
                        placeholder="Complete building, floor, and department information..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-8 py-2 animate-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="font-lexend text-xl font-bold text-slate-800">
                      Security & Privacy
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Control access to your account and manage security keys.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center justify-between group hover:border-slate-300 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                          <Settings className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            Change Password
                          </p>
                          <p className="text-xs text-slate-400">
                            Update your account password regularly.
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center justify-between group hover:border-slate-300 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            Active Sessions
                          </p>
                          <p className="text-xs text-slate-400">
                            View and manage where you are currently logged in.
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </div>

                    <div className="rounded-2xl border border-red-50 bg-white p-5 flex items-center justify-between group hover:border-red-200 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-50 text-red-600">
                          <UserCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-red-800">
                            Deactivate Account
                          </p>
                          <p className="text-xs text-red-400">
                            Temporarily disable your profile and access.
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-red-200 group-hover:text-red-600 transition-colors" />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-8 py-2 animate-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="font-lexend text-xl font-bold text-slate-800">
                      Preferences
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Stay updated with the latest system alerts and reports.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <NotificationToggle
                      title="System Alerts"
                      description="Get notified about account activity and security events."
                      checked={form.receiveSystemAlerts}
                      onChange={(v) => updateField("receiveSystemAlerts", v)}
                    />
                    <Separator className="opacity-50" />
                    <NotificationToggle
                      title="Weekly Reports"
                      description="Receive a summary of transaction activities in your email."
                      checked={form.receiveEmailUpdates}
                      onChange={(v) => updateField("receiveEmailUpdates", v)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center lg:hidden">
            <Button
              className="h-12 w-full text-sm font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder = "",
  readOnly = false,
  className = "",
}: {
  label: string;
  icon: any;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
        {label}
      </label>
      <InputGroup
        className={cn(
          "overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 group hover:border-slate-300 transition-all focus-within:ring-2 focus-within:ring-indigo-100",
          className,
        )}
      >
        <InputGroupAddon>
          <Icon className="h-4.5 w-4.5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
        </InputGroupAddon>
        <InputGroupInput
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className="text-sm font-semibold text-slate-800 placeholder:text-slate-300"
        />
      </InputGroup>
    </div>
  );
}

function NotificationToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      <Checkbox
        className="cursor-pointer h-6 w-6 rounded-lg border-2 border-slate-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 transition-all"
        checked={checked}
        onCheckedChange={(c) => onChange(c === true)}
      />
    </div>
  );
}
