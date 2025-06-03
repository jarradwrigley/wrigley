"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Monitor,
  Plus,
  Smartphone,
  Trash2,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import LoadingFallback from "../FallbackLoading";
import { useRouter } from "next/navigation";
import { capitalizeFirstLetter } from "@/lib/utils";

// TypeScript interfaces
interface Subscription {
  _id: string;
  user: string;
  deviceId: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: "active" | "queued" | "expired";
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionsResponse {
  subscriptions: Subscription[];
  totalCount: number;
}

interface Device {
  deviceId: string;
  deviceName?: string;
}

// Fetcher function
const fetcher = async (url: string): Promise<SubscriptionsResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch subscriptions");
  }
  return response.json();
};

// Custom hook for subscriptions
function useSubscriptions() {
  const { data, error, isLoading, mutate } = useSWR<SubscriptionsResponse>(
    "/api/subscriptions",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    subscriptions: data?.subscriptions || [],
    totalCount: data?.totalCount || 0,
    loading: isLoading,
    error,
    mutate,
  };
}

// Add/Edit Subscription Modal
const SubscriptionModal = React.memo(
  ({
    isOpen,
    onClose,
    subscription,
    onSave,
    userDevices,
  }: {
    isOpen: boolean;
    onClose: () => void;
    subscription?: Subscription;
    onSave: (subscriptionData: any) => Promise<void>;
    userDevices: Device[];
  }) => {
    const [formData, setFormData] = useState({
      deviceId: "",
      plan: "",
      startDate: "",
      endDate: "",
      status: "queued" as "active" | "queued" | "expired",
    });
    const [isLoading, setIsLoading] = useState(false);

    // Reset form when modal opens/closes
    React.useEffect(() => {
      if (isOpen) {
        if (subscription) {
          setFormData({
            deviceId: subscription.deviceId,
            plan: subscription.plan,
            startDate: subscription.startDate.split("T")[0],
            endDate: subscription.endDate.split("T")[0],
            status: subscription.status,
          });
        } else {
          setFormData({
            deviceId: "",
            plan: "",
            startDate: "",
            endDate: "",
            status: "queued" as "active" | "queued" | "expired",
          });
        }
      }
    }, [isOpen, subscription]);

    const handleInputChange = useCallback((field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
          await onSave({
            ...formData,
            id: subscription?._id,
          });
          onClose();
        } catch (error) {
          console.error("Failed to save subscription:", error);
        } finally {
          setIsLoading(false);
        }
      },
      [formData, onSave, onClose, subscription]
    );

    const planOptions = [
      { value: "basic", label: "Basic Plan" },
      { value: "premium", label: "Premium Plan" },
      { value: "pro", label: "Pro Plan" },
      { value: "enterprise", label: "Enterprise Plan" },
    ];

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md bg-white/50 backdrop-blur-md rounded-lg shadow-xl border border-white/20 max-h-[90vh] no-scrollbar overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-xl font-semibold text-black">
              {subscription ? "Edit Subscription" : "Add New Subscription"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Device Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                Device
              </label>
              <select
                value={formData.deviceId}
                onChange={(e) => handleInputChange("deviceId", e.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                required
                disabled={isLoading}
              >
                <option value="">Select a device</option>
                {userDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.deviceName || device.deviceId}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                Plan
              </label>
              <select
                value={formData.plan}
                onChange={(e) => handleInputChange("plan", e.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                required
                disabled={isLoading}
              >
                <option value="">Select a plan</option>
                {planOptions.map((plan) => (
                  <option key={plan.value} value={plan.value}>
                    {plan.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                required
                disabled={isLoading}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                required
                disabled={isLoading}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                disabled={isLoading}
              >
                <option value="queued">Queued</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isLoading ? "Saving..." : "Save Subscription"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

SubscriptionModal.displayName = "SubscriptionModal";

// Delete Confirmation Modal
const DeleteConfirmationModal = React.memo(
  ({
    isOpen,
    onClose,
    onConfirm,
    subscription,
    isLoading,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    subscription?: Subscription;
    isLoading: boolean;
  }) => {
    if (!isOpen || !subscription) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full max-w-sm bg-white/50 backdrop-blur-md rounded-lg shadow-xl border border-white/20">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-black">
                Delete Subscription
              </h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this subscription for{" "}
              <span className="font-medium">{subscription.plan}</span>? This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DeleteConfirmationModal.displayName = "DeleteConfirmationModal";

// Subscription Card Component
const SubscriptionCard = React.memo(
  ({
    subscription,
    onEdit,
    onDelete,
    deviceName,
  }: {
    subscription: Subscription;
    onEdit: (subscription: Subscription) => void;
    onDelete: (subscription: Subscription) => void;
    deviceName?: string;
  }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "active":
          return "bg-green-100 text-green-800 border-green-200";
        case "queued":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "expired":
          return "bg-red-100 text-red-800 border-red-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "active":
          return <Eye size={14} />;
        case "queued":
          return <Clock size={14} />;
        case "expired":
          return <EyeOff size={14} />;
        default:
          return <Clock size={14} />;
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const getDaysRemaining = () => {
      const endDate = new Date(subscription.endDate);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    const daysRemaining = getDaysRemaining();

    return (
      <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/50 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <CreditCard size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-black">
                {capitalizeFirstLetter(subscription.plan)} Plan
              </h3>
              <p className="text-sm text-gray-600">
                {deviceName || subscription.deviceId}
              </p>
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
              subscription.status
            )}`}
          >
            {getStatusIcon(subscription.status)}
            {capitalizeFirstLetter(subscription.status)}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar size={14} />
            <span>
              {formatDate(subscription.startDate)} -{" "}
              {formatDate(subscription.endDate)}
            </span>
          </div>
          {subscription.status === "active" && (
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} />
              <span
                className={
                  daysRemaining <= 7 ? "text-red-600" : "text-gray-700"
                }
              >
                {daysRemaining > 0
                  ? `${daysRemaining} days remaining`
                  : "Expired"}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(subscription)}
            className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(subscription)}
            className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }
);

SubscriptionCard.displayName = "SubscriptionCard";

// Subscription Stats Component
const SubscriptionStats = React.memo(
  ({ subscriptions }: { subscriptions: Subscription[] }) => {
    const stats = useMemo(() => {
      const active = subscriptions.filter((s) => s.status === "active").length;
      const queued = subscriptions.filter((s) => s.status === "queued").length;
      const expired = subscriptions.filter(
        (s) => s.status === "expired"
      ).length;

      return { active, queued, expired, total: subscriptions.length };
    }, [subscriptions]);

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-black">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-green-50/40 backdrop-blur-md border border-green-200/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
          <div className="text-sm text-green-700">Active</div>
        </div>
        <div className="bg-yellow-50/40 backdrop-blur-md border border-yellow-200/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.queued}
          </div>
          <div className="text-sm text-yellow-700">Queued</div>
        </div>
        <div className="bg-red-50/40 backdrop-blur-md border border-red-200/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          <div className="text-sm text-red-700">Expired</div>
        </div>
      </div>
    );
  }
);

SubscriptionStats.displayName = "SubscriptionStats";

// Main Content Component
const Content: React.FC = () => {
  const { subscriptions, loading, error, mutate } = useSubscriptions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userDevices, setUserDevices] = useState<Device[]>([]);

  // Fetch user devices
  useEffect(() => {
    const fetchUserDevices = async () => {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();
        setUserDevices(data.profile.devices || []);
      } catch (error) {
        console.error("Failed to fetch user devices:", error);
      }
    };

    fetchUserDevices();
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedSubscription(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDeleteModalOpen(true);
  }, []);

  const handleSaveSubscription = useCallback(
    async (subscriptionData: any) => {
      try {
        const url = subscriptionData.id
          ? `/api/subscriptions/${subscriptionData.id}`
          : "/api/subscriptions";

        const method = subscriptionData.id ? "PATCH" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscriptionData),
        });

        if (!response.ok) {
          throw new Error("Failed to save subscription");
        }

        await mutate();
      } catch (error) {
        console.error("Error saving subscription:", error);
        throw error;
      }
    },
    [mutate]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedSubscription) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/subscriptions/${selectedSubscription._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete subscription");
      }

      await mutate();
      setIsDeleteModalOpen(false);
      setSelectedSubscription(null);
    } catch (error) {
      console.error("Error deleting subscription:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedSubscription, mutate]);

  const getDeviceName = useCallback(
    (deviceId: string) => {
      const device = userDevices.find((d) => d.deviceId === deviceId);
      return device?.deviceName;
    },
    [userDevices]
  );

  if (error) {
    return (
      <div className="flex w-full items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load subscriptions</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full">
        <div className="w-full dis-none h-full hidden sm:block sm:w-20 xl:w-60 flex-shrink-0" />
        <div className="h-full flex-grow overflow-x-hidden overflow-auto flex flex-wrap content-start p-2">
          {/* Hero Section */}
          <div className="w-full p-2 h-80 relative rounded-lg mb-6">
            <Image
              src="/images/bgClock.png"
              alt="Subscriptions background"
              fill
              className="object-cover rounded-lg"
              priority
            />
            <div className="absolute inset-0 bg-black/30 rounded-lg" />
            <div className="absolute bottom-8 left-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Subscription Management
              </h1>
              <p className="text-white/80">
                Manage your device subscriptions and plans
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="w-full p-2">
            <SubscriptionStats subscriptions={subscriptions} />
          </div>

          {/* Main Content */}
          <div className="w-full p-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">
                Your Subscriptions
              </h2>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} />
                Add Subscription
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <Monitor size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">
                  No Subscriptions Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start by adding your first device subscription
                </p>
                <button
                  onClick={handleAddNew}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add First Subscription
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription._id}
                    subscription={subscription}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    deviceName={getDeviceName(subscription.deviceId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscription={selectedSubscription || undefined}
        onSave={handleSaveSubscription}
        userDevices={userDevices}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        subscription={selectedSubscription || undefined}
        isLoading={isDeleting}
      />
    </>
  );
};

// Main Subscriptions Page Component
const SubscriptionsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/api/auth/signin");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Content />
    </Suspense>
  );
};

export default SubscriptionsPage;
