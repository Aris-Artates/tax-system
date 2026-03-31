"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Mail, ShieldCheck, UserCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

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

export default function UserProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();

        if (!sessionData.user?.empID) {
          toast.error("Not authenticated", { description: "Please login to view your profile." });
          router.push("/");
          return;
        }

        const detailRes = await fetch(`/api/user/detail?empID=${sessionData.user.empID}`);
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
            age: u.age || "",
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
        toast.error("Failed to load profile", { description: "An error occurred while fetching your data." });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", { description: "Please select an image file." });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.path) {
        updateField("profilePicture", data.path);
        toast.success("Image uploaded", { description: "Your profile picture has been uploaded and ready to save." });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", { description: "Could not upload the profile picture." });
    } finally {
      setUploading(false);
    }
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
    try {
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
        image_path: form.profilePicture,
      };

      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated", {
          description: "Your profile preferences were saved to Supabase.",
        });
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Save failed", { description: error.message || "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    toast.message("Refresh page", {
      description: "Please refresh the page to revert changes.",
    });
  };

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex w-full overflow-x-hidden">
      <main className="flex-1 w-full">
        <header className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/user")}
            className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to User Management
         </button>

          <h1 className="text-2xl font-bold text-[#595a5d]">My Profile</h1>
          <p className="mt-1 text-xs text-slate-400">
            Manage your account details and notification preferences.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-xl border bg-white p-5 xl:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative shrink-0">
                {form.profilePicture ? (
                  <img
                    src={form.profilePicture}
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-200"
                  />
                ) : (
                  <UserCircle2 className="h-16 w-16 text-slate-400" />
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                )}
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-slate-700 text-white shadow transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Change profile picture"
                >
                  <Camera className="h-3 w-3" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePictureChange}
                />
              </div>
              <div>
                <p className="text-sm text-slate-500">Account</p>
                <p className="text-lg font-semibold text-slate-800">
                  {form.firstName} {form.lastName}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <span>{form.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-500" />
                <span>{form.role}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5 xl:col-span-2">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                Profile Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep your contact details updated for account recovery and alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="username">
                  Username
                </label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="position">
                  Position
                </label>
                <Input
                  id="position"
                  value={form.position}
                  onChange={(e) => updateField("position", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="first-name">
                  First Name
                </label>
                <Input
                  id="first-name"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="middle-name">
                  Middle Name
                </label>
                <Input
                  id="middle-name"
                  value={form.middleName}
                  onChange={(e) => updateField("middleName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="last-name">
                  Last Name
                </label>
                <Input
                  id="last-name"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="suffix">
                  Suffix
                </label>
                <Input
                  id="suffix"
                  value={form.suffix}
                  onChange={(e) => updateField("suffix", e.target.value)}
                  placeholder="e.g. Jr., Sr."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="birthdate">
                  Birthdate
                </label>
                <Input
                  id="birthdate"
                  type="date"
                  value={form.birthdate}
                  onChange={(e) => updateField("birthdate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="age">
                  Age
                </label>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                />
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <label className="text-sm font-medium text-slate-700 mb-2">
                  Sex
                </label>
                <div className="flex gap-4 items-center h-10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="sex" 
                      checked={form.sex === true} 
                      onChange={() => updateField("sex", true)}
                    />
                    <span className="text-sm">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="sex" 
                      checked={form.sex === false} 
                      onChange={() => updateField("sex", false)}
                    />
                    <span className="text-sm">Female</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="role">
                  Role
                </label>
                <Input id="role" value={form.role} disabled />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="contact-number">
                  Contact Number
                </label>
                <Input
                  id="contact-number"
                  value={form.contactNumber}
                  onChange={(e) => updateField("contactNumber", e.target.value)}
                  placeholder="09XX XXX XXXX"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="office-address">
                  Office Address
                </label>
                <Textarea
                  id="office-address"
                  value={form.officeAddress}
                  onChange={(e) => updateField("officeAddress", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <Checkbox
                  checked={form.receiveEmailUpdates}
                  onCheckedChange={(checked) =>
                    updateField("receiveEmailUpdates", checked === true)
                  }
                />
                Receive weekly email updates
              </label>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <Checkbox
                  checked={form.receiveSystemAlerts}
                  onCheckedChange={(checked) =>
                    updateField("receiveSystemAlerts", checked === true)
                  }
                />
                Receive system alerts and account notices
              </label>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button 
                className="cursor-pointer" 
                onClick={handleSave} 
                disabled={saving || uploading}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
