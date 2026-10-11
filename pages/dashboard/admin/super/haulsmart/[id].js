// pages/dashboard/admin/super/haulsmart/[id].js

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SuperAdminLayout from "@/components/layouts/SuperAdminLayout";
import styles from "@/styles/HaulSmart.module.css";



export default function HaulSmartBookingView() {
  const router = useRouter();
  const { id } = router.query;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      setLoading(true);
      // Live cross-product reads are disabled; use the local adapter demo.
      setBooking(null);
      setLoading(false);
    };

    fetchBooking();
  }, [id]);

  return (
    <SuperAdminLayout user={{ role: "super admin" }}>
      <h1 style={{ margin: "20px 0", fontSize: "28px", color: "#00c6ff" }}>
        🚚 HaulSmart Booking Details
      </h1>

      {loading ? (
        <p>Loading booking details...</p>
      ) : !booking ? (
        <p>Live Haulsmart access is disabled. <a href="/dashboard/freight-desk">Open the local mock freight desk</a>.</p>
      ) : (
        <div
          style={{
            background: "linear-gradient(135deg, #2a2a72, #009ffd)",
            padding: "20px",
            borderRadius: "10px",
            color: "white",
            maxWidth: "700px",
          }}
        >
          <h2>ID: {booking.id}</h2>
          <p>
            <strong>Origin:</strong> {booking.origin}
          </p>
          <p>
            <strong>Destination:</strong> {booking.destination}
          </p>
          <p>
            <strong>Cargo:</strong> {booking.cargo_type}
          </p>
          <p>
            <strong>Weight:</strong> {booking.weight}
          </p>
          <p>
            <strong>Miles:</strong> {booking.miles}
          </p>
          <p>
            <strong>Rate/Mile:</strong> £{booking.rate_per_mile}
          </p>
          <p>
            <strong>Vehicle:</strong> {booking.vehicle_type}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                background:
                  booking.status === "delivered"
                    ? "green"
                    : booking.status === "open"
                    ? "orange"
                    : "red",
                padding: "4px 8px",
                borderRadius: "6px",
              }}
            >
              {booking.status}
            </span>
          </p>
        </div>
      )}
    </SuperAdminLayout>
  );
}
