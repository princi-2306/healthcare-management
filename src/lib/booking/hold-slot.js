import dbConnect from "../db";
import Slot from "../../models/Slot";
import SlotHold from "../../models/SlotHold";

const HOLD_DURATION_MINUTES = 10; // Hold expires after 10 minutes

/**
 * Create a temporary hold on a slot to prevent double-booking during checkout.
 * Uses MongoDB TTL index for automatic cleanup.
 */
export async function holdSlot({ slotId, patientId }) {
  await dbConnect();

  // Check if slot is available
  const slot = await Slot.findById(slotId);
  if (!slot) {
    return { success: false, error: "Slot not found" };
  }

  if (slot.status !== "available") {
    return { success: false, error: "Slot is no longer available" };
  }

  // Check for existing hold
  const existingHold = await SlotHold.findOne({ slotId });
  if (existingHold) {
    if (existingHold.patientId.toString() === patientId) {
      return { success: true, hold: existingHold, message: "You already hold this slot" };
    }
    return { success: false, error: "Slot is currently held by another patient" };
  }

  // Create hold with TTL expiration
  const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);

  try {
    const hold = await SlotHold.create({
      slotId,
      patientId,
      expiresAt,
    });

    // Update slot status to held
    await Slot.findByIdAndUpdate(slotId, { status: "held" });

    return { success: true, hold, expiresAt };
  } catch (error) {
    // Handle race condition (duplicate key)
    if (error.code === 11000) {
      return { success: false, error: "Slot was just held by another patient" };
    }
    throw error;
  }
}

/**
 * Release a slot hold manually
 */
export async function releaseHold({ slotId, patientId }) {
  await dbConnect();

  const hold = await SlotHold.findOneAndDelete({ slotId, patientId });
  if (hold) {
    await Slot.findByIdAndUpdate(slotId, { status: "available" });
    return { success: true };
  }
  return { success: false, error: "No hold found" };
}
