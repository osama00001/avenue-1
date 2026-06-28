"use client";

import { memo } from "react";
import {
  Check,
  Copy,
  CreditCard,
  Package,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";
import { formatOrderStatus, resolveTrackingStepStates } from "@/lib/orderStatus";

const STEP_ICONS = {
  placed: CreditCard,
  processing: Package,
  shipped: Truck,
  returned: RotateCcw,
  cancelled: XCircle,
  refunded: CreditCard,
};

const TERMINAL_IDS = new Set(["returned", "cancelled", "refunded"]);

function stepLabel(step) {
  const short = {
    placed: "Placed",
    processing: "Processing",
    shipped: "Shipped",
    returned: "Returned",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return short[step.id] || step.title.split(" / ")[0];
}

function StepNode({ step, index, isLast }) {
  const Icon = STEP_ICONS[step.id];
  const { state } = step;

  let nodeClass =
    "relative z-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 w-9 h-9 sm:w-10 sm:h-10 ";
  let connectorClass = "h-0.5 w-6 sm:w-8 md:w-10 flex-shrink-0 transition-all duration-500 ";
  const iconSize = "w-3.5 h-3.5 sm:w-4 sm:h-4";

  if (state === "completed") {
    nodeClass += "bg-black border-black text-white shadow-md";
    connectorClass += "bg-black";
  } else if (state === "current") {
    nodeClass +=
      "bg-[#FF6A00] border-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/30 ring-2 ring-[#FF6A00]/20";
    connectorClass += "bg-gradient-to-r from-[#FF6A00] to-gray-200";
  } else if (state === "upcoming") {
    nodeClass += "bg-white border-gray-300 text-gray-400";
    connectorClass += "bg-gray-200";
  } else if (state === "alternate") {
    nodeClass += "bg-gray-50 border-dashed border-gray-300 text-gray-300";
    connectorClass += "bg-gray-100";
  } else if (state === "skipped") {
    nodeClass += "bg-gray-100 border-gray-200 text-gray-300";
    connectorClass += "bg-gray-200";
  } else {
    nodeClass += "bg-gray-50 border-gray-200 text-gray-300";
    connectorClass += "bg-gray-100";
  }

  return (
    <div className="flex items-center flex-shrink-0">
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[72px] sm:w-[80px]">
        <div className={nodeClass}>
          {state === "completed" ? (
            <Check className={iconSize} strokeWidth={3} />
          ) : state === "current" ? (
            <>
              <Icon className={iconSize} />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF6A00] rounded-full animate-ping opacity-75" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF6A00] rounded-full" />
            </>
          ) : (
            <Icon className={iconSize} />
          )}
        </div>
        <p
          className={`text-[9px] sm:text-[10px] font-semibold text-center leading-tight px-0.5 ${
            state === "current"
              ? "text-[#FF6A00]"
              : state === "completed"
                ? "text-gray-800"
                : state === "alternate"
                  ? "text-gray-300"
                  : "text-gray-400"
          }`}
        >
          {stepLabel(step)}
        </p>
      </div>
      {!isLast && <div className={`${connectorClass} mb-4 sm:mb-5`} />}
    </div>
  );
}

function getProgress(orderStatus) {
  const idx = { placed: 0, processing: 1, shipped: 2, delivered: 2, returned: 3, cancelled: 4, refunded: 5 }[orderStatus] ?? 0;
  return Math.round(((idx + 1) / 6) * 100);
}

export default memo(function OrderTrackingWizard({ order }) {
  const steps = resolveTrackingStepStates(order.status);
  const activeTerminal = TERMINAL_IDS.has(order.status);
  const currentStep = steps.find((s) => s.state === "current") || steps[0];
  const CurrentIcon = STEP_ICONS[currentStep.id];
  const tracking = order.gardnersFulfilment;
  const hasTracking = tracking?.trackingNumber;
  const progress = getProgress(order.status);

  const placedDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white p-5 sm:p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6A00]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-1">Order Number</p>
            <p className="font-mono text-xl sm:text-2xl font-bold tracking-wide">{order.orderNumber}</p>
            <p className="text-sm text-gray-400 mt-1">Placed on {placedDate}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-sm font-medium border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse" />
              {formatOrderStatus(order.status)}
            </span>
            <p className="text-xs text-gray-500">{progress}% complete</p>
          </div>
        </div>
        <div className="relative mt-5 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF6A00]/70 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm overflow-x-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Order Progress — All Steps
        </p>
        <div className="flex items-start min-w-max mx-auto justify-center px-1">
          {steps.map((step, i) => (
            <StepNode key={step.id} step={step} index={i} isLast={i === steps.length - 1} />
          ))}
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-3">
          Steps 4–6 apply only if your order is returned, cancelled, or refunded
        </p>
      </div>

      <div
        className={`rounded-2xl border-2 p-5 sm:p-6 transition-colors ${
          activeTerminal
            ? order.status === "cancelled"
              ? "border-red-200 bg-red-50/50"
              : order.status === "returned"
                ? "border-orange-200 bg-orange-50/50"
                : "border-purple-200 bg-purple-50/50"
            : "border-[#FF6A00]/20 bg-gradient-to-br from-orange-50/80 to-white"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              activeTerminal
                ? order.status === "cancelled"
                  ? "bg-red-100 text-red-600"
                  : order.status === "returned"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-purple-100 text-purple-600"
                : "bg-[#FF6A00]/10 text-[#FF6A00]"
            }`}
          >
            <CurrentIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{currentStep.title}</h3>
              <span className="inline-flex items-center rounded-full bg-[#FF6A00] text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5">
                Current
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{currentStep.subtitle}</p>
          </div>
        </div>
      </div>

      {hasTracking && (
        <div className="rounded-2xl border bg-gray-50 p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Shipment Tracking
          </p>
          <div className="space-y-1">
            {tracking.carrier && (
              <p className="text-sm">
                <span className="text-gray-500">Carrier</span>{" "}
                <span className="font-semibold text-gray-900">{tracking.carrier}</span>
              </p>
            )}
            <p className="text-sm flex items-center gap-2">
              <span className="text-gray-500">Tracking #</span>
              <span className="font-mono font-semibold text-gray-900">{tracking.trackingNumber}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(tracking.trackingNumber)}
                className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition cursor-pointer"
                title="Copy tracking number"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </p>
          </div>
        </div>
      )}

      {order.status === "placed" && order.payment?.status === "pending" && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <span className="text-amber-500 text-lg leading-none">!</span>
          <p className="text-sm text-amber-800 leading-relaxed">
            Payment is pending. Your order will move to processing once payment is confirmed.
          </p>
        </div>
      )}
    </div>
  );
});
