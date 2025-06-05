import React, { useState } from "react";
import { useSpring, animated, config } from "@react-spring/web";
import { Calendar, Smartphone, Clock, Eye, EyeOff } from "lucide-react";
import SecureIcon from "./icons/SecureIcon";

const pi = Math.PI;
const tau = 2 * pi;

const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

interface Subscription {
  _id: string;
  user: string;
  deviceName: string;
  imei: string;
  phone: string;
  email: string;
  subscriptionType: string;
  subscriptionCards: string[];
  startDate: string;
  endDate: string;
  status: "pending" | "queued" | "active" | "expired";
  queuePosition?: number;
  createdAt: string;
  updatedAt: string;
  planName?: string;
  planPrice?: number;
  activatedAt?: string;
}

const SUBSCRIPTION_TYPES = {
  "mobile-v4-basic": {
    label: "Mobile Only v4 - Basic (30 days)",
    duration: 30,
    description: "Basic mobile encryption for 30 days",
  },
  "mobile-v4-premium": {
    label: "Mobile Only v4 - Premium (60 days)",
    duration: 60,
    description: "Premium mobile encryption for 60 days",
  },
  "mobile-v4-enterprise": {
    label: "Mobile Only v4 - Enterprise (90 days)",
    duration: 90,
    description: "Enterprise mobile encryption for 90 days",
  },
  "mobile-v5-basic": {
    label: "Mobile Only v5 - Basic (30 days)",
    duration: 30,
    description: "Latest v5 mobile encryption for 30 days",
  },
  "mobile-v5-premium": {
    label: "Mobile Only v5 - Premium (60 days)",
    duration: 60,
    description: "Latest v5 mobile encryption for 60 days",
  },
  "full-suite-basic": {
    label: "Full Suite - Basic (60 days)",
    duration: 60,
    description: "Complete encryption suite for 60 days",
  },
  "full-suite-premium": {
    label: "Full Suite - Premium (90 days)",
    duration: 90,
    description: "Complete encryption suite for 90 days",
  },
};

type EncryptionCardProps = {
  subscription: Subscription;
//   onEdit?: (subscription: Subscription) => void;
//   onDelete?: (subscription: Subscription) => void;
  onActivationSuccess: () => void;
};

const EncryptionCard: React.FC<EncryptionCardProps> = ({
  subscription,
  onActivationSuccess,
}) => {
  // Activation states
  const [showActivation, setShowActivation] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate percentage based on time remaining
  const calculateTimePercentage = () => {
    if (!subscription.startDate || !subscription.endDate) {
      return subscription.status === "active" ? 50 : 0; // Default for missing dates
    }

    const now = new Date();
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);

    // Total duration in milliseconds
    const totalDuration = endDate.getTime() - startDate.getTime();

    if (totalDuration <= 0) return 0;

    // Remaining time in milliseconds
    const remainingTime = endDate.getTime() - now.getTime();

    // Calculate percentage (0-100)
    const percentage = Math.max(
      0,
      Math.min(100, (remainingTime / totalDuration) * 100)
    );

    return percentage;
  };

  const percentage = calculateTimePercentage();
  const maxDash = 785.4;
  const offset = maxDash * (1 - percentage / 100);

  // Determine color based on percentage and status
  const getColor = (percentage: number, status: string) => {
    if (status === "expired") return "#ef4444"; // red
    if (status === "pending" || status === "queued") return "#64748b"; // gray
    if (percentage <= 25) return "#ef4444"; // red
    if (percentage <= 50) return "#eab308"; // yellow
    return "#22c55e"; // green
  };

  const color = getColor(percentage, subscription.status);

  const { dashOffset } = useSpring({
    dashOffset: offset,
    from: { dashOffset: maxDash },
    config: config.molasses,
  });

  // Status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "queued":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "expired":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Activation logic
  const handleActivateClick = async () => {
    setLoading(true);
    setError("");

    try {
      // Check if device is onboarded
      const onboardingResponse = await fetch("/api/devices/check-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imei: subscription.imei }),
      });

      const onboardingData = await onboardingResponse.json();

      if (!onboardingResponse.ok) {
        throw new Error(
          onboardingData.error || "Failed to check device status"
        );
      }

      setIsOnboarded(onboardingData.isOnboarded);

      // If not onboarded, generate QR code
      if (!onboardingData.isOnboarded) {
        const setupResponse = await fetch("/api/devices/setup-totp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imei: subscription.imei,
            deviceName:
              subscription.deviceName ||
              `Device ${subscription.imei.slice(-4)}`,
          }),
        });

        const setupData = await setupResponse.json();
        if (setupResponse.ok) {
          setQrCode(setupData.qrCode);
        } else {
          throw new Error(setupData.error || "Failed to setup device");
        }
      }

      setShowActivation(true);
    } catch (err: any) {
      setError(err.message || "Failed to initiate activation");
    } finally {
      setLoading(false);
    }
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/subscriptions/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subscription._id,
          imei: subscription.imei,
          totpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onActivationSuccess();
        setShowActivation(false);
        setTotpCode("");
      } else {
        setError(data.error || "Activation failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get days remaining
  const getDaysRemaining = () => {
    if (!subscription.endDate) return 0;
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();

  // Get subscription type label
  const subscriptionTypeLabel =
    subscription.planName ||
    SUBSCRIPTION_TYPES[
      subscription.subscriptionType as keyof typeof SUBSCRIPTION_TYPES
    ]?.label ||
    subscription.subscriptionType;

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Eye size={16} className="text-green-600" />;
      case "queued":
        return <Clock size={16} className="text-blue-600" />;
      case "expired":
        return <EyeOff size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:scale-102 transition-colors h-fit">
      {/* Header with device info and status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-black mb-1">
            {subscription.deviceName}
          </h3>
          <p className="text-sm text-gray-600">{subscriptionTypeLabel}</p>
          {subscription.planPrice && (
            <p className="text-lg font-bold text-gray-900 mt-1">
              ${subscription.planPrice}/month
            </p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            subscription.status
          )}`}
        >
          {subscription.status.toUpperCase()}
        </span>
      </div>

      {/* Show activation interface if in progress */}
      {showActivation ? (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">
            {isOnboarded ? "🔐 Enter TOTP Code" : "📱 Setup Authenticator"}
          </h4>

          {!isOnboarded && qrCode && (
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Scan this QR code with your authenticator app:
              </p>
              <img src={qrCode} alt="TOTP QR Code" className="mx-auto mb-2" />
            </div>
          )}

          <form onSubmit={handleTotpSubmit}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                6-Digit Code from Authenticator App
              </label>
              <input
                type="text"
                value={totpCode}
                onChange={(e) =>
                  setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md text-center text-xl tracking-widest font-mono"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                ❌ {error}
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Activating..." : "Activate"}
              </button>
              <button
                type="button"
                onClick={() => setShowActivation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Progress Arc - only show for active subscriptions or when there are dates */}
          {(subscription.status === "active" ||
            (subscription.startDate && subscription.endDate)) && (
            <>
              <div className="flex justify-center mb-4">
                <svg viewBox="0 0 700 380" fill="none" width="280">
                  {/* Background path */}
                  <path
                    d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  {/* Animated progress path */}
                  <animated.path
                    d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
                    stroke={color}
                    strokeWidth="40"
                    strokeLinecap="round"
                    strokeDasharray={maxDash}
                    strokeDashoffset={dashOffset}
                  />
                  {/* Circular indicator */}
                  <animated.circle
                    cx={dashOffset.to(
                      (x) => 350 + 250 * Math.cos(map(x, maxDash, 0, pi, tau))
                    )}
                    cy={dashOffset.to(
                      (x) => 350 + 250 * Math.sin(map(x, maxDash, 0, pi, tau))
                    )}
                    r="14"
                    fill="#fff"
                    stroke={color}
                    strokeWidth="2"
                  />

                  {/* Secure Icon centered */}
                  <g transform="translate(280, 200)">
                    <g transform="translate(-30, -30)">
                      <SecureIcon size={200} color={color} />
                    </g>
                  </g>
                </svg>
              </div>

              {/* Progress percentage and status */}
              <div className="text-center mb-4">
                <div className="font-bold text-2xl mb-1" style={{ color }}>
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  {subscription.status === "active"
                    ? `${daysRemaining} days remaining`
                    : subscription.status === "queued"
                    ? "In queue"
                    : subscription.status === "expired"
                    ? "Subscription expired"
                    : "Pending activation"}
                </div>
              </div>
            </>
          )}

          {/* Subscription details */}
          <div className="space-y-3 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Smartphone size={14} />
              <span>IMEI: {subscription.imei}</span>
            </div>

            {/* <div className="flex items-center gap-2 text-gray-700">
              <span>📱</span>
              <span>Phone: {subscription.phone}</span>
            </div> */}

            {subscription.startDate && (
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={14} />
                <span>Started: {formatDate(subscription.startDate)}</span>
              </div>
            )}

            {subscription.endDate && (
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={14} />
                <span>Expires: {formatDate(subscription.endDate)}</span>
              </div>
            )}

            {subscription.activatedAt && (
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={14} />
                <span>Activated: {formatDate(subscription.activatedAt)}</span>
              </div>
            )}

            {subscription.status === "queued" && subscription.queuePosition && (
              <div className="flex items-center gap-2 text-blue-600">
                <Clock size={14} />
                <span>Queue position: #{subscription.queuePosition}</span>
              </div>
            )}
          </div>

          {/* Activation button for queued subscriptions */}
          {subscription.status === "queued" && (
            <button
              onClick={handleActivateClick}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors mb-4"
            >
              {loading ? "Loading..." : "🚀 Activate Subscription"}
            </button>
          )}

          {/* Error display */}
          {error && !showActivation && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              ❌ {error}
            </div>
          )}

        
        </>
      )}
    </div>
  );
};

export default EncryptionCard;
