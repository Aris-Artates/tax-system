"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  Shield,
  Eye,
  EyeOff,
  CalendarIcon,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Fingerprint,
  Trash2,
  Table as TableIcon,
  Undo2,
  Mars,
  Venus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Stepper,
  StepperContent,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTrigger,
} from "@/components/reui/stepper";
import { cn } from "@/lib/utils";

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
  emails: string[];
  phones: string[];
  role_id: string;
  department: string;
  position: string;
  status: boolean;
};

type RoleOption = {
  id: number;
  name: string;
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
  emails: [""],
  phones: [""],
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

  const [activeStep, setActiveStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [initialLoadedForm, setInitialLoadedForm] = useState<FormState | null>(
    null,
  );
  const [empIDError, setEmpIDError] = useState<string | null>(null);
  const [checkingEmpID, setCheckingEmpID] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});

  // Age calculation
  useEffect(() => {
    if (!form.birthdate) {
      updateField("age", "");
      return;
    }
    const today = new Date();
    let age = today.getFullYear() - form.birthdate.getFullYear();
    const monthDiff = today.getMonth() - form.birthdate.getMonth();
    const dayDiff = today.getDate() - form.birthdate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
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

  // Duplicate check
  useEffect(() => {
    const checkEmpID = async () => {
      if (form.empID.length !== 9 || isEditMode || checkingEmpID) return;
      setCheckingEmpID(true);
      try {
        const response = await fetch(
          `/api/user/check?field=empID&value=${encodeURIComponent(form.empID)}`,
        );
        const data = await response.json();
        if (data.exists) setEmpIDError("Employee ID already exists");
      } catch {
      } finally {
        setCheckingEmpID(false);
      }
    };
    const timeout = setTimeout(checkEmpID, 500);
    return () => clearTimeout(timeout);
  }, [form.empID, isEditMode]);

  // Fetch Roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles/list", { cache: "no-store" });
        const data = await response.json();
        setRoles(data.roles ?? []);
      } catch {
        setRoles([]);
      } finally {
        setIsLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Fetch User Details (Edit Mode)
  useEffect(() => {
    if (!isEditMode) return;
    const fetchUserDetails = async () => {
      setIsLoadingUser(true);
      try {
        const response = await fetch(
          `/api/user/detail?empID=${encodeURIComponent(editingEmpID)}`,
          { cache: "no-store" },
        );
        const data = await response.json();
        if (response.ok && data.user) {
          const user = data.user;
          const mapped: FormState = {
            empID: user.empID?.trim() ?? "",
            username: user.username?.trim() ?? "",
            firstname: user.firstname?.trim() ?? "",
            middlename: user.middlename?.trim() ?? "",
            lastname: user.lastname?.trim() ?? "",
            suffix: user.suffix?.trim() ?? "",
            birthdate: user.birthdate ? new Date(user.birthdate) : undefined,
            age: user.age != null ? String(user.age) : "",
            sex: typeof user.sex === "boolean" ? user.sex : true,
            temp_pass: "",
            password: "",
            emails: user.email?.trim() ? [user.email.trim()] : [""],
            phones: user.phone?.trim() ? [user.phone.trim()] : [""],
            role_id:
              typeof user.role_id === "number" ? String(user.role_id) : "",
            department: user.department?.trim() ?? "",
            position: user.position?.trim() ?? "",
            status: typeof user.status === "boolean" ? user.status : true,
          };
          setForm(mapped);
          setInitialLoadedForm(mapped);
        }
      } catch {
        toast.error("Failed to load user details");
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUserDetails();
  }, [editingEmpID, isEditMode]);

  const checkStepValidity = (step: number) => {
    if (step === 1) {
      return !!(
        form.firstname?.trim() &&
        form.lastname?.trim() &&
        form.birthdate
      );
    } else if (step === 2) {
      return !!(
        form.emails[0]?.trim() &&
        form.phones[0]?.trim() &&
        !validationErrors.emails &&
        !validationErrors.phones
      );
    } else if (step === 3) {
      return !!(
        form.role_id &&
        form.department?.trim() &&
        form.position?.trim()
      );
    } else if (step === 4) {
      const basic = !!(
        form.empID?.trim() &&
        form.username?.trim() &&
        !empIDError
      );
      if (isEditMode) return basic;
      return (
        basic &&
        !!(
          form.temp_pass?.trim() &&
          form.password?.trim() &&
          form.temp_pass === form.password
        )
      );
    }
    return true;
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (
        !form.firstname?.trim() ||
        !form.lastname?.trim() ||
        !form.birthdate
      ) {
        toast.error("Personal information missing", {
          description: "First Name, Last Name and Birthdate are required.",
        });
        return false;
      }
    } else if (step === 2) {
      if (!form.emails[0]?.trim()) {
        toast.error("Primary email required");
        return false;
      }
      if (!form.phones[0]?.trim()) {
        toast.error("Primary phone required");
        return false;
      }
    } else if (step === 3) {
      if (!form.role_id || !form.department?.trim() || !form.position?.trim()) {
        toast.error("Work details missing", {
          description: "Please fill in all organizational placement fields.",
        });
        return false;
      }
    } else if (step === 4) {
      if (!form.empID?.trim() || !form.username?.trim()) {
        toast.error("Required fields missing", {
          description: "Employee ID and Username are required.",
        });
        return false;
      }
      if (empIDError) {
        toast.error(empIDError);
        return false;
      }
      if (!isEditMode && (!form.temp_pass?.trim() || !form.password?.trim())) {
        toast.error("Security setup required", {
          description: "Please provide a temporary password.",
        });
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = async () => {
    if (Object.values(validationErrors).some((v) => v)) {
      toast.error("Please fix all validation errors.");
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
            emails: form.emails,
            phones: form.phones,
            role_id: Number(form.role_id),
            department: form.department,
            position: form.position,
            status: form.status,
            ...(form.temp_pass
              ? { temp_pass: form.temp_pass, password: form.password }
              : {}),
          }
        : {
            ...form,
            emails: form.emails,
            phones: form.phones,
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

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success(
        isEditMode ? "User updated successfully" : "User created successfully",
      );
      router.push("/user/view");
    } catch (error: any) {
      toast.error("Save failed", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: "Profile", icon: UserRound },
    { title: "Contact", icon: Mail },
    { title: "Placement", icon: Building2 },
    { title: "Account", icon: Fingerprint },
    { title: "Review", icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto w-full animate-in fade-in duration-500">
      <header className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
            {isEditMode ? "Edit User Account" : "Enroll New Personnel"}
          </h1>
          <p className="font-inter mt-1 text-xs text-slate-400">
            {isEditMode
              ? "Update user credentials and operational placement."
              : "Complete the phased enrollment to onboard a new team member."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => router.push("/user")}
            className="h-9 rounded-md border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-white hover:text-slate-900 cursor-pointer"
          >
            <Undo2 className="h-4 w-4" />
            Back to User Management
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/user/view")}
            className="h-9 rounded-md border border-slate-200 bg-white px-4 text-xs font-semibold text-[#0F172A] shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
          >
            <TableIcon className="h-4 w-4" />
            View User Directory
          </Button>
        </div>
      </header>

      <Stepper
        value={activeStep}
        onValueChange={(val) => setActiveStep(Number(val))}
        orientation="horizontal"
        className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      >
        {/* Top Stepper Navigation */}
        <header className="bg-slate-50/20 border-b border-gray-100 py-3 px-2.5">
          <StepperNav className="flex items-center w-full">
            {steps.map((s, idx) => {
              const StepIcon = s.icon;
              const stepNum = idx + 1;
              const isCompleted = stepNum < activeStep;
              const isActive = stepNum === activeStep;

              let isLocked = false;
              if (stepNum > activeStep) {
                for (let i = activeStep; i < stepNum; i++) {
                  if (!checkStepValidity(i)) {
                    isLocked = true;
                    break;
                  }
                }
              }

              return (
                <StepperItem
                  key={stepNum}
                  step={stepNum}
                  className={cn(
                    "flex items-center",
                    stepNum < steps.length ? "flex-1" : "flex-none",
                  )}
                >
                  <StepperTrigger
                    onClick={(e) => {
                      if (isLocked) {
                        e.preventDefault();
                        e.stopPropagation();
                        toast.error(`Step ${stepNum} is locked`, {
                          description: `Please complete the ${steps[activeStep - 1].title} section first.`,
                        });
                      } else {
                        setActiveStep(stepNum);
                      }
                    }}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 w-[70px] p-1 rounded-xl transition-all data-[state=active]:bg-white flex-none",
                      isLocked && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    <div
                      className={cn(
                        "size-7 rounded-full flex items-center justify-center transition-all duration-500 ring-2 ring-white border border-slate-100 shadow-sm",
                        isCompleted
                          ? "bg-emerald-500 text-white animate-step-pop"
                          : isActive
                            ? "bg-[#0F172A] text-white"
                            : "bg-slate-50 text-slate-400 group-hover:bg-slate-100",
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <StepIcon size={14} />
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-inter text-[9px] font-bold uppercase tracking-wider whitespace-nowrap",
                        isActive ? "text-[#0F172A]" : "text-slate-400",
                      )}
                    >
                      {s.title}
                    </span>
                  </StepperTrigger>
                  {stepNum < steps.length && (
                    <StepperSeparator className="flex-1 bg-slate-200/50 h-[1.5px] mx-1 self-center -mt-4" />
                  )}
                </StepperItem>
              );
            })}
          </StepperNav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-5 bg-white">
          <StepperPanel>
            {/* STEP 1: Personal Details */}
            <StepperContent
              value={1}
              className="animate-in fade-in slide-in-from-right-4 duration-300 outline-none"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <UserRound className="size-4 text-slate-400" />
                    <h3 className="font-bold text-slate-700 font-lexend text-sm">
                      Legal Identity
                    </h3>
                  </div>
                  <ValidatedInput
                    label="First Name"
                    required
                    value={form.firstname}
                    validator="name"
                    type="name"
                    onChange={(v, isValid) =>
                      updateField("firstname", v, isValid)
                    }
                  />
                  <ValidatedInput
                    label="Middle Name"
                    value={form.middlename}
                    validator="name"
                    type="name"
                    onChange={(v, isValid) =>
                      updateField("middlename", v, isValid)
                    }
                  />
                  <ValidatedInput
                    label="Last Name"
                    required
                    value={form.lastname}
                    validator="name"
                    type="name"
                    onChange={(v, isValid) =>
                      updateField("lastname", v, isValid)
                    }
                  />
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Suffix
                    </label>
                    <Combobox
                      options={Suffix.map((s) => ({ value: s, label: s }))}
                      value={form.suffix}
                      onChange={(val) => updateField("suffix", val)}
                      placeholder="Select suffix"
                      className="mt-1 h-9 rounded-md border-gray-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="size-4 text-slate-400" />
                    <h3 className="font-bold text-slate-700 font-lexend text-sm">
                      Demographics
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Birthdate <span className="text-rose-500">*</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex h-9 w-full justify-start rounded-md border-slate-200 bg-white px-3 font-medium text-slate-700 hover:border-slate-300 transition-all cursor-pointer mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                          {form.birthdate ? (
                            format(form.birthdate, "yyyy-MM-dd")
                          ) : (
                            <span className="text-slate-400 text-xs">
                              Select Date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border border-gray-100 shadow-xl"
                        align="start"
                      >
                        <Calendar
                          disabled={(date) => date > new Date()}
                          mode="single"
                          selected={form.birthdate}
                          onSelect={(date) => updateField("birthdate", date)}
                          captionLayout="dropdown"
                          fromYear={1950}
                          toYear={new Date().getFullYear()}
                          initialFocus
                          className="bg-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-400">
                      Calculated Age
                    </label>
                    <input
                      type="text"
                      value={form.age ? `${form.age} Years Old` : ""}
                      readOnly
                      className="mt-1 h-9 w-full rounded-md border border-gray-100 bg-slate-50 px-3 text-sm text-slate-400 cursor-not-allowed outline-none font-medium"
                      placeholder="Automatic"
                    />
                  </div>
                  <div className="pt-1 space-y-2">
                    <label className="font-inter text-xs font-medium text-slate-600">
                      Sex <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex h-10 gap-2 p-1 bg-slate-50/50 rounded-lg border border-slate-100">
                      <button
                        type="button"
                        onClick={() => updateField("sex", true)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                          form.sex
                            ? "bg-white text-blue-600 border border-blue-100 scale-[1.02]"
                            : "text-slate-400 hover:text-slate-500",
                        )}
                      >
                        <Mars
                          size={14}
                          className={cn(
                            "transition-transform duration-300",
                            form.sex && "scale-110",
                          )}
                        />
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("sex", false)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                          !form.sex
                            ? "bg-white text-pink-600 border border-pink-100 scale-[1.02]"
                            : "text-slate-400 hover:text-slate-500",
                        )}
                      >
                        <Venus
                          size={14}
                          className={cn(
                            "transition-transform duration-300",
                            !form.sex && "scale-110",
                          )}
                        />
                        Female
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <footer className="pt-8 flex justify-end">
                <Button
                  onClick={nextStep}
                  className="h-9 px-8 rounded-md bg-[#0F172A] font-bold text-xs transition-all hover:bg-slate-800 shadow-md shadow-slate-100 cursor-pointer"
                >
                  Contact Details <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </footer>
            </StepperContent>

            {/* STEP 2: Contact Details */}
            <StepperContent
              value={2}
              className="animate-in fade-in slide-in-from-right-4 duration-300 outline-none"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-slate-400" />
                      <h3 className="font-bold text-slate-700 font-lexend text-sm">
                        Email Addresses
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          emails: [...prev.emails, ""],
                        }))
                      }
                      className="h-8 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#0F172A] cursor-pointer"
                    >
                      + Add Email
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {form.emails.map((email, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <ValidatedInput
                            label={
                              idx === 0 ? "Primary Email" : `Email ${idx + 1}`
                            }
                            type="email"
                            required={idx === 0}
                            value={email}
                            onChange={(v, isValid) => {
                              const newEmails = [...form.emails];
                              newEmails[idx] = v;
                              updateField("emails", newEmails);
                            }}
                          />
                        </div>
                        {idx > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              updateField(
                                "emails",
                                form.emails.filter((_, i) => i !== idx),
                              );
                            }}
                            className="mt-8 size-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-slate-400" />
                      <h3 className="font-bold text-slate-700 font-lexend text-sm">
                        Phone Channels
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          phones: [...prev.phones, ""],
                        }))
                      }
                      className="h-8 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#0F172A] cursor-pointer"
                    >
                      + Add Number
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {form.phones.map((phone, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <ValidatedInput
                            label={
                              idx === 0 ? "Primary Phone" : `Mobile ${idx + 1}`
                            }
                            type="phone"
                            required={idx === 0}
                            value={phone}
                            onChange={(v, isValid) => {
                              const newPhones = [...form.phones];
                              newPhones[idx] = v;
                              updateField("phones", newPhones);
                            }}
                          />
                        </div>
                        {idx > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              updateField(
                                "phones",
                                form.phones.filter((_, i) => i !== idx),
                              );
                            }}
                            className="mt-8 size-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <footer className="pt-8 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  className="h-9 px-4 rounded-md font-bold text-xs text-slate-500 hover:text-[#0F172A] hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back to Profile
                </Button>
                <Button
                  onClick={nextStep}
                  className="h-9 px-8 rounded-md bg-[#0F172A] font-bold text-xs transition-all hover:bg-slate-800 shadow-md shadow-slate-100 cursor-pointer"
                >
                  Placement Details <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </footer>
            </StepperContent>

            {/* STEP 3: Organizational Placement */}
            <StepperContent
              value={3}
              className="animate-in fade-in slide-in-from-right-4 duration-300 outline-none"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-inter text-xs font-medium text-slate-600 ml-1">
                    Assigned Role <span className="text-rose-500">*</span>
                  </label>
                  <Combobox
                    options={roles.map((role) => ({
                      value: String(role.id),
                      label: role.name,
                    }))}
                    value={form.role_id}
                    onChange={(val) => updateField("role_id", val)}
                    placeholder={
                      isLoadingRoles ? "Loading..." : "Select Position"
                    }
                    className="mt-1 h-10 rounded-md"
                  />
                </div>
                <ValidatedInput
                  label="Department"
                  required
                  type="text"
                  value={form.department}
                  onChange={(v) => updateField("department", v)}
                />
                <ValidatedInput
                  label="Position Title"
                  required
                  type="text"
                  value={form.position}
                  onChange={(v) => updateField("position", v)}
                />
                <div className="space-y-2">
                  <label className="font-inter text-xs font-medium text-slate-600 ml-1">
                    Account Eligibility <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex h-10 gap-1 p-1 bg-slate-50 rounded-md border border-gray-200">
                    <button
                      onClick={() => updateField("status", true)}
                      className={cn(
                        "flex-1 cursor-pointer rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                        form.status
                          ? "bg-white text-emerald-600 shadow-sm border border-emerald-100 font-black"
                          : "text-slate-400",
                      )}
                    >
                      Active Access
                    </button>
                    <button
                      onClick={() => updateField("status", false)}
                      className={cn(
                        "flex-1 cursor-pointer rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                        !form.status
                          ? "bg-white text-rose-600 shadow-sm border border-rose-100 font-black"
                          : "text-slate-400",
                      )}
                    >
                      Suspended
                    </button>
                  </div>
                </div>
              </div>
              <footer className="pt-8 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  className="h-9 px-4 rounded-md font-bold text-xs text-slate-500 hover:text-[#0F172A] hover:bg-slate-50 cursor-pointer"
                  type="button"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back to Contact
                </Button>
                <Button
                  onClick={nextStep}
                  className="h-9 px-8 rounded-md bg-[#0F172A] font-bold text-xs transition-all hover:bg-slate-800 shadow-md shadow-slate-100 cursor-pointer"
                  type="button"
                >
                  Account Setup <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </footer>
            </StepperContent>

            {/* STEP 4: Account Setup */}
            <StepperContent
              value={4}
              className="animate-in fade-in slide-in-from-right-4 duration-300 outline-none"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Fingerprint className="size-4 text-slate-400" />
                    <h3 className="font-bold text-slate-700 font-lexend text-sm">
                      Account Authentication
                    </h3>
                  </div>
                  <ValidatedInput
                    label="Employee ID"
                    required
                    type="employee-Id"
                    maxLength={9}
                    value={form.empID}
                    onChange={(v) => updateField("empID", v)}
                    readOnly={isEditMode}
                    errorMessage={empIDError}
                    inputClassName={isEditMode ? "bg-slate-50" : ""}
                  />
                  <ValidatedInput
                    label="System Username"
                    required
                    type="text"
                    value={form.username}
                    onChange={(v) => updateField("username", v)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="size-4 text-slate-400" />
                    <h3 className="font-bold text-slate-700 font-lexend text-sm">
                      Security Setup
                    </h3>
                  </div>
                  <div className="relative">
                    <ValidatedInput
                      label="Temporary Password"
                      required={!isEditMode}
                      type="text"
                      value={form.temp_pass}
                      onChange={(v) => updateField("temp_pass", v)}
                      placeholder={
                        isEditMode ? "Leave blank to keep current" : ""
                      }
                      inputClassName={!showTempPassword ? "password-disc" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowTempPassword(!showTempPassword)}
                      className="absolute right-3 top-9 text-slate-300 hover:text-slate-500 cursor-pointer"
                    >
                      {showTempPassword ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <ValidatedInput
                      label="Confirm Password"
                      required={!isEditMode}
                      type="text"
                      value={form.password}
                      onChange={(v) => updateField("password", v)}
                      errorMessage={
                        form.password && form.password !== form.temp_pass
                          ? "Passwords do not match"
                          : null
                      }
                      inputClassName={!showPassword ? "password-disc" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-slate-300 hover:text-slate-500 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
              <footer className="pt-8 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  className="h-9 px-4 rounded-md font-bold text-xs text-slate-500 hover:text-[#0F172A] hover:bg-slate-50 cursor-pointer"
                  type="button"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back to Placement
                </Button>
                <Button
                  onClick={nextStep}
                  className="h-10 px-8 rounded-md bg-[#0F172A] font-bold text-xs shadow-md shadow-slate-200 transition-all hover:bg-slate-800 cursor-pointer"
                  type="button"
                >
                  Proceed to Review <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </footer>
            </StepperContent>

            {/* STEP 5: Review */}
            <StepperContent
              value={5}
              className="animate-in zoom-in-95 duration-500 outline-none"
            >
              <div className="flex flex-col gap-6">
                <div className="p-4 border border-emerald-100 bg-emerald-50/20 rounded-xl flex items-center gap-4">
                  <div className="size-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-none">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="font-lexend text-xs font-bold text-emerald-900">
                      Application Ready
                    </h4>
                    <p className="text-[10px] text-emerald-700/70 font-medium">
                      Please verify the enrollment summary below before system
                      commit.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SummaryCard
                    title="Identity"
                    items={[
                      { label: "Emp ID", value: form.empID, icon: Fingerprint },
                      {
                        label: "Full Name",
                        value: `${form.firstname} ${form.lastname} ${form.suffix}`,
                        icon: UserRound,
                      },
                    ]}
                  />
                  <SummaryCard
                    title="Operational"
                    items={[
                      {
                        label: "Role",
                        value:
                          roles.find((r) => String(r.id) === form.role_id)
                            ?.name || "Unselected",
                        icon: Shield,
                      },
                      {
                        label: "Placement",
                        value: `${form.department} (${form.position})`,
                        icon: Building2,
                      },
                    ]}
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">
                    Access Channel
                  </h5>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span className="text-[10px] uppercase font-bold tracking-tighter">
                        {form.emails[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span className="text-[10px] uppercase font-bold tracking-tighter">
                        {form.phones[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <footer className="pt-8 flex gap-3">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="h-10 flex-1 rounded-md font-bold text-xs text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Back to Edit
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="h-10 flex-2 rounded-md bg-[#0F172A] font-bold text-xs shadow-lg shadow-slate-100 transition-all hover:bg-slate-800 cursor-pointer"
                >
                  {isSubmitting
                    ? "Committing Enrollment..."
                    : isEditMode
                      ? "Save Changes"
                      : "Confirm & Enroll Personnel"}
                </Button>
              </footer>
            </StepperContent>
          </StepperPanel>
        </main>
      </Stepper>

      <style jsx global>{`
        .password-disc {
          -webkit-text-security: disc !important;
        }
        @keyframes stepPop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-step-pop {
          animation: stepPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
}

function SummaryCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string; icon: any }[];
}) {
  return (
    <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/30">
      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
        {title}
      </h5>
      <div className="space-y-4">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-md border border-slate-100 text-[#0F172A] shadow-xs">
                <Icon size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                  {item.label}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UserCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50 font-inter">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0F172A] border-t-transparent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Loading Module
            </span>
          </div>
        </div>
      }
    >
      <CreateUserForm />
    </Suspense>
  );
}
