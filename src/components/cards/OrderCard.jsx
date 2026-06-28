"use client";

import { useRouter } from "next/navigation";
import { ORDER_STATUS_COLORS, formatOrderStatus } from "@/lib/orderStatus";

const btnClass =
  "text-sm bg-black text-white font-semibold px-4 py-2 cursor-pointer rounded-lg hover:bg-[#FF6A00] transition";

export default function OrderCard({ order, onTrack }) {
  const router = useRouter();

  return (
    <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6">
      <div className="flex justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="text-xs text-gray-500 uppercase">Order #</div>
          <div className="font-mono text-sm font-semibold">{order.orderNumber}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase">Date</div>
          <div className="text-sm">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase">Total</div>
          <div className="font-semibold">£{order.total.toFixed(2)}</div>
        </div>
        <div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium
            ${ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}
          >
            {formatOrderStatus(order.status)}
          </span>
        </div>
      </div>

      <div className="border-t pt-4 mb-4 space-y-1 text-sm text-gray-600">
        {order.items.slice(0, 2).map((item, i) => (
          <div key={i}>
            {item.title} × {item.quantity}
          </div>
        ))}
        {order.items.length > 2 && (
          <div className="text-xs text-gray-400">
            +{order.items.length - 2} more items
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 flex-wrap">
        <button type="button" onClick={() => onTrack(order)} className={btnClass}>
          Track My Order
        </button>
        <button
          type="button"
          onClick={() => router.push(`/account/orders/${order._id}`)}
          className={btnClass}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
