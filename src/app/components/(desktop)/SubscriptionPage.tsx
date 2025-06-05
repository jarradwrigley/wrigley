"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SubscriptionCard from "../SubscriptionCard";

interface Subscription {
  _id: string;
  imei: string;
  status: "pending" | "queued" | "active" | "expired" | "cancelled";
  planName: string;
  planPrice: number;
  startDate?: string;
  endDate?: string;
  activatedAt?: string;
}

const AddDeviceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [imei, setImei] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!imei.trim()) {
      setError("IMEI is required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/devices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imei, name }),
      });

      const data = await res.json();
      if (res.ok) {
        setImei("");
        setName("");
        setError("");
        onSuccess(); // Refresh list
        onClose(); // Close modal
      } else {
        setError(data.error || "Failed to create device");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">➕ Add New Device</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">IMEI</label>
            <input
              type="text"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              className="w-full text-black mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter device IMEI"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Device Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-black mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="e.g. John's iPhone"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Device"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
  

const SubscriptionsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);


  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/apiojps");
      const data = await response.json();

      if (response.ok) {
        setSubscriptions(data.subscriptions);
        setError("");
      } else {
        setError(data.error || "Failed to fetch subscriptions");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/auth/signin"); // Redirect to your sign-in page
      return;
    }

    if (session?.user) {
      fetchSubscriptions();
    }
  }, [session, status, router]);

  const handleActivationSuccess = () => {
    // Refresh subscriptions after successful activation
    fetchSubscriptions();
  };

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while fetching subscriptions
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  const getStatusCounts = () => {
    const counts = {
      total: subscriptions.length,
      active: subscriptions.filter((s) => s.status === "active").length,
      queued: subscriptions.filter((s) => s.status === "queued").length,
      pending: subscriptions.filter((s) => s.status === "pending").length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📱 My Subscriptions
          </h1>
          <p className="text-gray-600">
            Welcome back,{" "}
            <strong>{session?.user?.name || session?.user?.email}</strong>!
            Manage your device subscriptions and activate queued plans.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {statusCounts.total}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200 text-center">
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.active}
            </div>
            <div className="text-sm text-green-600">Active</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.queued}
            </div>
            <div className="text-sm text-blue-600">Ready to Activate</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.pending}
            </div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            ➕ Add New Device
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">❌</span>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchSubscriptions}
                className="ml-auto px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Subscriptions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription._id}
              subscription={subscription}
              // userId={user.id}
              // subscription={subscription}
              onActivationSuccess={handleActivationSuccess}
            />
          ))}
        </div>

        {/* Empty State */}
        {subscriptions.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Subscriptions Found
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              You don't have any subscriptions yet.
            </p>
            <button
              onClick={() => router.push("/plans")} // Adjust to your plans page
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Plans
            </button>
          </div>
        )}

        {/* Instructions for Queued Subscriptions */}
        {statusCounts.queued > 0 && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
              <span className="mr-2">ℹ️</span>
              How to Activate Your Subscriptions
            </h3>
            <div className="text-blue-800 space-y-2">
              <p>
                • Click "🚀 Activate Subscription" on any queued subscription
              </p>
              <p>
                • For new devices: Scan the QR code with Google/Microsoft
                Authenticator
              </p>
              <p>
                • For existing devices: Enter the 6-digit code from your
                authenticator app
              </p>
              <p>
                • Your subscription will be activated immediately after
                verification
              </p>
            </div>
          </div>
        )}
      </div>

      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSubscriptions}
      />
    </div>
  );
};

export default SubscriptionsPage;
