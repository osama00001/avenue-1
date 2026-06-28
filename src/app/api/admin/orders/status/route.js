import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { requireAdminApi } from "@/lib/requireAdminApi";
import { ORDER_STATUS_ENUM } from "@/lib/orderStatus";

export async function PATCH(req) {
  try {
    const auth = await requireAdminApi(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { id, status } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    if (!status || !ORDER_STATUS_ENUM.includes(status)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    const update = { status };

    if (status === "refunded") {
      update["payment.status"] = "refunded";
      update["payment.refundedAt"] = new Date();
    }

    const order = await Order.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("[admin/orders/status PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
