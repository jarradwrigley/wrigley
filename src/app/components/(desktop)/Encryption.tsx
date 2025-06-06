// "use client";

// import React, {
//   Suspense,
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import Image from "next/image";
// import {
//   Calendar,
//   Clock,
//   CreditCard,
//   Eye,
//   EyeOff,
//   Monitor,
//   Plus,
//   Smartphone,
//   Trash2,
//   X,
//   Save,
//   AlertTriangle,
// } from "lucide-react";
// import { useSession } from "next-auth/react";
// import LoadingFallback from "../FallbackLoading";
// import { useRouter } from "next/navigation";
// import { capitalizeFirstLetter } from "@/lib/utils";
// import EncryptionCard from "../EncryptionCard";
// // import SubscriptionCard from "../SubscriptionCard";

// // TypeScript interfaces
// interface Subscription {
//   _id: string;
//   user: string;
//   deviceName: string;
//   imei: string;
//   phone: string;
//   email: string;
//   subscriptionType: string; // Changed from categories
//   subscriptionCards: string[];
//   startDate: string;
//   endDate: string;
//   status: "pending" | "queued" | "active" | "expired";
//   queuePosition?: number; // For managing queue order
//   createdAt: string;
//   updatedAt: string;
// }

// // Predefined subscription types with durations
// const SUBSCRIPTION_TYPES = {
//   "mobile-v4-basic": {
//     label: "Mobile Only v4 - Basic (30 days)",
//     duration: 30,
//     description: "Basic mobile encryption for 30 days",
//   },
//   "mobile-v4-premium": {
//     label: "Mobile Only v4 - Premium (60 days)",
//     duration: 60,
//     description: "Premium mobile encryption for 60 days",
//   },
//   "mobile-v4-enterprise": {
//     label: "Mobile Only v4 - Enterprise (90 days)",
//     duration: 90,
//     description: "Enterprise mobile encryption for 90 days",
//   },
//   "mobile-v5-basic": {
//     label: "Mobile Only v5 - Basic (30 days)",
//     duration: 30,
//     description: "Latest v5 mobile encryption for 30 days",
//   },
//   "mobile-v5-premium": {
//     label: "Mobile Only v5 - Premium (60 days)",
//     duration: 60,
//     description: "Latest v5 mobile encryption for 60 days",
//   },
//   "full-suite-basic": {
//     label: "Full Suite - Basic (60 days)",
//     duration: 60,
//     description: "Complete encryption suite for 60 days",
//   },
//   "full-suite-premium": {
//     label: "Full Suite - Premium (90 days)",
//     duration: 90,
//     description: "Complete encryption suite for 90 days",
//   },
// };

// function useSubscriptions() {
//   const [subscriptions, setSubscriptions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchSubscriptions = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/subscriptions");
//       const data = await response.json();
//       setSubscriptions(data.subscriptions);
//     } catch (error) {
//       console.error("Error fetching subscriptions:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchSubscriptions();
//   }, [fetchSubscriptions]);

//   // Return refetch function along with data
//   return { subscriptions, loading, refetch: fetchSubscriptions };
// }

// const SubscriptionModal = React.memo(
//   ({
//     isOpen,
//     onClose,
//     subscription,
//     onSave,
//   }: {
//     isOpen: boolean;
//     onClose: () => void;
//     subscription?: Subscription;
//     onSave: (subscriptionData: any) => Promise<void>;
//   }) => {
//     const [formData, setFormData] = useState({
//       deviceName: "",
//       imei: "",
//       phoneNumber: "",
//       email: "",
//       subscriptionType: "", // Changed from categories
//       subscriptionCards: [] as File[],
//     });
//     const [isLoading, setIsLoading] = useState(false);
//     const [uploadError, setUploadError] = useState<string>("");

//     // Reset form when modal opens/closes
//     React.useEffect(() => {
//       if (isOpen) {
//         if (subscription) {
//           setFormData({
//             deviceName: subscription.deviceName,
//             imei: subscription.imei,
//             phoneNumber: subscription.phone,
//             email: subscription.email,
//             subscriptionType: subscription.subscriptionType,
//             subscriptionCards: [], // Files will be handled separately for editing
//           });
//         } else {
//           setFormData({
//             deviceName: "",
//             imei: "",
//             phoneNumber: "",
//             email: "",
//             subscriptionType: "",
//             subscriptionCards: [],
//           });
//         }
//         setUploadError("");
//       }
//     }, [isOpen, subscription]);

//     const handleInputChange = useCallback((field: string, value: string) => {
//       setFormData((prev) => ({ ...prev, [field]: value }));
//     }, []);

//     const handleFileUpload = useCallback((files: FileList | null) => {
//       if (!files) return;

//       const fileArray = Array.from(files);
//       const maxSize = 5 * 1024 * 1024; // 5MB
//       const allowedTypes = [
//         "image/jpeg",
//         "image/png",
//         "image/jpg",
//         "application/pdf",
//       ];

//       // Validate files
//       for (const file of fileArray) {
//         if (file.size > maxSize) {
//           setUploadError(
//             `File ${file.name} is too large. Maximum size is 5MB.`
//           );
//           return;
//         }
//         if (!allowedTypes.includes(file.type)) {
//           setUploadError(
//             `File ${file.name} has an invalid type. Only JPEG, PNG, and PDF files are allowed.`
//           );
//           return;
//         }
//       }

//       setUploadError("");
//       setFormData((prev) => ({
//         ...prev,
//         subscriptionCards: [...prev.subscriptionCards, ...fileArray],
//       }));
//     }, []);

//     const removeFile = useCallback((index: number) => {
//       setFormData((prev) => ({
//         ...prev,
//         subscriptionCards: prev.subscriptionCards.filter((_, i) => i !== index),
//       }));
//     }, []);

//     const handleSubmit = useCallback(
//       async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);

//         try {
//           // Create FormData for file upload
//           const submitData = new FormData();

//           // Add form fields
//           submitData.append("deviceName", formData.deviceName);
//           submitData.append("imei", formData.imei);
//           submitData.append("phoneNumber", formData.phoneNumber);
//           submitData.append("email", formData.email);
//           submitData.append("subscriptionType", formData.subscriptionType);

//           // Add subscription card files
//           formData.subscriptionCards.forEach((file, index) => {
//             submitData.append("subscriptionCards", file);
//           });

//           // Add ID for editing
//           if (subscription?._id) {
//             submitData.append("id", subscription._id);
//           }

//           console.log("Submitting subscription data:");
//           console.log("Device Name:", formData.deviceName);
//           console.log("IMEI:", formData.imei);
//           console.log("Phone Number:", formData.phoneNumber);
//           console.log("Email:", formData.email);
//           console.log("Subscription Type:", formData.subscriptionType);
//           console.log("Files to upload:", formData.subscriptionCards.length);

//           await onSave(submitData);
//           onClose();
//         } catch (error) {
//           console.error("Failed to save subscription:", error);
//           // You might want to show an error message to the user here
//           alert("Failed to save subscription. Please try again.");
//         } finally {
//           setIsLoading(false);
//         }
//       },
//       [formData, onSave, onClose, subscription]
//     );
//     // Form validation
//     const isFormValid =
//       formData.deviceName &&
//       formData.imei &&
//       formData.phoneNumber &&
//       formData.email &&
//       formData.subscriptionType &&
//       (formData.subscriptionCards.length > 0 || subscription); // Required for new, optional for edit

//     if (!isOpen) return null;

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         {/* Backdrop */}
//         <div
//           className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//           onClick={onClose}
//         />

//         {/* Modal */}
//         <div className="relative w-full max-w-2xl bg-white/50 backdrop-blur-md rounded-lg shadow-xl border border-white/20 max-h-[90vh] no-scrollbar overflow-y-auto">
//           {/* Header */}
//           <div className="flex items-center justify-between p-4 border-b border-white/20">
//             <h2 className="text-xl font-semibold text-black">
//               {subscription ? "Edit Subscription" : "Add New Subscription"}
//             </h2>
//             <button
//               onClick={onClose}
//               className="p-1 hover:bg-black/10 rounded-full transition-colors"
//               disabled={isLoading}
//             >
//               <X size={20} />
//             </button>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="p-6 space-y-6">
//             {/* Device Information Section */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium text-black border-b border-gray-200 pb-2">
//                 Device Information
//               </h3>

//               {/* Device Name */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-black">
//                   Device Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.deviceName}
//                   onChange={(e) =>
//                     handleInputChange("deviceName", e.target.value)
//                   }
//                   className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
//                   placeholder="e.g., iPhone 15 Pro, Samsung Galaxy S24"
//                   required
//                   disabled={isLoading}
//                 />
//               </div>

//               {/* IMEI */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-black">
//                   IMEI *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.imei}
//                   onChange={(e) => handleInputChange("imei", e.target.value)}
//                   className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
//                   placeholder="Enter 15-digit IMEI number"
//                   pattern="[0-9]{15}"
//                   maxLength={15}
//                   required
//                   disabled={isLoading}
//                 />
//                 <p className="text-xs text-gray-600">
//                   This will be used to identify your device and manage
//                   subscription queue
//                 </p>
//               </div>
//             </div>

//             {/* Contact Information Section */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium text-black border-b border-gray-200 pb-2">
//                 Contact Information
//               </h3>

//               {/* Phone Number */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-black">
//                   Phone Number *
//                 </label>
//                 <input
//                   type="tel"
//                   value={formData.phoneNumber}
//                   onChange={(e) =>
//                     handleInputChange("phoneNumber", e.target.value)
//                   }
//                   className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
//                   placeholder="+1 (555) 123-4567"
//                   required
//                   disabled={isLoading}
//                 />
//               </div>

//               {/* Email */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-black">
//                   Email Address *
//                 </label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => handleInputChange("email", e.target.value)}
//                   className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
//                   placeholder="user@example.com"
//                   required
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>

//             {/* Subscription Details Section */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium text-black border-b border-gray-200 pb-2">
//                 Subscription Plan
//               </h3>

//               {/* Subscription Type Dropdown */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-black">
//                   Select Subscription Plan *
//                 </label>
//                 <select
//                   value={formData.subscriptionType}
//                   onChange={(e) =>
//                     handleInputChange("subscriptionType", e.target.value)
//                   }
//                   className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
//                   required
//                   disabled={isLoading}
//                 >
//                   <option value="">Choose a subscription plan...</option>
//                   {Object.entries(SUBSCRIPTION_TYPES).map(([key, type]) => (
//                     <option key={key} value={key}>
//                       {type.label}
//                     </option>
//                   ))}
//                 </select>
//                 {formData.subscriptionType && (
//                   <p className="text-sm text-gray-600">
//                     {
//                       SUBSCRIPTION_TYPES[
//                         formData.subscriptionType as keyof typeof SUBSCRIPTION_TYPES
//                       ]?.description
//                     }
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* File Upload Section */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium text-black border-b border-gray-200 pb-2">
//                 Encryption Verification Documents *
//               </h3>

//               {/* File Upload */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-black">
//                   Upload Encryption Card(s) *
//                 </label>
//                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
//                   <input
//                     type="file"
//                     multiple
//                     accept="image/*,.pdf"
//                     onChange={(e) => handleFileUpload(e.target.files)}
//                     className="hidden"
//                     id="file-upload"
//                     disabled={isLoading}
//                   />
//                   <label htmlFor="file-upload" className="cursor-pointer">
//                     <div className="text-gray-600">
//                       <svg
//                         className="mx-auto h-12 w-12 mb-4"
//                         stroke="currentColor"
//                         fill="none"
//                         viewBox="0 0 48 48"
//                       >
//                         <path
//                           d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         />
//                       </svg>
//                       <p className="text-sm">
//                         <span className="font-medium text-blue-600 hover:text-blue-500">
//                           Click to upload
//                         </span>{" "}
//                         or drag and drop
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         PNG, JPG, PDF up to 5MB each
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         Required: Screenshots of payment confirmation,
//                         subscription receipt, etc.
//                       </p>
//                     </div>
//                   </label>
//                 </div>

//                 {uploadError && (
//                   <p className="text-sm text-red-600">{uploadError}</p>
//                 )}

//                 {!subscription && formData.subscriptionCards.length === 0 && (
//                   <p className="text-sm text-red-600">
//                     Please upload at least one verification document.
//                   </p>
//                 )}
//               </div>

//               {/* Uploaded Files Preview */}
//               {formData.subscriptionCards.length > 0 && (
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-black">
//                     Uploaded Files ({formData.subscriptionCards.length})
//                   </label>
//                   <div className="space-y-2">
//                     {formData.subscriptionCards.map((file, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
//                       >
//                         <div className="flex items-center space-x-3">
//                           <div className="p-1 bg-blue-100 rounded">
//                             <svg
//                               className="w-4 h-4 text-blue-600"
//                               fill="currentColor"
//                               viewBox="0 0 20 20"
//                             >
//                               <path
//                                 fillRule="evenodd"
//                                 d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
//                                 clipRule="evenodd"
//                               />
//                             </svg>
//                           </div>
//                           <span className="text-sm text-gray-700 truncate">
//                             {file.name}
//                           </span>
//                           <span className="text-xs text-gray-500">
//                             ({(file.size / 1024 / 1024).toFixed(2)} MB)
//                           </span>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => removeFile(index)}
//                           className="p-1 text-red-600 hover:bg-red-50 rounded"
//                           disabled={isLoading}
//                         >
//                           <X size={16} />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Info Notice */}
//             {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <div className="flex items-start gap-3">
//                   <AlertTriangle size={20} className="text-blue-600 mt-0.5" />
//                   <div className="text-sm">
//                     <p className="font-medium text-blue-800 mb-1">
//                       Subscription Process:
//                     </p>
//                     <ul className="text-blue-700 space-y-1 text-xs">
//                       <li>• Your subscription will be reviewed by our team</li>
//                       <li>
//                         • If no active subscription exists, it will be activated
//                         after verification
//                       </li>
//                       <li>
//                         • If you have an active subscription, this will be queued
//                         for when it expires
//                       </li>
//                       <li>
//                         • You'll receive email notifications about status changes
//                       </li>
//                     </ul>
//                   </div>
//                 </div>
//               </div> */}

//             {/* Action Buttons */}
//             <div className="flex gap-3 pt-6 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
//                 disabled={isLoading}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 disabled={isLoading || !isFormValid}
//               >
//                 {isLoading ? (
//                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 ) : (
//                   <Save size={16} />
//                 )}
//                 {isLoading
//                   ? "Submitting..."
//                   : subscription
//                   ? "Update Subscription"
//                   : "Submit for Review"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     );
//   }
// );

// SubscriptionModal.displayName = "SubscriptionModal";

// // Delete Confirmation Modal
// const DeleteConfirmationModal = React.memo(
//   ({
//     isOpen,
//     onClose,
//     onConfirm,
//     subscription,
//     isLoading,
//   }: {
//     isOpen: boolean;
//     onClose: () => void;
//     onConfirm: () => void;
//     subscription?: Subscription;
//     isLoading: boolean;
//   }) => {
//     if (!isOpen || !subscription) return null;

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <div
//           className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//           onClick={onClose}
//         />
//         <div className="relative w-full max-w-sm bg-white/50 backdrop-blur-md rounded-lg shadow-xl border border-white/20">
//           <div className="p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-2 bg-red-100 rounded-full">
//                 <AlertTriangle size={20} className="text-red-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-black">
//                 Delete Subscription
//               </h3>
//             </div>
//             <p className="text-gray-700 mb-6">
//               Are you sure you want to delete the subscription for{" "}
//               <span className="font-medium">{subscription.deviceName}</span>?
//               This action cannot be undone.
//             </p>
//             <div className="flex gap-3">
//               <button
//                 onClick={onClose}
//                 className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
//                 disabled={isLoading}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={onConfirm}
//                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 ) : (
//                   <Trash2 size={16} />
//                 )}
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

// DeleteConfirmationModal.displayName = "DeleteConfirmationModal";

// // Subscription Stats Component
// const SubscriptionStats = React.memo(
//   ({ subscriptions }: { subscriptions: Subscription[] }) => {
//     const stats = useMemo(() => {
//       const active = subscriptions.filter((s) => s.status === "active").length;
//       const queued = subscriptions.filter((s) => s.status === "queued").length;
//       // const expired = subscriptions.filter(
//       //   (s) => s.status === "expired"
//       // ).length;

//       return {
//         active,
//         queued,
//         // expired,
//         total: subscriptions.length,
//       };
//     }, [subscriptions]);

//     return (
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
//         <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-lg p-4">
//           <div className="text-2xl font-bold text-black">{stats.total}</div>
//           <div className="text-sm text-gray-600">Total</div>
//         </div>
//         <div className="bg-white/90 backdrop-blur-md border border-green-200/50 rounded-lg p-4">
//           <div className="text-2xl font-bold text-green-600">
//             {stats.active}
//           </div>
//           <div className="text-sm text-green-700">Active</div>
//         </div>
//         <div className="bg-white/90 backdrop-blur-md border border-yellow-200/50 rounded-lg p-4">
//           <div className="text-2xl font-bold text-yellow-600">
//             {stats.queued}
//           </div>
//           <div className="text-sm text-yellow-700">Queued</div>
//         </div>
//         {/* <div className="bg-white/90 backdrop-blur-md border border-red-200/50 rounded-lg p-4">
//             <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
//             <div className="text-sm text-red-700">Expired</div>
//           </div> */}
//       </div>
//     );
//   }
// );

// SubscriptionStats.displayName = "SubscriptionStats";

// // Main Content Component
// const Content: React.FC = () => {
//   const { subscriptions, loading, refetch } = useSubscriptions();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [selectedSubscription, setSelectedSubscription] =
//     useState<Subscription | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleAddNew = useCallback(() => {
//     setSelectedSubscription(null);
//     setIsModalOpen(true);
//   }, []);

//   const handleActivationSuccess = useCallback(async () => {
//     // Refresh subscriptions after successful activation
//     await refetch();
//   }, [refetch]);

//   const handleEdit = useCallback((subscription: Subscription) => {
//     setSelectedSubscription(subscription);
//     setIsModalOpen(true);
//   }, []);

//   const handleDelete = useCallback((subscription: Subscription) => {
//     setSelectedSubscription(subscription);
//     setIsDeleteModalOpen(true);
//   }, []);

//   const handleSaveSubscription = useCallback(
//     async (subscriptionData: any) => {
//       try {
//         // Check if subscriptionData is FormData (for file uploads) or regular object
//         const isFormData = subscriptionData instanceof FormData;

//         let url, method;
//         if (isFormData) {
//           // For FormData, check if there's an ID for editing
//           const id = subscriptionData.get("id");
//           url = id ? `/api/subscriptions/${id}` : "/api/subscriptions/new";
//           method = id ? "PATCH" : "POST";
//         } else {
//           // For regular JSON data (backward compatibility)
//           url = subscriptionData.id
//             ? `/api/subscriptions/${subscriptionData.id}`
//             : "/api/subscriptions/new";
//           method = subscriptionData.id ? "PATCH" : "POST";
//         }

//         const fetchOptions: RequestInit = {
//           method,
//         };

//         if (isFormData) {
//           // For FormData, don't set Content-Type - browser will set it automatically
//           fetchOptions.body = subscriptionData;
//         } else {
//           // For JSON data
//           fetchOptions.headers = {
//             "Content-Type": "application/json",
//           };
//           fetchOptions.body = JSON.stringify(subscriptionData);
//         }

//         const response = await fetch(url, fetchOptions);

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || "Failed to save subscription");
//         }

//         // Refetch subscriptions after successful save
//         await refetch();
//       } catch (error) {
//         console.error("Error saving subscription:", error);
//         throw error;
//       }
//     },
//     [refetch]
//   );

//   const handleConfirmDelete = useCallback(async () => {
//     if (!selectedSubscription) return;

//     setIsDeleting(true);
//     try {
//       const response = await fetch(
//         `/api/subscriptions/${selectedSubscription._id}`,
//         {
//           method: "DELETE",
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to delete subscription");
//       }

//       // Refetch subscriptions after successful delete
//       await refetch();
//       setIsDeleteModalOpen(false);
//       setSelectedSubscription(null);
//     } catch (error) {
//       console.error("Error deleting subscription:", error);
//     } finally {
//       setIsDeleting(false);
//     }
//   }, [selectedSubscription, refetch]);

//   return (
//     <>
//       <div className="flex w-full">
//         <div className="w-full dis-none h-full hidden sm:block sm:w-20 xl:w-60 flex-shrink-0" />
//         <div className="h-full flex-grow overflow-x-hidden overflow-auto flex flex-wrap content-start p-2">
//           {/* Hero Section */}
//           <div className="w-full p-2 h-80 relative rounded-lg mb-6">
//             <Image
//               src="/images/bgClock.png"
//               alt="Subscriptions background"
//               fill
//               className="object-cover rounded-lg"
//               priority
//             />
//             <div className="absolute inset-0 bg-black/30 rounded-lg" />
//             <div className="absolute bottom-8 left-8">
//               <h1 className="text-4xl font-bold text-white mb-2">
//                 Encryption Management
//               </h1>
//               <p className="text-white/80">
//                 Manage your device encryptions and plans
//               </p>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="w-full p-2 flex items-center gap-[3rem]">
//             <SubscriptionStats subscriptions={subscriptions} />

//             <button
//               onClick={handleAddNew}
//               className="flex h-fit items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//             >
//               <Plus size={16} />
//               <span className="whitespace-nowrap">New Encryption</span>
//             </button>
//           </div>

//           {/* Main Content */}
//           <div className="w-full p-2">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-bold text-white">
//                 Your Encryptions
//               </h2>
//             </div>

//             {loading ? (
//               <div className="flex justify-center py-12">
//                 <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
//               </div>
//             ) : subscriptions.length === 0 ? (
//               <div className="text-center py-12">
//                 <Monitor size={48} className="mx-auto text-gray-400 mb-4" />
//                 <h3 className="text-lg font-semibold text-black mb-2">
//                   No Encryptions Yet
//                 </h3>
//                 <p className="text-gray-600 mb-4">
//                   Start by adding your first device encryption
//                 </p>
//                 <button
//                   onClick={handleAddNew}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                 >
//                   Add First Encryption
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {subscriptions.map((subscription: any) => (
//                   <EncryptionCard
//                     key={subscription._id}
//                     subscription={subscription}
//                     onActivationSuccess={handleActivationSuccess}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       <SubscriptionModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         subscription={selectedSubscription || undefined}
//         onSave={handleSaveSubscription}
//       />

//       <DeleteConfirmationModal
//         isOpen={isDeleteModalOpen}
//         onClose={() => setIsDeleteModalOpen(false)}
//         onConfirm={handleConfirmDelete}
//         subscription={selectedSubscription || undefined}
//         isLoading={isDeleting}
//       />
//     </>
//   );
// };

// // Main Subscriptions Page Component
// const EncryptionsPage: React.FC = () => {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status === "loading") return;

//     if (!session) {
//       router.push("/api/auth/signin");
//       return;
//     }
//   }, [session, status, router]);

//   if (status === "loading") {
//     return <LoadingFallback />;
//   }

//   return (
//     <Suspense fallback={<LoadingFallback />}>
//       <Content />
//     </Suspense>
//   );
// };

// export default EncryptionsPage;


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
import { toast, Toaster } from "sonner";
import LoadingFallback from "../FallbackLoading";
import { useRouter } from "next/navigation";
import { capitalizeFirstLetter } from "@/lib/utils";
import EncryptionCard from "../EncryptionCard";

// TypeScript interfaces
interface Subscription {
  id: string;
  user: string;
  deviceName: string;
  imei: string;
  phone: string;
  email: string;
  subscriptionType: string;
  subscriptionCards: string[];
  startDate: string;
  endDate: string;
  status: "PENDING" | "QUEUED" | "ACTIVE" | "EXPIRED" | "DECLINED";
  queuePosition?: number;
  createdAt: string;
  updatedAt: string;
}

// Predefined subscription types with durations
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

function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscriptions");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch subscriptions: ${response.statusText}`
        );
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to Load Subscriptions", {
        description:
          "Unable to retrieve your encryption subscriptions. Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return { subscriptions, loading, refetch: fetchSubscriptions };
}

const SubscriptionModal = React.memo(
  ({
    isOpen,
    onClose,
    subscription,
    onSave,
  }: {
    isOpen: boolean;
    onClose: () => void;
    subscription?: Subscription;
    onSave: (subscriptionData: any) => Promise<void>;
  }) => {
    const [formData, setFormData] = useState({
      deviceName: "",
      imei: "",
      phoneNumber: "",
      email: "",
      subscriptionType: "",
      subscriptionCards: [] as File[],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [uploadError, setUploadError] = useState<string>("");

    // Reset form when modal opens/closes
    React.useEffect(() => {
      if (isOpen) {
        if (subscription) {
          setFormData({
            deviceName: subscription.deviceName,
            imei: subscription.imei,
            phoneNumber: subscription.phone,
            email: subscription.email,
            subscriptionType: subscription.subscriptionType,
            subscriptionCards: [],
          });
        } else {
          setFormData({
            deviceName: "",
            imei: "",
            phoneNumber: "",
            email: "",
            subscriptionType: "",
            subscriptionCards: [],
          });
        }
        setUploadError("");
      }
    }, [isOpen, subscription]);

    const handleInputChange = useCallback((field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleFileUpload = useCallback((files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];

      // Validate files
      for (const file of fileArray) {
        if (file.size > maxSize) {
          const errorMsg = `File ${file.name} is too large. Maximum size is 5MB.`;
          setUploadError(errorMsg);
          toast.error("File Too Large", {
            description: errorMsg,
          });
          return;
        }
        if (!allowedTypes.includes(file.type)) {
          const errorMsg = `File ${file.name} has an invalid type. Only JPEG, PNG, and PDF files are allowed.`;
          setUploadError(errorMsg);
          toast.error("Invalid File Type", {
            description: errorMsg,
          });
          return;
        }
      }

      setUploadError("");
      setFormData((prev) => ({
        ...prev,
        subscriptionCards: [...prev.subscriptionCards, ...fileArray],
      }));

      // toast.success("Files Added", {
      //   description: `${fileArray.length} file(s) uploaded successfully`,
      // });
    }, []);

    const removeFile = useCallback((index: number) => {
      setFormData((prev) => ({
        ...prev,
        subscriptionCards: prev.subscriptionCards.filter((_, i) => i !== index),
      }));
    }, []);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
          // Create FormData for file upload
          const submitData = new FormData();

          // Add form fields
          submitData.append("deviceName", formData.deviceName);
          submitData.append("imei", formData.imei);
          submitData.append("phoneNumber", formData.phoneNumber);
          submitData.append("email", formData.email);
          submitData.append("subscriptionType", formData.subscriptionType);

          // Add subscription card files
          formData.subscriptionCards.forEach((file, index) => {
            submitData.append("subscriptionCards", file);
          });

          // Add ID for editing
          if (subscription?.id) {
            submitData.append("id", subscription.id);
          }

          await onSave(submitData);

          toast.success(
            subscription ? "Subscription Updated!" : "Subscription Created!",
            {
              description: subscription
                ? `${formData.deviceName} subscription has been updated successfully`
                : `${formData.deviceName} subscription has been submitted for review`,
            }
          );

          onClose();
        } catch (error: any) {
          console.error("Failed to save subscription:", error);
          toast.error("Submission Failed", {
            description:
              error.message || "Failed to save subscription. Please try again.",
          });
        } finally {
          setIsLoading(false);
        }
      },
      [formData, onSave, onClose, subscription]
    );

    // Form validation
    const isFormValid =
      formData.deviceName &&
      formData.imei &&
      formData.phoneNumber &&
      formData.email &&
      formData.subscriptionType &&
      (formData.subscriptionCards.length > 0 || subscription);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white/50 backdrop-blur-md rounded-lg shadow-xl border border-white/20 max-h-[90vh] no-scrollbar overflow-y-auto">
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Device Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black border-b border-gray-200 pb-2">
                Device Information
              </h3>

              {/* Device Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">
                  Device Name *
                </label>
                <input
                  type="text"
                  value={formData.deviceName}
                  onChange={(e) =>
                    handleInputChange("deviceName", e.target.value)
                  }
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                  placeholder="e.g., iPhone 15 Pro, Samsung Galaxy S24"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* IMEI */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">
                  IMEI *
                </label>
                <input
                  type="text"
                  value={formData.imei}
                  onChange={(e) => handleInputChange("imei", e.target.value)}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                  placeholder="Enter 15-digit IMEI number"
                  pattern="[0-9]{15}"
                  maxLength={15}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-600">
                  This will be used to identify your device and manage
                  subscription queue
                </p>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black border-b border-gray-200 pb-2">
                Contact Information
              </h3>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                  placeholder="+1 (555) 123-4567"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                  placeholder="user@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Subscription Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black border-b border-gray-200 pb-2">
                Subscription Plan
              </h3>

              {/* Subscription Type Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">
                  Select Subscription Plan *
                </label>
                <select
                  value={formData.subscriptionType}
                  onChange={(e) =>
                    handleInputChange("subscriptionType", e.target.value)
                  }
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                  required
                  disabled={isLoading}
                >
                  <option value="">Choose a subscription plan...</option>
                  {Object.entries(SUBSCRIPTION_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {formData.subscriptionType && (
                  <p className="text-sm text-gray-600">
                    {
                      SUBSCRIPTION_TYPES[
                        formData.subscriptionType as keyof typeof SUBSCRIPTION_TYPES
                      ]?.description
                    }
                  </p>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black border-b border-gray-200 pb-2">
                Encryption Verification Documents *
              </h3>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">
                  Upload Encryption Card(s) *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                    disabled={isLoading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-gray-600">
                      <svg
                        className="mx-auto h-12 w-12 mb-4"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-sm">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF up to 5MB each
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Required: Screenshots of payment confirmation,
                        subscription receipt, etc.
                      </p>
                    </div>
                  </label>
                </div>

                {uploadError && (
                  <p className="text-sm text-red-600">{uploadError}</p>
                )}

                {!subscription && formData.subscriptionCards.length === 0 && (
                  <p className="text-sm text-red-600">
                    Please upload at least one verification document.
                  </p>
                )}
              </div>

              {/* Uploaded Files Preview */}
              {formData.subscriptionCards.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">
                    Uploaded Files ({formData.subscriptionCards.length})
                  </label>
                  <div className="space-y-2">
                    {formData.subscriptionCards.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-1 bg-blue-100 rounded">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-700 truncate">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          disabled={isLoading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
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
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isLoading
                  ? "Submitting..."
                  : subscription
                  ? "Update Subscription"
                  : "Submit for Review"}
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
              Are you sure you want to delete the subscription for{" "}
              <span className="font-medium">{subscription.deviceName}</span>?
              This action cannot be undone.
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

// Subscription Stats Component
const SubscriptionStats = React.memo(
  ({ subscriptions }: { subscriptions: Subscription[] }) => {
    const stats = useMemo(() => {
      const active = subscriptions.filter((s) => s.status === "ACTIVE").length;
      const queued = subscriptions.filter((s) => s.status === "QUEUED").length;

      return {
        active,
        queued,
        total: subscriptions.length,
      };
    }, [subscriptions]);

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
        <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-black">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white/90 backdrop-blur-md border border-green-200/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
          <div className="text-sm text-green-700">Active</div>
        </div>
        <div className="bg-white/90 backdrop-blur-md border border-yellow-200/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.queued}
          </div>
          <div className="text-sm text-yellow-700">Queued</div>
        </div>
      </div>
    );
  }
);

SubscriptionStats.displayName = "SubscriptionStats";

// Main Content Component
const Content: React.FC = () => {
  const { subscriptions, loading, refetch } = useSubscriptions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddNew = useCallback(() => {
    setSelectedSubscription(null);
    setIsModalOpen(true);
  }, []);

  const handleActivationSuccess = useCallback(async () => {
    await refetch();
  }, [refetch]);

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
        const isFormData = subscriptionData instanceof FormData;

        let url, method;
        if (isFormData) {
          const id = subscriptionData.get("id");
          url = id ? `/api/subscriptions/${id}` : "/api/subscriptions/new";
          method = id ? "PATCH" : "POST";
        } else {
          url = subscriptionData.id
            ? `/api/subscriptions/${subscriptionData.id}`
            : "/api/subscriptions/new";
          method = subscriptionData.id ? "PATCH" : "POST";
        }

        const fetchOptions: RequestInit = {
          method,
        };

        if (isFormData) {
          fetchOptions.body = subscriptionData;
        } else {
          fetchOptions.headers = {
            "Content-Type": "application/json",
          };
          fetchOptions.body = JSON.stringify(subscriptionData);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save subscription");
        }

        await refetch();
      } catch (error: any) {
        console.error("Error saving subscription:", error);
        toast.error("Save Failed", {
          description:
            error.message || "Failed to save subscription. Please try again.",
        });
        throw error;
      }
    },
    [refetch]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedSubscription) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/subscriptions/${selectedSubscription.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete subscription");
      }

      toast.success("Subscription Deleted", {
        description: `${selectedSubscription.deviceName} subscription has been removed`,
      });

      await refetch();
      setIsDeleteModalOpen(false);
      setSelectedSubscription(null);
    } catch (error: any) {
      console.error("Error deleting subscription:", error);
      toast.error("Delete Failed", {
        description:
          error.message || "Failed to delete subscription. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [selectedSubscription, refetch]);

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
                Encryption Management
              </h1>
              <p className="text-white/80">
                Manage your device encryptions and plans
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="w-full p-2 flex items-center gap-[3rem]">
            <SubscriptionStats subscriptions={subscriptions} />

            <button
              onClick={handleAddNew}
              className="flex h-fit items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
              <span className="whitespace-nowrap">New Encryption</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="w-full p-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Your Encryptions
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <Monitor size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">
                  No Encryptions Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start by adding your first device encryption
                </p>
                <button
                  onClick={handleAddNew}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add First Encryption
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptions.map((subscription: any) => (
                  <EncryptionCard
                    key={subscription._id}
                    subscription={subscription}
                    onActivationSuccess={handleActivationSuccess}
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
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        subscription={selectedSubscription || undefined}
        isLoading={isDeleting}
      />

      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
          className: "my-toast",
          duration: 4000,
        }}
        richColors
      />
    </>
  );
};

// Main Subscriptions Page Component
const EncryptionsPage: React.FC = () => {
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

export default EncryptionsPage;