// app/user/security/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Lock,
  KeyRound,
  Smartphone,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="w-full">
      {/* Header */}
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
              Security Settings
            </h1>
            <p className="font-inter mt-1 text-xs text-slate-400">
              Configure password policies, session controls, and multi-factor
              authentication.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/user"
              className="font-inter inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="button"
              className="font-inter inline-flex items-center gap-2 rounded-md bg-[#0F172A] px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              onClick={() => {
                // design-only
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Password Policy */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <Lock className="h-5 w-5 text-[#00154A]" />
              </div>
              <div>
                <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                  Password Policy
                </h2>
                <p className="font-inter text-xs text-slate-400">
                  Enforce strong passwords and periodic rotation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Minimum Length"
                type="number"
                placeholder="12"
                helper="Recommended: 12+ characters"
                rightAddon="chars"
              />
              <Field
                label="Password Expiry"
                type="number"
                placeholder="90"
                helper="Force password change after X days"
                rightAddon="days"
              />
              <ToggleRow
                title="Require Uppercase & Lowercase"
                description="Passwords must contain both uppercase and lowercase letters."
                defaultChecked
              />
              <ToggleRow
                title="Require Numbers"
                description="Passwords must include at least one number."
                defaultChecked
              />
              <ToggleRow
                title="Require Special Characters"
                description="Passwords must include at least one symbol (e.g., ! @ #)."
                defaultChecked
              />
              <ToggleRow
                title="Prevent Reuse of Last Passwords"
                description="Disallow reuse of recently used passwords."
                defaultChecked
              />
            </div>

            <div className="mt-4 rounded-md border border-amber-100 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-inter text-xs font-medium text-amber-800">
                    Reminder
                  </div>
                  <div className="font-inter text-xs text-amber-700">
                    Strong password rules reduce unauthorized access and improve
                    audit compliance.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Session Control */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <Timer className="h-5 w-5 text-[#00154A]" />
              </div>
              <div>
                <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                  Session Control
                </h2>
                <p className="font-inter text-xs text-slate-400">
                  Manage session duration and idle timeout behavior.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Idle Timeout"
                type="number"
                placeholder="15"
                helper="Auto-logout after inactivity"
                rightAddon="mins"
              />
              <Field
                label="Max Session Duration"
                type="number"
                placeholder="8"
                helper="Maximum login duration"
                rightAddon="hrs"
              />
              <ToggleRow
                title="Single Active Session"
                description="Prevent the same account from being logged in multiple devices."
              />
              <ToggleRow
                title="Lock Account After Failed Attempts"
                description="Temporarily lock user after repeated failed logins."
                defaultChecked
              />
              <Field
                label="Failed Attempts Limit"
                type="number"
                placeholder="5"
                helper="Lock after X failed attempts"
              />
              <Field
              label="Lock Duration"
                type="number"
                placeholder="30"
                helper="Unlock after X minutes"
                rightAddon="mins"
              />
            </div>
          </section>

          {/* MFA */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <Smartphone className="h-5 w-5 text-[#00154A]" />
              </div>
              <div>
                <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                  Multi-Factor Authentication (MFA)
                </h2>
                <p className="font-inter text-xs text-slate-400">
                  Add an extra layer of protection for sensitive modules.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <ToggleRow
                title="Enable MFA"
                description="Require a second step verification on login."
              />
              <ToggleRow
                title="Require MFA for Admin Role"
                description="Always enforce MFA for Admin users."
                defaultChecked
              />
              <ToggleRow
                title="Require MFA for Treasurer Module"
                description="Enforce MFA when accessing collections and payment approvals."
              />
            </div>

            <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3">
              <div className="font-inter text-xs font-medium text-blue-700">
                Tip: Start with Admin-only MFA
              </div>
              <div className="font-inter mt-1 text-xs text-blue-600">
                You can expand MFA enforcement later per module as policies
                mature.
              </div>
            </div>
          </section>

          {/* Change Password (Design) */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <KeyRound className="h-5 w-5 text-[#00154A]" />
              </div>
              <div>
                <h2 className="font-lexend text-sm font-semibold text-[#848794]">
                  Change Password (Admin Override)
                </h2>
                <p className="font-inter text-xs text-slate-400">
                  Design-only form — wire it to backend later.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PasswordField
                label="Current Password"
                placeholder="••••••••"
                show={showCurrent}
                onToggle={() => setShowCurrent((v) => !v)}
              />
              <div className="hidden sm:block" />
              <PasswordField
                label="New Password"
                placeholder="••••••••"
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
              />
              <PasswordField
                label="Confirm New Password"
                placeholder="••••••••"
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="font-inter rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                type="button"
                className="font-inter rounded-md bg-[#0F172A] px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Update Password
              </button>
            </div>
          </section>
        </div>

        {/* Right: Summary / Status */}
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <Accordion type="multiple" className="w-full">
              {/* Security Overview */}
              <AccordionItem value="overview" className="border-b border-gray-100 last:border-0 text-[#00154A]">
                <AccordionTrigger className="cursor-pointer px-6 py-3 hover:no-underline">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="rounded-md bg-slate-100 p-1.5">
                      <Shield className="h-4 w-4 text-[#00154A]" />
                    </div>
                    <div>
                      <h2 className="font-lexend text-xs font-semibold text-[#595a5d]">
                        Security Overview
                      </h2>
                      <p className="font-inter text-[10px] text-slate-400">
                        Quick policy summary
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <SummaryRow label="Password Policy" value="Configured" ok />
                    <SummaryRow label="Session Timeout" value="Configured" ok />
                    <SummaryRow label="MFA" value="Optional" />
                    <SummaryRow label="Account Lockout" value="Enabled" ok />
                  </div>

                  <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 p-3">
                    <div className="font-inter text-[11px] font-bold uppercase tracking-wider text-slate-900">
                      Recommended Baseline
                    </div>
                    <ul className="font-inter mt-2 space-y-2 text-xs text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Minimum length 12, special characters required
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Idle timeout 15 mins, session max 8 hrs
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        MFA enforced for Admin role
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Notes */}
              <AccordionItem value="notes" className="border-none text-[#00154A]">
                <AccordionTrigger className="cursor-pointer px-6 py-3 hover:no-underline">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="rounded-md bg-slate-100 p-1.5">
                      <AlertTriangle className="h-4 w-4 text-[#00154A]" />
                    </div>
                    <div>
                      <h2 className="font-lexend text-xs font-semibold text-[#595a5d]">
                        Implementation Notes
                      </h2>
                      <p className="font-inter text-[10px] text-slate-400">
                        Technical reminders
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div className="pt-4 border-t border-slate-50">
                    <p className="font-inter text-xs text-slate-500 leading-relaxed">
                      This page is design-only. When you add auth, apply policies on the
                      server (middleware + session validation) for real security.
                    </p>

                    <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-100 bg-amber-50 p-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-inter text-xs font-medium text-amber-800">
                          Important
                        </div>
                        <div className="font-inter text-xs text-amber-700">
                          Client-side UI does not prevent access. Enforce access rules
                          on the server.
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  helper,
  type = "text",
  rightAddon,
}: {
  label: string;
  placeholder?: string;
  helper?: string;
  type?: string;
  rightAddon?: string;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-slate-200">
        <input
          type={type}
          className="font-inter w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          placeholder={placeholder}
        />
        {rightAddon && (
          <span className="font-inter text-xs text-slate-400">{rightAddon}</span>
        )}
      </div>
      {helper && <p className="font-inter mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}

function PasswordField({
  label,
  placeholder,
  show,
  onToggle,
}: {
  label: string;
  placeholder?: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="font-inter text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-slate-200">
        <input
          type={show ? "text" : "password"}
          className="font-inter w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="rounded p-1 text-slate-500 hover:bg-gray-50 hover:text-slate-900"
          aria-label="Toggle password visibility"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-3">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-gray-300"
        defaultChecked={defaultChecked}
      />
      <div>
        <div className="font-inter text-sm font-medium text-slate-900">
          {title}
        </div>
        <div className="font-inter text-xs text-slate-500">{description}</div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-inter text-slate-500 text-sm">{label}</span>
      <span className="inline-flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-slate-300" />
        )}
        <span className="font-inter text-sm font-medium text-slate-900">
          {value}
        </span>
      </span>
    </div>
  );
}