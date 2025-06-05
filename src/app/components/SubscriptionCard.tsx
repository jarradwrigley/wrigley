// import React, { useState } from "react";

// interface Subscription {
//   _id: string;
//   imei: string;
//   status: "pending" | "queued" | "active" | "expired" | "cancelled";
//   planName: string;
//   planPrice: number;
//   startDate?: string;
//   endDate?: string;
//   activatedAt?: string;
// }

// interface SubscriptionCardProps {
//   subscription: Subscription;
//   userId: string;
//   onActivationSuccess: () => void;
// }

// const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
//   subscription,
//   userId,
//   onActivationSuccess,
// }) => {
//   const [showActivation, setShowActivation] = useState(false);
//   const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
//   const [qrCode, setQrCode] = useState<string>("");
//   const [totpCode, setTotpCode] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "active":
//         return "text-green-600 bg-green-50 border-green-200";
//       case "queued":
//         return "text-blue-600 bg-blue-50 border-blue-200";
//       case "pending":
//         return "text-yellow-600 bg-yellow-50 border-yellow-200";
//       case "expired":
//         return "text-red-600 bg-red-50 border-red-200";
//       default:
//         return "text-gray-600 bg-gray-50 border-gray-200";
//     }
//   };

//   const handleActivateClick = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       // Check if device is onboarded
//       const onboardingResponse = await fetch("/api/devices/check-onboarding", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, imei: subscription.imei }),
//       });

//       const onboardingData = await onboardingResponse.json();
//       setIsOnboarded(onboardingData.isOnboarded);

//       // If not onboarded, generate QR code
//       if (!onboardingData.isOnboarded) {
//         const setupResponse = await fetch("/api/devices/setup-totp", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId,
//             imei: subscription.imei,
//             deviceName: `Device ${subscription.imei.slice(-4)}`,
//           }),
//         });

//         const setupData = await setupResponse.json();
//         if (setupResponse.ok) {
//           setQrCode(setupData.qrCode);
//         } else {
//           setError(setupData.message);
//         }
//       }

//       setShowActivation(true);
//     } catch (err) {
//       setError("Failed to initiate activation");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTotpSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await fetch("/api/subscriptions/activate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           subscriptionId: subscription._id,
//           imei: subscription.imei,
//           totpCode,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         onActivationSuccess();
//         setShowActivation(false);
//       } else {
//         setError(data.message);
//       }
//     } catch (err) {
//       setError("Activation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString?: string) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString();
//   };

//   return (
//     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900">
//             {subscription.planName}
//           </h3>
//           <p className="text-gray-600">IMEI: {subscription.imei}</p>
//           <p className="text-lg font-bold text-gray-900">
//             ${subscription.planPrice}/month
//           </p>
//         </div>
//         <span
//           className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
//             subscription.status
//           )}`}
//         >
//           {subscription.status.toUpperCase()}
//         </span>
//       </div>

//       <div className="space-y-2 text-sm text-gray-600 mb-4">
//         <p>Start Date: {formatDate(subscription.startDate)}</p>
//         <p>End Date: {formatDate(subscription.endDate)}</p>
//         {subscription.activatedAt && (
//           <p>Activated: {formatDate(subscription.activatedAt)}</p>
//         )}
//       </div>

//       {subscription.status === "queued" && !showActivation && (
//         <button
//           onClick={handleActivateClick}
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
//         >
//           {loading ? "Loading..." : "🚀 Activate Subscription"}
//         </button>
//       )}

//       {showActivation && (
//         <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//           <h4 className="font-semibold mb-3">
//             {isOnboarded ? "🔐 Enter TOTP Code" : "📱 Setup Authenticator"}
//           </h4>

//           {!isOnboarded && qrCode && (
//             <div className="text-center mb-4">
//               <p className="text-sm text-gray-600 mb-2">
//                 Scan this QR code with your authenticator app:
//               </p>
//               <img src={qrCode} alt="TOTP QR Code" className="mx-auto mb-2" />
//             </div>
//           )}

//           <form onSubmit={handleTotpSubmit}>
//             <div className="mb-3">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 6-Digit Code from Authenticator App
//               </label>
//               <input
//                 type="text"
//                 value={totpCode}
//                 onChange={(e) =>
//                   setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
//                 }
//                 placeholder="000000"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-xl tracking-widest font-mono"
//                 maxLength={6}
//                 required
//               />
//             </div>

//             {error && (
//               <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
//                 {error}
//               </div>
//             )}

//             <div className="flex space-x-2">
//               <button
//                 type="submit"
//                 disabled={loading || totpCode.length !== 6}
//                 className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
//               >
//                 {loading ? "Activating..." : "Activate"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowActivation(false)}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SubscriptionCard;


import React, { useState } from "react";

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

interface SubscriptionCardProps {
  subscription: Subscription;
  onActivationSuccess: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onActivationSuccess,
}) => {
  const [showActivation, setShowActivation] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      console.log('pppp', onboardingData)

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
            deviceName: `Device ${subscription.imei.slice(-4)}`,
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {subscription.planName}
          </h3>
          <p className="text-gray-600">IMEI: {subscription.imei}</p>
          <p className="text-lg font-bold text-gray-900">
            ${subscription.planPrice}/month
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            subscription.status
          )}`}
        >
          {subscription.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>Start Date: {formatDate(subscription.startDate)}</p>
        <p>End Date: {formatDate(subscription.endDate)}</p>
        {subscription.activatedAt && (
          <p>Activated: {formatDate(subscription.activatedAt)}</p>
        )}
      </div>

      {subscription.status === "queued" && !showActivation && (
        <button
          onClick={handleActivateClick}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Loading..." : "🚀 Activate Subscription"}
        </button>
      )}

      {showActivation && (
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
      )}
    </div>
  );
};

export default SubscriptionCard;