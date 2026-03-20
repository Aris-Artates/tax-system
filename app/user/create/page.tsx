"use client";

import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  Building2,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  FilePenLine,
} from "lucide-react";

import { Combobox } from "@/components/ui/combobox";
import { ValidatedInput } from "@/components/ui/ValidatedInput";

const Suffix = ["Jr.", "Sr.", "II", "III", "IV", "V", "VI"] as const;

type FormState = {
  empID: string;
  username: string;
  firstname: string;
  middlename: string;
  lastname: string;
  suffix: string;
  birthdate: Date | undefined;
  age: string;
  sex: boolean;
  temp_pass: string;
  password: string;
  email: string;
  phone: string;
  role_id: string;
  department: string;
  position: string;
  status: boolean;
};

type RoleOption = {
  id: number;
  name: string;
  created_at?: string;
};

type ApiUserDetails = {
  empID?: string;
  username?: string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  suffix?: string;
  birthdate?: string;
  age?: string | number;
  sex?: boolean;
  email?: string;
  phone?: string;
  role_id?: number;
  roles?: {
    name?: string;
  } | null;
  role?: string;
  department?: string;
  position?: string;
  status?: boolean;
};

const initialFormState: FormState = {
  empID: "",
  username: "",
  firstname: "",
  middlename: "",
  lastname: "",
  suffix: "",
  birthdate: undefined,
  age: "",
  sex: true,
  temp_pass: "",
  password: "",
  email: "",
  phone: "",
  role_id: "",
  department: "",
  position: "",
  status: true,
};

function CreateUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingEmpID = searchParams.get("empID")?.trim() ?? "";
  const isEditMode = editingEmpID.length > 0;

  const [showPassword, setShowPassword] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);

  // FIX 1: Added missing initialLoadedForm state
  const [initialLoadedForm, setInitialLoadedForm] = useState<FormState | null>(
    null,
  );
  const [empIDError, setEmpIDError] = useState<string | null>(null);
  const [checkingEmpID, setCheckingEmpID] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (!form.birthdate) {
      updateField("age", "");
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - form.birthdate.getFullYear();

    const monthDiff = today.getMonth() - form.birthdate.getMonth();
    const dayDiff = today.getDate() - form.birthdate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    updateField("age", age.toString());
  }, [form.birthdate]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
    isValid?: boolean,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "empID") {
      setEmpIDError(null);
      setCheckingEmpID(false);
    }
    if (isValid !== undefined) {
      setValidationErrors((prev) => ({ ...prev, [key]: !isValid }));
    }
  };

  // Live duplicate check for empID
  useEffect(() => {
    const checkEmpID = async () => {
      if (form.empID.length !== 9 || isEditMode || checkingEmpID) return;

      setCheckingEmpID(true);
      setEmpIDError(null);

      try {
        const response = await fetch(
          `/api/user/check?field=empID&value=${encodeURIComponent(form.empID)}`
        );
        const data = await response.json();

        if (data.exists) {
          setEmpIDError('Employee ID already exists');
        }
      } catch {
        // Silent fail on network error
      } finally {
        setCheckingEmpID(false);
      }
    };

    const timeout = setTimeout(checkEmpID, 500);
    return () => clearTimeout(timeout);
  }, [form.empID, isEditMode]);

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoadingRoles(true);

      try {
        const response = await fetch("/api/roles/list", { cache: "no-store" });
        const data = (await response.json()) as {
          error?: string;
          roles?: RoleOption[];
        };

        if (!response.ok) {
          setRoles([]);
          return;
        }

        setRoles(data.roles ?? []);
      } catch {
        setRoles([]);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      setInitialLoadedForm(null);
      setForm(initialFormState);
      setEmpIDError(null);
      return;
    }

    let isMounted = true;

    const fetchUserDetails = async () => {
      setIsLoadingUser(true);
      setSuccessMessage(null);

      try {
        const response = await fetch(
          `/api/user/detail?empID=${encodeURIComponent(editingEmpID)}`,
          {
            cache: "no-store",
          },
        );

        const data = (await response.json()) as {
          error?: string;
          user?: ApiUserDetails;
        };

        if (!response.ok) {
          if (isMounted) {
            toast.error("Unable to load user details", {
              description:
                data.error || "An error occurred while loading user details.",
            });
          }
          return;
        }

        const user = data.user;
        const resolvedEmpID = user?.empID?.trim() ?? "";
        const resolvedUsername = user?.username?.trim() || resolvedEmpID;
        const mapped: FormState = {
          empID: resolvedEmpID,
          username: resolvedUsername,
          firstname: user?.firstname?.trim() ?? "",
          middlename: user?.middlename?.trim() ?? "",
          lastname: user?.lastname?.trim() ?? "",
          suffix: user?.suffix?.trim() ?? "",
          // FIX 2: Safely parse birthdate string back into a Date object
          birthdate: user?.birthdate ? new Date(user.birthdate) : undefined,
          age: user?.age != null ? String(user.age) : "",
          sex: typeof user?.sex === "boolean" ? user.sex : true,
          temp_pass: "",
          password: "",
          email: user?.email?.trim() ?? "",
          phone: user?.phone?.trim() ?? "",
          role_id:
            typeof user?.role_id === "number" ? String(user.role_id) : "",
          department: user?.department?.trim() ?? "",
          position: user?.position?.trim() ?? "",
          status: typeof user?.status === "boolean" ? user.status : true,
        };

        if (isMounted) {
          setForm(mapped);
          setInitialLoadedForm(mapped);
        }
      } catch {
        if (isMounted) {
          toast.error("Connection Error", {
            description: "Unable to connect to server.",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    };

    fetchUserDetails();

    return () => {
      isMounted = false;
    };
  }, [editingEmpID, isEditMode]);

  const missingRequiredFields = useMemo(() => {
    const baseRequired =
      !form.empID.trim() ||
      !form.username.trim() ||
      !form.firstname.trim() ||
      !form.lastname.trim() ||
      !form.birthdate ||
      !form.age.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.role_id.trim() ||
      !form.department.trim() ||
      !form.position.trim();

    if (isEditMode) return baseRequired;

    return baseRequired || !form.temp_pass.trim() || !form.password.trim();
  }, [form, isEditMode]);

  const isBirthdateValid = useMemo(() => {
    if (!form.birthdate) return true;
    return !isNaN(form.birthdate.getTime());
  }, [form.birthdate]);

  const passwordsMatch = useMemo(() => {
    if (!form.temp_pass && !form.password) return true;
    return form.temp_pass === form.password;
  }, [form.temp_pass, form.password]);

  const passwordTouched = useMemo(() => {
    return form.temp_pass.length > 0 || form.password.length > 0;
  }, [form.temp_pass, form.password]);

  const hasFormChanges = useMemo(() => {
    if (!isEditMode || !initialLoadedForm) return true;

    // FIX 4: Prevent calling .trim() on Date object which causes crashes
    const normalize = (value: FormState) => ({
      empID: value.empID.trim(),
      username: value.username.trim(),
      firstname: value.firstname.trim(),
      middlename: value.middlename.trim(),
      lastname: value.lastname.trim(),
      suffix: value.suffix.trim(),
      birthdate: value.birthdate ? format(value.birthdate, "yyyy-MM-dd") : "",
      age: value.age.trim(),
      sex: value.sex,
      email: value.email.trim(),
      phone: value.phone.trim(),
      role_id: value.role_id.trim(),
      department: value.department.trim(),
      position: value.position.trim(),
      status: value.status,
    });

    return (
      JSON.stringify(normalize(form)) !==
      JSON.stringify(normalize(initialLoadedForm))
    );
  }, [form, initialLoadedForm, isEditMode]);

  const handleSave = async () => {
    setSuccessMessage(null);

    if (isEditMode && isLoadingUser) {
      toast("User data is still loading.");
      return;
    }

    if (missingRequiredFields) {
      toast.error("Required Field Error", {
        description: "Please fill out all required fields.",
      });
      return;
    }

    if (empIDError) {
      toast.error(empIDError);
      return;
    }

    if (Object.values(validationErrors).some((v) => v)) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    // REMOVED: Length, Uppercase, and Number restrictions.
    // KEPT: Match check to ensure the user didn't make a typo.
    if (!isEditMode && form.temp_pass !== form.password) {
      toast.error("Password Error", {
        description: "Temporary password and password must match.",
      });
      return;
    }

    if (isEditMode && passwordTouched) {
      if (!form.temp_pass.trim() || !form.password.trim()) {
        toast.error("Password Error", {
          description:
            "Enter both Temp Pass and Password to update credentials.",
        });
        return;
      }

      if (!passwordsMatch) {
        toast.error("Password Error", {
          description: "Temporary password and password must match.",
        });
        return;
      }
    }

    if (isEditMode && !hasFormChanges) {
      toast.error("No Changes Detected", {
        description: "Update at least one field before saving.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = isEditMode
        ? {
            originalEmpID: initialLoadedForm?.empID ?? editingEmpID,
            empID: form.empID,
            username: form.username,
            firstname: form.firstname,
            middlename: form.middlename,
            lastname: form.lastname,
            suffix: form.suffix,
            birthdate: form.birthdate
              ? format(form.birthdate, "yyyy-MM-dd")
              : null,
            age: form.age,
            sex: form.sex,
            email: form.email,
            phone: form.phone,
            role_id: Number(form.role_id),
            department: form.department,
            position: form.position,
            status: form.status,
            // Only send credentials if user typed both fields (useful for edits)
            ...(passwordTouched
              ? {
                  temp_pass: form.temp_pass,
                  password: form.password,
                }
              : {}),
          }
        : {
            ...form,
            birthdate: form.birthdate
              ? format(form.birthdate, "yyyy-MM-dd")
              : null,
            role_id: Number(form.role_id),
          };

      const response = await fetch(
        isEditMode ? "/api/user/update" : "/api/user/create",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        toast.error("Failed to Save User", {
          description:
            data.error ?? `Failed to ${isEditMode ? "update" : "create"} user.`,
        });
        return;
      }

      toast.success(
        data.message ??
          `User ${isEditMode ? "updated" : "created"} successfully.`,
      );

      if (!isEditMode) setForm(initialFormState);

      setTimeout(() => {
        router.push("/user/view");
      }, 1200);
    } catch {
      toast.error("Connection Error", {
        description: "Unable to connect to server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <header>
        <button
          type="button"
          onClick={() => router.push("/user")}
          className="font-lexend mb-5 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to User Management
        </button>
      </header>

      {/* Sticky Action Buttons */}

      {isEditMode && isLoadingUser && (
        <div className="mb4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Loading selected user details...
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex mb-8 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
                {isEditMode ? "Edit User" : "Create New User"}
              </h1>
              <p className="font-inter mt-1 text-xs text-slate-400">
                {isEditMode
                  ? "Update user information, role access details, and account status."
                  : "Add required user information and role access details."}
              </p>
            </div>
          </div>
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-md bg-slate-100 p-2">
                <UserRound className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className="font-inter text-sm font-semibold text-[#848794]">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ValidatedInput
                label="Emp ID"
                required
                value={form.empID}
                maxLength={9}
                validator="employee-Id"
                type="employee-Id"
                onChange={(v, isValid) => updateField("empID", v, isValid)}
                errorMessage={empIDError}
              />
              <Field
                label="Username"
                required
                value={form.username}
                onChange={(v) => updateField("username", v)}
              />
              <ValidatedInput
                label="First Name"
                required
                value={form.firstname}
                validator="name"
                type="name"
                onChange={(v, isValid) => updateField("firstname", v, isValid)}
              />
              <ValidatedInput
                label="Middle Name"
                value={form.middlename}
                validator="name"
                type="name"
                onChange={(v, isValid) => updateField("middlename", v, isValid)}
              />
              <ValidatedInput
                label="Last Name"
                required
                value={form.lastname}
                validator="name"
                type="name"
                onChange={(v, isValid) => updateField("lastname", v, isValid)}
              />
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Suffix
                </label>
                <Combobox
                  options={Suffix.map((s) => ({ value: s, label: s }))}
                  value={form.suffix}
                  onChange={(val) => updateField("suffix", val)}
                  placeholder="Select suffix"
                  searchPlaceholder="Search suffix..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Birthdate
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-1 w-full justify-start text-left font-normal cursor-pointer"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {form.birthdate ? (
                        format(form.birthdate, "yyyy-MM-dd")
                      ) : (
                        <span className="text-slate-400">Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      disabled={(date) => date > new Date()}
                      mode="single"
                      selected={form.birthdate}
                      onSelect={(date) => updateField("birthdate", date)}
                      captionLayout="dropdown"
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                      initialFocus
                      className="rounded-lg border bg-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* FIX 6: Removed duplicate age/birthdate field and set Age to readOnly */}
              <Field
                label="Age"
                required
                readOnly
                value={form.age}
                onChange={(v) => updateField("age", v)}
              />

              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Sex
                  <span className="ml-1 text-rose-500">*</span>
                </label>
                <div className="mt-1 flex gap-2">
                  <BooleanChip
                    label="Male"
                    checked={form.sex}
                    onClick={() => updateField("sex", true)}
                    className="cursor-pointer"
                  />
                  <BooleanChip
                    label="Female"
                    checked={!form.sex}
                    onClick={() => updateField("sex", false)}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-md bg-slate-100 p-2">
                <Mail className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className="font-inter text-sm font-semibold text-[#848794]">
                Contact & Work Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ValidatedInput
                label="Email"
                type="email"
                placeholder="name@example.com"
                required
                value={form.email}
                leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                onChange={(v, isValid) => updateField("email", v, isValid)}
              />
              <ValidatedInput
                label="Phone"
                type="phone"
                placeholder="917 123 4567"
                required
                value={form.phone}
                leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
                onChange={(v, isValid) => updateField("phone", v, isValid)}
              />
              {/* Role Combobox */}
              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    Role
                  </span>
                  <span className="ml-1 text-rose-500">*</span>
                </label>
                <div className="mt-1">
                  <Combobox
                    options={roles.map((role) => ({
                      value: String(role.id),
                      label: role.name,
                    }))}
                    value={form.role_id}
                    onChange={(val) => updateField("role_id", val)}
                    placeholder={
                      isLoadingRoles ? "Loading..." : "Select a role"
                    }
                    searchPlaceholder="Search role..."
                  />
                </div>
              </div>
              <Field
                label="Department"
                required
                value={form.department}
                leftIcon={<Building2 className="h-4 w-4 text-slate-400" />}
                onChange={(v) => updateField("department", v)}
              />
              <Field
                label="Position"
                required
                value={form.position}
                onChange={(v) => updateField("position", v)}
              />

              <div>
                <label className="font-inter text-xs font-medium text-slate-600">
                  Status
                  <span className="ml-1 text-rose-500">*</span>
                </label>
                <div className="mt-1 flex gap-2">
                  <BooleanChip
                    label="Active"
                    checked={form.status}
                    onClick={() => updateField("status", true)}
                    className="cursor-pointer"
                  />
                  <BooleanChip
                    label="Inactive"
                    checked={!form.status}
                    onClick={() => updateField("status", false)}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-md bg-slate-100 p-2">
                <KeyRound className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className="font-inter text-sm font-semibold text-[#848794]">
                Security
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PasswordField
                label="Temp Pass"
                required
                value={form.temp_pass}
                show={showTempPassword}
                onToggle={() => setShowTempPassword((v) => !v)}
                onChange={(v) => updateField("temp_pass", v)}
              />
              <PasswordField
                label="Password"
                required
                value={form.password}
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                onChange={(v) => updateField("password", v)}
                error={passwordTouched && !passwordsMatch}
                errorMessage="Passwords do not match"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8 lg:self-start flex flex-col-reverse lg:flex-col">
          <div className="sticky top-0 z-40 mb-6 flex justify-end py-1.5 w-full px-4 md:px-0">
            {/* mt-20 is the "Small Screen" version. md:mt-0 is the "Big Screen" fix. */}
            <div className="flex w-full items-center gap-2 mb-2 mt-4 md:mt-0 md:w-auto">
              <Link
                href="/user"
                className="flex-1 justify-center md:flex-none font-inter inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="button"
                disabled={
                  isSubmitting ||
                  isLoadingUser ||
                  !!empIDError ||
                  checkingEmpID ||
                  Object.values(validationErrors).some((v) => v)
                }
                className="flex-1 justify-center md:flex-none font-inter h-10 inline-flex cursor-pointer items-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-[#8A9098] transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSave}
              >
                {isEditMode ? (
                  <FilePenLine className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="whitespace-nowrap">
                  {isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Saving..."
                    : isEditMode
                      ? "Update User"
                      : "Save User"}
                </span>
              </button>
            </div>
          </div>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-inter text-sm font-semibold text-[#848794]">
              Summary
            </h2>
            <p className="font-inter mt-1 text-xs text-slate-400">
              {isEditMode
                ? "Required fields must be complete. Birthdate format: yyyy-mm-dd."
                : "All listed fields are required. Birthdate format: yyyy-mm-dd."}
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <SummaryRow
                label="Name"
                value={
                  [form.firstname, form.lastname].filter(Boolean).join(" ") ||
                  "(Required)"
                }
              />
              <SummaryRow label="Emp ID" value={form.empID || "(Required)"} />
              <SummaryRow
                label="Username"
                value={form.username || "(Required)"}
              />

              {/* FIX 8: Display the dynamic role name instead of the ID */}
              <SummaryRow
                label="Role"
                value={
                  roles.find((r) => String(r.id) === form.role_id)?.name ||
                  "(Required)"
                }
              />

              <SummaryRow
                label="Status"
                value={form.status ? "Active" : "Inactive"}
              />
            </div>

            {(missingRequiredFields || !isBirthdateValid) && (
              <p className="font-inter mt-4 text-xs text-rose-600">
                {isEditMode && !hasFormChanges
                  ? "No changes detected yet. Update at least one field before saving."
                  : "Complete all required fields and use valid birthdate format."}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------

function Field({
  label,
  type = "text",
  placeholder,
  leftIcon,
  inputType = "text",
  value,
  onChange,
  required = false,
  readOnly = false,
}: {
  label: string;
  type?: "text" | "email" | "tel";
  placeholder?: string;
  leftIcon?: React.ReactNode;
  inputType?: "text" | "date" | "email" | "tel";
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <div
        className={`mt-1 flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 ${readOnly ? "bg-gray-50 opacity-80" : "bg-white focus-within:ring-2 focus-within:ring-slate-200"}`}
      >
        {leftIcon}
        <input
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 ${
            inputType === "date" ? "cursor-pointer" : ""
          } ${readOnly ? "cursor-not-allowed text-slate-500" : ""}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  show,
  onToggle,
  value,
  onChange,
  required = false,
  error = false,
  errorMessage = "",
}: {
  label: string;
  show: boolean;
  onToggle: () => void;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <div
        className={`mt-1 flex items-center gap-2 rounded-md border bg-white px-3 py-2 focus-within:ring-2 ${
          error
            ? "border-rose-400 focus-within:ring-rose-200"
            : "border-gray-200 focus-within:ring-slate-200"
        }`}
      >
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={show ? "text" : "password"}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={onToggle}
          className="rounded p-1 text-slate-500 hover:bg-gray-50 hover:text-slate-900"
          aria-label="Toggle password visibility"
        >
          {show ? (
            <EyeOff className="h-4 w-4 cursor-pointer" />
          ) : (
            <Eye className="h-4 w-4 cursor-pointer" />
          )}
        </button>
      </div>
      {error && errorMessage && (
        <p className="mt-1 font-inter text-xs text-rose-500" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

function BooleanChip({
  label,
  checked,
  onClick,
  className,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-inter rounded-md border px-3 py-2 text-xs transition ${
        checked
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-gray-200 bg-white text-slate-600 hover:bg-gray-50"
      } ${className || ""}`}
    >
      {label}
    </button>
  );
}

function RoleRadio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="font-inter inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs text-slate-700 hover:bg-gray-50">
      <input
        type="radio"
        name="role"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-inter text-slate-500">{label}</span>
      <span
        className="font-inter font-medium text-slate-900 truncate max-w-150px"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

export default function CreateUserPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-slate-500">Loading form...</div>}
    >
      <CreateUserForm />
    </Suspense>
  );
}