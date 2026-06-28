"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "@/store/orderSlice";
import { fetchUserDetails } from "@/store/userSlice";
import OrderCard from "@/components/cards/OrderCard";
import TrackOrderDialog from "@/components/orders/TrackOrderDialog";
import AdminHeader from "@/components/admin/AdminHeader";

const Page = () => {
  const dispatch = useDispatch();
  const [trackingOrder, setTrackingOrder] = useState(null);

  const userId = useSelector((s) => s.user.user?._id);
  const { loading, userOrders } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchUserDetails());
  }, [dispatch]);

  useEffect(() => {
    if (userId) dispatch(fetchUserOrders(userId));
  }, [userId, dispatch]);

  if (loading)
    return (
      <div className="p-12 text-center text-gray-500">Loading orders...</div>
    );

  if (!loading && userOrders?.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-3">📦</div>
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-gray-500">
            Once you place an order, it will appear here.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <AdminHeader title="Your Orders" />
        <div className="space-y-4">
          {userOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onTrack={setTrackingOrder}
            />
          ))}
        </div>
      </div>

      {trackingOrder && (
        <TrackOrderDialog
          order={trackingOrder}
          open
          onOpenChange={(open) => !open && setTrackingOrder(null)}
        />
      )}
    </div>
  );
};

export default Page;
