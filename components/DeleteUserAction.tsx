import Swal from "sweetalert2";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

export { Swal };

/**
 * Show a custom styled delete success dialog.
 */
export async function showDeleteSuccess(name: string, target?: string | HTMLElement) {
  const checkIcon = renderToStaticMarkup(
    <CheckCircle2 size={14} className="text-emerald-500 mr-2" />,
  );
  await Swal.fire({
    target: target || "body",
    width: 300,
    html: `
      <div class="text-left">
        <h2 class="font-lexend text-lg font-semibold text-[#0F172A] mb-2">
          User Deleted
        </h2>
        <p class="font-inter text-sm text-slate-500 mb-4">
          <span class="font-lexend font-semibold text-[#0F172A]">${name}</span>
          <br>has been successfully removed.
        </p>
        <div class="flex items-start font-inter text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
            ${checkIcon}
            <span>User account deleted.</span>
        </div>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: "OK",
    buttonsStyling: false,
    background: "#ffffff",
    customClass: {
      popup: "rounded-xl p-6 shadow-lg",
      confirmButton:
        "bg-[#0F172A] text-white text-xs font-inter px-4 py-2 rounded-md hover:bg-slate-800 transition",
    },
    didOpen: (popup: any) => {
      popup.style.zIndex = "10000";
      const container = (Swal as any).getContainer();
      if (container) container.style.zIndex = "10000";
    },
  });
}

/**
 * Show a generic error dialog with an optional title.
 */
export async function showError(message: string, title = "Error", target?: string | HTMLElement) {
  await Swal.fire({
    target: target || "body",
    icon: "error",
    title,
    text: message,
    didOpen: (popup: any) => {
      popup.style.zIndex = "10000";
      const container = (Swal as any).getContainer();
      if (container) container.style.zIndex = "10000";
    },
  });
}

/**
 * Show a confirmation dialog for deleting an entity and return whether the
 * user confirmed the action.
 * 
 * @param name - The name/identifier of the entity to delete
 * @param entityType - The type of entity being deleted (default: "User")
 */
export async function confirmDelete(name: string, entityType = "User", target?: string | HTMLElement): Promise<boolean> {
  const cautionIcon = renderToStaticMarkup(
    <AlertTriangle size={14} className="text-rose-500 mr-2" />,
  );
  const result = await Swal.fire({
    target: target || "body",
    width: 300,
    html: `
      <div class="text-left">
        <h2 class="font-lexend text-lg font-semibold text-[#0F172A] mb-2">
          Delete ${entityType}?
        </h2>
        <p class="font-inter text-sm text-slate-500 mb-4">
          You are about to remove 
          <span class="font-lexend font-semibold text-[#0F172A]"><br>${name}</span>.
        </p>
        <div class="flex items-start font-inter text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
            ${cautionIcon}
            <span>This action cannot be undone.</span>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: `Delete ${entityType}`,
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    background: "#ffffff",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-xl p-6 shadow-lg",
      confirmButton:
        "cursor-pointer bg-[#0F172A] text-white text-xs font-inter px-4 py-2 rounded-md hover:bg-slate-800 transition",
      cancelButton:
        "cursor-pointer border border-gray-200 text-slate-600 text-xs font-inter px-4 py-2 rounded-md hover:bg-gray-50 transition mr-2",
    },
    didOpen: (popup: any) => {
      popup.style.zIndex = "10000";
      const container = (Swal as any).getContainer();
      if (container) container.style.zIndex = "10000";
    },
  });

  return result.isConfirmed;
}

/**
 * Show a confirmation dialog for archiving an entity and return whether the
 * user confirmed the action.
 */
export async function confirmArchive(name: string, entityType = "Record", target?: string | HTMLElement): Promise<boolean> {
  const cautionIcon = renderToStaticMarkup(
    <AlertTriangle size={14} className="text-blue-500 mr-2" />,
  );

  const result = await Swal.fire({
    target: target || "body",
    width: 300,
    html: `
      <div class="text-left">
        <h2 class="font-lexend text-lg font-semibold text-[#0F172A] mb-2">
          Archive ${entityType}?
        </h2>
        <p class="font-inter text-sm text-slate-500 mb-4">
          You are about to archive
          <span class="font-lexend font-semibold text-[#0F172A]"><br>${name}</span>.
        </p>
        <div class="flex items-start font-inter text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
            ${cautionIcon}
            <span>You can keep this as historical data.</span>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: `Archive ${entityType}`,
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    background: "#ffffff",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-xl p-6 shadow-lg",
      confirmButton:
        "bg-[#0F172A] text-white text-xs font-inter px-4 py-2 rounded-md hover:bg-slate-800 transition cursor-pointer",
      cancelButton:
        "cursor-pointer border border-gray-200 text-slate-600 text-xs font-inter px-4 py-2 rounded-md hover:bg-gray-50 transition mr-2",
    },
    didOpen: (popup: any) => {
      popup.style.zIndex = "10000";
      const container = (Swal as any).getContainer();
      if (container) container.style.zIndex = "10000";
    },
  });

  return result.isConfirmed;
}

/**
 * Show a confirmation dialog for restoring an archived entity and return
 * whether the user confirmed the action.
 */
export async function confirmRestore(name: string, entityType = "Record", target?: string | HTMLElement): Promise<boolean> {
  const cautionIcon = renderToStaticMarkup(
    <AlertTriangle size={14} className="text-emerald-500 mr-2" />,
  );

  const result = await Swal.fire({
    target: target || "body",
    width: 300,
    html: `
      <div class="text-left">
        <h2 class="font-lexend text-lg font-semibold text-[#0F172A] mb-2">
          Restore ${entityType}?
        </h2>
        <p class="font-inter text-sm text-slate-500 mb-4">
          You are about to restore
          <span class="font-lexend font-semibold text-[#0F172A]"><br>${name}</span>.
        </p>
        <div class="flex items-start font-inter text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
            ${cautionIcon}
            <span>This will make it active again.</span>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: `Restore ${entityType}`,
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    background: "#ffffff",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-xl p-6 shadow-lg",
      confirmButton:
        "bg-[#0F172A] text-white text-xs font-inter px-4 py-2 rounded-md hover:bg-slate-800 transition cursor-pointer",
      cancelButton:
        "cursor-pointer border border-gray-200 text-slate-600 text-xs font-inter px-4 py-2 rounded-md hover:bg-gray-50 transition mr-2",
    },
    didOpen: (popup: any) => {
      popup.style.zIndex = "10000";
      const container = (Swal as any).getContainer();
      if (container) container.style.zIndex = "10000";
    },
  });

  return result.isConfirmed;
}
