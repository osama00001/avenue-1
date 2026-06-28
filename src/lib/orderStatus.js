/** Shared order tracking steps — used by customer wizard and admin panel. */
export const ORDER_TRACKING_STEPS = [
  {
    id: "placed",
    title: "Order Placed",
    subtitle: "Payment received",
  },
  {
    id: "processing",
    title: "Order Processing",
    subtitle: "We are preparing your order",
  },
  {
    id: "shipped",
    title: "Order Shipped / Complete",
    subtitle: "Your order is on its way or delivered",
  },
  {
    id: "returned",
    title: "Order Returned",
    subtitle: "Your return has been processed",
  },
  {
    id: "cancelled",
    title: "Order Cancelled",
    subtitle: "This order was cancelled",
  },
  {
    id: "refunded",
    title: "Order Refunded",
    subtitle: "Your refund has been issued",
  },
];

export const ORDER_STATUS_VALUES = ORDER_TRACKING_STEPS.map((s) => s.id);

export const ORDER_STATUS_ENUM = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
  "refunded",
];

export const TERMINAL_ORDER_STATUSES = new Set([
  "returned",
  "cancelled",
  "refunded",
]);

export const ORDER_STATUS_LABELS = {
  placed: "Order Placed",
  processing: "Order Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const ORDER_STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  returned: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

const STATUS_TO_STEP_INDEX = {
  placed: 0,
  processing: 1,
  shipped: 2,
  delivered: 2,
  returned: 3,
  cancelled: 4,
  refunded: 5,
};

export function resolveTrackingStepStates(orderStatus) {
  const currentIdx = STATUS_TO_STEP_INDEX[orderStatus] ?? 0;
  const isTerminal = TERMINAL_ORDER_STATUSES.has(orderStatus);
  const happyPathMax = 2;

  return ORDER_TRACKING_STEPS.map((step, idx) => {
    if (isTerminal) {
      if (idx === currentIdx) return { ...step, state: "current" };
      if (orderStatus === "returned" && idx < 3) return { ...step, state: "completed" };
      if (orderStatus === "refunded" && idx < 3) return { ...step, state: "completed" };
      if (orderStatus === "cancelled") {
        if (idx === 0) return { ...step, state: "completed" };
        if (idx < currentIdx) return { ...step, state: "skipped" };
      }
      if (idx !== currentIdx) return { ...step, state: "alternate" };
      return { ...step, state: "alternate" };
    }

    if (idx > happyPathMax) return { ...step, state: "alternate" };
    if (idx < currentIdx) return { ...step, state: "completed" };
    if (idx === currentIdx) return { ...step, state: "current" };
    return { ...step, state: "upcoming" };
  });
}

export function formatOrderStatus(status) {
  return ORDER_STATUS_LABELS[status] || status;
}
