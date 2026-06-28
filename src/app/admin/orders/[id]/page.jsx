"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import {
  fetchAdminOrderDetails,
  updateAdminOrderStatus,
} from "@/store/adminOrderSlice";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_VALUES,
  ORDER_TRACKING_STEPS,
  formatOrderStatus,
} from "@/lib/orderStatus";

const StatusBadge = ({ status }) => (
  <span
    className={`px-3 py-1 rounded-full text-sm font-medium ${
      ORDER_STATUS_COLORS[status] || "bg-gray-100"
    }`}
  >
    {formatOrderStatus(status)}
  </span>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <h2 className="font-semibold text-lg mb-4 text-gray-800">{title}</h2>
    {children}
  </div>
);

const AdminOrderDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [statusDraft, setStatusDraft] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const { selectedOrder, loading, updating } = useSelector((s) => s.adminOrders);

  useEffect(() => {
    if (id) dispatch(fetchAdminOrderDetails(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedOrder?.status) setStatusDraft(selectedOrder.status);
  }, [selectedOrder?.status]);

  const handleStatusUpdate = async () => {
    if (!selectedOrder || statusDraft === selectedOrder.status) return;
    setSaveMessage("");
    const result = await dispatch(
      updateAdminOrderStatus({ id: selectedOrder._id, status: statusDraft })
    );
    setSaveMessage(
      updateAdminOrderStatus.fulfilled.match(result)
        ? "Order status updated successfully."
        : "Failed to update order status."
    );
  };

  if (loading || !selectedOrder)
    return <div className="p-8">Loading order...</div>;

  const order = selectedOrder;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Order {order.orderNumber}</h1>
          <div className="mt-2">
            <StatusBadge status={order.status} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="border cursor-pointer px-4 py-2 rounded hover:bg-gray-100"
        >
          Back
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Items">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b text-gray-500 uppercase text-xs tracking-wide">
                    <th className="py-3 px-3 text-left w-[45%]">Title</th>
                    <th className="py-3 px-3 text-left w-[15%]">Type</th>
                    <th className="py-3 px-3 text-right w-[10%]">Qty</th>
                    <th className="py-3 px-3 text-right w-[15%]">Price</th>
                    <th className="py-3 px-3 text-right w-[15%]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => {
                    const title =
                      item.title ||
                      item?.book?.descriptiveDetail?.titles?.[0]?.text ||
                      "Untitled";
                    return (
                      <tr key={i} className="border-b last:border-none hover:bg-gray-50 transition">
                        <td className="py-3 px-3 font-medium text-gray-800">{title.slice(0, 50)}</td>
                        <td className="py-3 px-3 text-gray-600">{item.type}</td>
                        <td className="py-3 px-3 text-right tabular-nums">{item.quantity}</td>
                        <td className="py-3 px-3 text-right tabular-nums">£{item.price.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-semibold tabular-nums">
                          £{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Customer">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Name</div>
                <div>{order.user.firstName} {order.user.lastName}</div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div>{order.user.email}</div>
              </div>
            </div>
          </Section>

          <Section title="Shipping Address">
            <div className="text-sm space-y-1">
              <div>{order.shippingAddress.name}</div>
              <div>{order.shippingAddress.phone}</div>
              <div>{order.shippingAddress.line1}</div>
              {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
              <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
              <div>{order.shippingAddress.postalCode}</div>
              <div>{order.shippingAddress.country}</div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Update Order Status">
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Change the tracking step customers see on their order.
              </p>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                className="w-full border cursor-pointer px-3 py-2 rounded text-sm"
              >
                {ORDER_STATUS_VALUES.map((value) => {
                  const step = ORDER_TRACKING_STEPS.find((s) => s.id === value);
                  return (
                    <option key={value} value={value}>
                      {step?.title || formatOrderStatus(value)}
                    </option>
                  );
                })}
                <option value="delivered">Delivered (Complete)</option>
              </select>
              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={updating || statusDraft === order.status}
                className="w-full bg-black text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#FF6A00] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Saving..." : "Save Status"}
              </button>
              {saveMessage && (
                <p className={`text-sm ${saveMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {saveMessage}
                </p>
              )}
            </div>
          </Section>

          <Section title="Payment">
            <div className="space-y-2 text-sm">
              <div>Method: <strong>{order.payment.method}</strong></div>
              <div>Status: <strong>{order.payment.status.toUpperCase()}</strong></div>
              {order.payment.transactionId && <div>Txn: {order.payment.transactionId}</div>}
            </div>
          </Section>

          <Section title="Totals">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>£{order.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>£{order.shippingCost.toFixed(2)}</span></div>
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span><span>£{order.total.toFixed(2)}</span>
              </div>
            </div>
          </Section>

          {order.gardnersFulfilment?.trackingNumber && (
            <Section title="Shipping Tracking">
              <div className="text-sm space-y-1">
                {order.gardnersFulfilment.carrier && <div>Carrier: {order.gardnersFulfilment.carrier}</div>}
                <div className="font-mono">{order.gardnersFulfilment.trackingNumber}</div>
              </div>
            </Section>
          )}

          <Section title="Metadata">
            <div className="text-sm space-y-1">
              <div>Created: {new Date(order.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(order.updatedAt).toLocaleString()}</div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
