"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UsersRound,
  ShieldCheck,
  Activity,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Mail,
  Phone,
  Building2,
  Shield,
  KeyRound,
  Save,
  FilePenLine,
  CalendarIcon,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { confirmDelete } from "@/components/DeleteUserAction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel, // <-- 2. Imported the filter logic
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/table";

type ListedUser = {
  empID: string;
  name: string;
  role: string;
  status: "Active" | "Inactive";
  email: string;
  sex: boolean; // true = male, false = female
};

type ApiUser = {
  empID?: string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  suffix?: string;
  role?: string;
  roles?: {
    name?: string;
  } | null;
  status?: boolean;
  email?: string;
  sex?: boolean;
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
};

const SuffixOptions = ["Jr.", "Sr.", "II", "III", "IV", "V", "VI"] as const;

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

function BooleanChip({
  label,
  checked,
  onClick,
  className = "",
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
      className={`font-inter flex-1 rounded-md border py-2 text-xs font-medium transition-all ${
        checked
          ? "border-slate-800 bg-slate-800 text-white"
          : "border-gray-200 bg-white text-slate-600 hover:bg-gray-50"
      } ${className}`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  readOnly = false,
  leftIcon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  readOnly?: boolean;
  leftIcon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        <span className="inline-flex items-center gap-2">
          {leftIcon}
          {label}
        </span>
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <div className="relative mt-1">
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 ${
            readOnly ? "cursor-not-allowed bg-slate-50 text-slate-400" : ""
          }`}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  show,
  onToggle,
  onChange,
  required = false,
  error = false,
  errorMessage = "",
}: {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        <span className="inline-flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-slate-400" />
          {label}
        </span>
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <div className="relative mt-1">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-md border px-3 py-2 pr-10 text-sm text-slate-700 outline-none transition-all focus:ring-2 focus:ring-slate-200 ${
            error ? "border-rose-300" : "border-gray-200"
          }`}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && errorMessage && (
        <p className="mt-1 text-[10px] text-rose-500">{errorMessage}</p>
      )}
    </div>
  );
}

export default function ViewUserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // --- 3. Added state for our Search Bar ---
  const [globalFilter, setGlobalFilter] = useState("");

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [initialLoadedForm, setInitialLoadedForm] = useState<FormState | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [empIDError, setEmpIDError] = useState<string | null>(null);
  const [checkingEmpID, setCheckingEmpID] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/user/list", { cache: "no-store" });
        const data = (await response.json()) as {
          error?: string;
          users?: ApiUser[];
        };

        if (!response.ok) {
          setLoadError(data.error ?? "Failed to load users.");
          setUsers([]);
          return;
        }

        const mapped = (data.users ?? []).map((user) => {
          const fullname = [
            user.firstname?.trim() || "",
            user.middlename?.trim() || "",
            user.lastname?.trim() || "",
            user.suffix?.trim() || "",
          ]
            .filter(Boolean)
            .join(" ");

          return {
            empID: user.empID || user.email || Math.random().toString(36),
            name: fullname || "Unnamed User",
            role: user.roles?.name || user.role || "Unassigned",
            status: user.status ? "Active" : "Inactive",
            email: user.email || "",
            sex: typeof user.sex === "boolean" ? user.sex : true,
          } as ListedUser;
        });

        setUsers(mapped);
      } catch {
        setLoadError("Unable to connect to server.");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles/list", { cache: "no-store" });
        const data = await response.json();
        if (response.ok) {
          setRoles(data.roles ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    };

    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (!form.birthdate) {
      setForm((prev) => ({ ...prev, age: "" }));
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - form.birthdate.getFullYear();
    const monthDiff = today.getMonth() - form.birthdate.getMonth();
    const dayDiff = today.getDate() - form.birthdate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    setForm((prev) => ({ ...prev, age: age.toString() }));
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
      if (
        form.empID.length !== 9 ||
        form.empID === initialLoadedForm?.empID ||
        checkingEmpID
      )
        return;

      setCheckingEmpID(true);
      setEmpIDError(null);

      try {
        const response = await fetch(
          `/api/user/check?field=empID&value=${encodeURIComponent(form.empID)}`,
        );
        const data = await response.json();

        if (data.exists) {
          setEmpIDError("Employee ID already exists");
        }
      } catch {
        // Silent fail
      } finally {
        setCheckingEmpID(false);
      }
    };

    const timeout = setTimeout(checkEmpID, 500);
    return () => clearTimeout(timeout);
  }, [form.empID, initialLoadedForm?.empID]);

  const handleBack = () => {
    router.push("/user");
  };

  const handleAddUser = () => {
    router.push("/user/create");
  };

  const handleEditUser = async (empID: string) => {
    setIsLoadingUser(true);
    setIsEditModalOpen(true);
    try {
      const response = await fetch(
        `/api/user/detail?empID=${encodeURIComponent(empID)}`,
        {
          cache: "no-store",
        },
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to load user details.");
        setIsEditModalOpen(false);
        return;
      }

      const user = data.user as ApiUserDetails;
      const mapped: FormState = {
        empID: user.empID?.trim() ?? "",
        username: user.username?.trim() || user.empID?.trim() || "",
        firstname: user.firstname?.trim() ?? "",
        middlename: user.middlename?.trim() ?? "",
        lastname: user.lastname?.trim() ?? "",
        suffix: user.suffix?.trim() ?? "",
        birthdate: user.birthdate ? new Date(user.birthdate) : undefined,
        age: user.age != null ? String(user.age) : "",
        sex: typeof user.sex === "boolean" ? user.sex : true,
        temp_pass: "",
        password: "",
        email: user.email?.trim() ?? "",
        phone: user.phone?.trim() ?? "",
        role_id: typeof user.role_id === "number" ? String(user.role_id) : "",
        department: user.department?.trim() ?? "",
        position: user.position?.trim() ?? "",
        status: typeof user.status === "boolean" ? user.status : true,
      };

      setForm(mapped);
      setInitialLoadedForm(mapped);
      setEmpIDError(null);
      setValidationErrors({});
    } catch {
      toast.error("Connection error. Failed to load user details.");
      setIsEditModalOpen(false);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleCloseEditModal = () => {
    if (isSaving) return;
    setIsEditModalOpen(false);
    setForm(initialFormState);
    setValidationErrors({});
  };

  const hasFormChanges = useMemo(() => {
    if (!initialLoadedForm) return true;

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
  }, [form, initialLoadedForm]);

  const handleSaveUser = async () => {
    if (isLoadingUser || isSaving) return;

    if (!hasFormChanges) {
      toast.error("No changes detected.");
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

    setIsSaving(true);
    try {
      const payload = {
        originalEmpID: initialLoadedForm?.empID ?? form.empID,
        empID: form.empID,
        username: form.username,
        firstname: form.firstname,
        middlename: form.middlename,
        lastname: form.lastname,
        suffix: form.suffix,
        birthdate: form.birthdate ? format(form.birthdate, "yyyy-MM-dd") : null,
        age: form.age,
        sex: form.sex,
        email: form.email,
        phone: form.phone,
        role_id: Number(form.role_id),
        department: form.department,
        position: form.position,
        status: form.status,
        ...(form.temp_pass && form.password
          ? { temp_pass: form.temp_pass, password: form.password }
          : {}),
      };

      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update user.");
        return;
      }

      toast.success(data.message || "User updated successfully.");

      // Refresh table
      setUsers((prev) =>
        prev.map((u) => {
          if (u.empID === (initialLoadedForm?.empID ?? form.empID)) {
            const fullname = [
              form.firstname.trim(),
              form.middlename.trim(),
              form.lastname.trim(),
              form.suffix.trim(),
            ]
              .filter(Boolean)
              .join(" ");

            return {
              empID: form.empID,
              name: fullname,
              role:
                roles.find((r) => String(r.id) === form.role_id)?.name ??
                u.role,
              status: form.status ? "Active" : "Inactive",
              email: form.email,
              sex: form.sex,
            } as ListedUser;
          }
          return u;
        }),
      );

      setIsEditModalOpen(false);
    } catch {
      toast.error("Connection error. Failed to save user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (empID: string, name: string) => {
    const shortName = name.length > 20 ? name.substring(0, 20) + "..." : name;

    const confirmed = await confirmDelete(shortName);
    if (!confirmed) return;

    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // SEND THE FULL empID HERE - No substring!
        body: JSON.stringify({ empID: empID }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Unable to delete user", {
          description: data.error || "An error occurred.",
        });
        return;
      }

      // Update local state and show success
      setUsers((prev) => prev.filter((user) => user.empID !== empID));
      toast.success(`${shortName} has been deleted.`);
    } catch (err) {
      toast.error("Connection Error", {
        description: "Unable to connect to server.",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "avatar",
        header: "",
        cell: ({ row }: any) => {
          const isMale: boolean = row.original.sex !== false;
          return (
            <div className="flex justify-center">
              <img
                src={isMale ? "/avatars/men.png" : "/avatars/female.png"}
                alt={isMale ? "Male" : "Female"}
                className="h-8 w-8 rounded-full object-cover border border-gray-200"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "empID",
        header: "Employee ID",
        cell: ({ row }: any) => (
          <div className="font-mono text-xs font-medium text-slate-500">
            {row.original.empID}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }: any) => (
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            {row.original.role}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => {
          const status = row.original.status;
          return (
            <span
              className={`rounded px-2 py-1 text-xs ${
                status === "Active"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }: any) => {
          const user = row.original;
          return (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className={`font-inter inline-flex items-center gap-2 rounded border border-gray-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-gray-50 cursor-pointer`}
              >
                <Activity className="h-3.5 w-3.5" />
                View Log
              </button>
              <button
                type="button"
                onClick={() => handleEditUser(user.empID)}
                className={`font-inter inline-flex items-center gap-2 rounded border border-gray-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-gray-50 cursor-pointer`}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(user.empID, user.name)}
                className={`font-inter inline-flex items-center gap-2 rounded border border-gray-200 px-3 py-1.5 text-xs text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  // --- 4. Updated Hook to include the Filter logic ---
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    state: {
      globalFilter,
    },
  });

  return (
    <div className="flex w-full overflow-x-hidden">
      <main className="flex-1 w-full">
        {/* Page Header */}
        <header className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/user")}
            className="font-lexend mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to User Management
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-lexend text-2xl font-bold text-[#595a5d]">
                View Users
              </h1>
              <p className="font-inter mt-1 text-xs text-slate-400">
                Review user accounts, assigned roles, and account status.
              </p>
            </div>
            <button
              onClick={handleAddUser}
              className="font-lexend h-10 rounded bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800 cursor-pointer"
            >
              Add New User
            </button>
          </div>
        </header>

        {/* Main Section Style (referenced from OR Logs) */}
        <section className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <UsersRound className="h-5 w-5 text-[#00154A]" />
              </div>
              <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                User Directory
              </h2>
            </div>

            {/* Search Integrated into the section header row */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search users..."
                className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-sm font-inter outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          <TableContainer>
            <Table className="min-w-155">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-10 text-center text-slate-400"
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-10 text-center text-slate-400"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === "name"
                              ? "text-slate-700 font-medium"
                              : ""
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="font-inter text-xs text-slate-500">
              Page{" "}
              <span className="font-medium text-slate-900">
                {table.getState().pagination.pageIndex + 1}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-900">
                {table.getPageCount()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="inline-flex h-8 items-center rounded border border-gray-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="mr-1 h-3 w-3" /> Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="inline-flex h-8 items-center rounded border border-gray-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Next <ChevronRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-xl">
          <div className="flex flex-col max-h-[85vh] bg-white">
            {/* Fixed Header */}
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="font-lexend text-xl font-bold text-[#0F172A]">
                Edit User
              </DialogTitle>
              <DialogDescription className="font-inter text-sm text-slate-500">
                Update user information and account settings. Click save to
                apply changes.
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth">
              {isLoadingUser ? (
                <div className="py-12 text-center text-slate-400 font-inter text-sm">
                  Loading user data...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <ValidatedInput
                        label="Emp ID"
                        required
                        value={form.empID}
                        maxLength={9}
                        validator="employee-Id"
                        type="employee-Id"
                        onChange={(v, isValid) =>
                          updateField("empID", v, isValid)
                        }
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
                      <div className="pt-2">
                        <label className="font-inter text-xs font-medium text-slate-600 block mb-1">
                          Suffix
                        </label>
                        <Combobox
                          options={SuffixOptions.map((s) => ({
                            value: s,
                            label: s,
                          }))}
                          value={form.suffix}
                          onChange={(val) => updateField("suffix", val)}
                          placeholder="Select suffix"
                          searchPlaceholder="Search suffix..."
                          triggerClassName="h-9 text-xs"
                        />
                      </div>
                      <div className="pt-2.5">
                        <label className="font-inter text-xs font-medium text-slate-600 block mb-1">
                          Birthdate <span className="text-rose-500">*</span>
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full h-9 justify-start text-left font-normal cursor-pointer text-xs"
                            >
                              <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                              {form.birthdate ? (
                                format(form.birthdate, "yyyy-MM-dd")
                              ) : (
                                <span className="text-slate-400">
                                  Pick a date
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              disabled={(date) => date > new Date()}
                              mode="single"
                              selected={form.birthdate}
                              onSelect={(date) =>
                                updateField("birthdate", date)
                              }
                              fromYear={1950}
                              toYear={new Date().getFullYear()}
                              initialFocus
                              className="bg-white border rounded-lg shadow-xl"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Field
                        label="Age"
                        required
                        readOnly
                        value={form.age}
                        onChange={(v) => updateField("age", v)}
                      />
                      <div>
                        <label className="font-inter text-xs font-medium text-slate-600 block mb-1">
                          Sex <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <BooleanChip
                            label="Male"
                            checked={form.sex}
                            onClick={() => updateField("sex", true)}
                          />
                          <BooleanChip
                            label="Female"
                            checked={!form.sex}
                            onClick={() => updateField("sex", false)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Professional Details */}
                  <div>
                    <h3 className="font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Contact & Professional Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <ValidatedInput
                        label="Email"
                        type="email"
                        required
                        value={form.email}
                        leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                        onChange={(v, isValid) =>
                          updateField("email", v, isValid)
                        }
                      />
                      <ValidatedInput
                        label="Phone"
                        type="phone"
                        required
                        value={form.phone}
                        leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
                        onChange={(v, isValid) =>
                          updateField("phone", v, isValid)
                        }
                      />
                      <div className="pt-2.5">
                        <label className="font-inter text-xs font-medium text-slate-600 block mb-1">
                          Role <span className="text-rose-500">*</span>
                        </label>
                        <Combobox
                          options={roles.map((r) => ({
                            value: String(r.id),
                            label: r.name,
                          }))}
                          value={form.role_id}
                          onChange={(val) => updateField("role_id", val)}
                          placeholder="Select role"
                          searchPlaceholder="Search role..."
                          triggerClassName="h-9 text-xs"
                        />
                      </div>
                      <Field
                        label="Department"
                        required
                        value={form.department}
                        leftIcon={
                          <Building2 className="h-4 w-4 text-slate-400" />
                        }
                        onChange={(v) => updateField("department", v)}
                      />
                      <Field
                        label="Position"
                        required
                        value={form.position}
                        onChange={(v) => updateField("position", v)}
                      />
                      <div className="pt-2.5">
                        <label className="font-inter text-xs font-medium text-slate-600 block mb-1">
                          Status <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <BooleanChip
                            label="Active"
                            checked={form.status}
                            onClick={() => updateField("status", true)}
                          />
                          <BooleanChip
                            label="Inactive"
                            checked={!form.status}
                            onClick={() => updateField("status", false)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security (Credentials) */}
                  <div>
                    <h3 className="font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Security Credentials (Optional)
                    </h3>
                    <p className="font-inter text-[10px] text-slate-400 mb-3">
                      Only fill if you want to reset the user's password.
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <PasswordField
                        label="Temp Pass"
                        value={form.temp_pass}
                        show={showTempPassword}
                        onToggle={() => setShowTempPassword((v) => !v)}
                        onChange={(v) => updateField("temp_pass", v)}
                      />
                      <PasswordField
                        label="Password"
                        value={form.password}
                        show={showPassword}
                        onToggle={() => setShowPassword((v) => !v)}
                        onChange={(v) => updateField("password", v)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer Actions */}
            <div className="p-6 pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <DialogClose asChild>
                <button
                  type="button"
                  className="font-inter px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="button"
                disabled={
                  isSaving ||
                  !hasFormChanges ||
                  !!empIDError ||
                  checkingEmpID ||
                  Object.values(validationErrors).some((v) => v)
                }
                onClick={handleSaveUser}
                className="font-inter h-10 inline-flex items-center gap-2 rounded bg-[#0F172A] px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <FilePenLine className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
