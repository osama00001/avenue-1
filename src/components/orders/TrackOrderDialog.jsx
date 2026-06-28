"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OrderTrackingWizard from "./OrderTrackingWizard";

export default function TrackOrderDialog({ order, open, onOpenChange }) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0"
        aria-describedby="track-order-description"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Track My Order</DialogTitle>
          <DialogDescription id="track-order-description">
            Follow your order progress step by step.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          {open && <OrderTrackingWizard order={order} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
