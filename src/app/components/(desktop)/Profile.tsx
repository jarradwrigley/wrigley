"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import { BadgeCheck, Cake, PenLine, User, X, Save, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import useSWR from "swr"; // Better data fetching
import LoadingFallback from "../FallbackLoading";
import Subscription from "../Subscription";
import { useRouter } from "next/navigation";
import { useStore } from "../../../../store/store";
import { capitalizeFirstLetter } from "@/lib/utils";

// Proper TypeScript interfaces
interface Profile {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  followers?: any[];
  following?: any[];
  bio?: string;
  gender?: string;
  dob?: string;
}

interface ProfileResponse {
  profile: Profile;
}

// Extract fetcher function
const fetcher = async (url: string): Promise<ProfileResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  return response.json();
};

// Optimized profile hook with caching
function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<ProfileResponse>(
    "/api/profile",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    profile: data?.profile || {},
    loading: isLoading,
    error,
    mutate, // For updating cache after edit
  };
}

// Edit Profile Modal Component
const EditProfileModal = React.memo(
  ({
    isOpen,
    onClose,
    profile,
    onSave,
  }: {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile;
    onSave: (updatedProfile: Profile) => Promise<void>;
  }) => {
    const [formData, setFormData] = useState<Profile>({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      bio: profile.bio || "",
      gender: profile.gender || "",
      dob: profile.dob || "",
      profilePic: profile.profilePic || "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Reset form when modal opens/closes
    React.useEffect(() => {
      if (isOpen) {
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          bio: profile.bio || "",
          gender: profile.gender || "",
          dob: profile.dob || "",
          profilePic: profile.profilePic || "",
        });
        setPreviewImage(null);
      }
    }, [isOpen, profile]);

    const handleInputChange = useCallback(
      (field: keyof Profile, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
      },
      []
    );

    const handleImageChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setPreviewImage(result);
            setFormData((prev) => ({ ...prev, profilePic: result }));
          };
          reader.readAsDataURL(file);
        }
      },
      []
    );

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
          await onSave(formData);
          onClose();
        } catch (error) {
          console.error("Failed to save profile:", error);
          // You might want to show an error toast here
        } finally {
          setIsLoading(false);
        }
      },
      [formData, onSave, onClose]
    );

    const formatDateForInput = useCallback((dateString?: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    }, []);

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
            <h2 className="text-xl font-semibold text-black">Edit Profile</h2>
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
            {/* Profile Picture */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {previewImage || formData.profilePic ? (
                    <Image
                      src={previewImage || formData.profilePic || ""}
                      alt="Profile preview"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={24} className="text-gray-400" />
                  )}
                </div>
                <label className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors">
                  <Upload size={16} />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <div className="space-y-2 w-[48%]">
                <label className="block text-sm font-medium text-black">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName || ""}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2 w-[48%]">
                <label className="block text-sm font-medium text-black">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName || ""}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                Bio
              </label>
              <textarea
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={3}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 resize-none"
                placeholder="Tell us about yourself..."
                disabled={isLoading}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                Gender
              </label>
              <select
                value={formData.gender || ""}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                disabled={isLoading}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">
                Date of Birth
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.dob)}
                onChange={(e) => handleInputChange("dob", e.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                disabled={isLoading}
              />
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
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

EditProfileModal.displayName = "EditProfileModal";

// Memoized profile stats component
const ProfileStats = React.memo(({ profile }: { profile: Profile }) => {
  const followerCount = profile.followers?.length ?? 0;
  const followingCount = profile.following?.length ?? 0;

  return (
    <div className="flex items-center gap-2">
      <h2 className="font-bold text-xs">
        {followerCount}
        <span className="font-light">
          {" "}
          {followerCount === 1 ? "follower" : "followers"}
        </span>
      </h2>
      <span>•</span>
      <h2 className="font-bold text-xs">
        {followingCount}
        <span className="font-light"> following</span>
      </h2>
    </div>
  );
});

ProfileStats.displayName = "ProfileStats";

// Optimized profile picture component
const ProfilePicture = React.memo(({ profile }: { profile: Profile }) => {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (profile.profilePic && !imageError) {
    return (
      <Image
        src={profile.profilePic}
        className="rounded-full"
        alt={`${profile.fullName || "User"}'s profile picture`}
        width={100}
        height={100}
        onError={handleImageError}
        priority // Since it's above the fold
      />
    );
  }

  return (
    <div className="w-[7rem] h-[7rem] bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
      {profile.fullName?.[0]?.toUpperCase() ?? "U"}
    </div>
  );
});

ProfilePicture.displayName = "ProfilePicture";

// Extracted profile info component
const ProfileInfo = React.memo(({ profile }: { profile: Profile }) => {
  const profileData = useMemo(
    () =>
      [
        profile.gender && {
          icon: User,
          label: profile.gender,
          subtitle: "Gender",
        },
        profile.dob && {
          icon: Cake,
          label: new Date(profile.dob).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          subtitle: "Birthday",
        },
      ].filter(Boolean),
    [profile.gender, profile.dob]
  );

  return (
    <>
      {profileData.map((item, index) => {
        if (!item) return null;
        const IconComponent = item.icon;

        return (
          <div key={index} className="flex py-3 items-center gap-3">
            <div className="p-2 bg-black/50 shadow-lg backdrop-blur-md rounded-full w-[2.5rem] h-[2.5rem] flex items-center justify-center">
              <IconComponent size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold">
                {capitalizeFirstLetter(item.label)}
              </span>
              <span className="text-xs font-light">{item.subtitle}</span>
            </div>
          </div>
        );
      })}
    </>
  );
});

ProfileInfo.displayName = "ProfileInfo";

// Main content component
const Content: React.FC = () => {
  const { updateUserProfile } = useStore();
  const { profile, loading, error, mutate } = useProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handle profile save
  const handleSaveProfile = useCallback(
    async (updatedProfile: Profile) => {
      try {
        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProfile),
        });

        if (!response.ok) {
          throw new Error("Failed to update profile");
        }

        const updatedData = await response.json();

        await updateUserProfile();

        // Update the cache with new data
        mutate({ profile: updatedData.profile }, false);
      } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
    },
    [mutate]
  );

  // Handle error state
  if (error) {
    return (
      <div className="flex w-full items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load profile</p>
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
          <div className="w-full p-2 lg:w-2/3 h-80 relative rounded-lg">
            <Image
              src="/images/bgClock.png"
              alt="Profile background"
              fill
              className="object-cover rounded-lg"
              priority
            />

            <div className="absolute bottom-[10%] p-1 bg-white/70 rounded-full left-[5%]">
              <ProfilePicture profile={profile} />
            </div>
          </div>

          {/* Profile Card */}
          <div className="w-full h-fit p-3 lg:w-1/3">
            <div className="h-fit p-3 shadow-lg backdrop-blur-md bg-white/40 border relative border-white/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl font-medium">
                  {profile.fullName || "User"}
                </span>
                <BadgeCheck size={16} fill="#1dcaff" />
              </div>

              <ProfileStats profile={profile} />

              <span className="text-xs font-extralight">
                {profile.bio || "Share something about yourself..."}
              </span>

              <div className="w-full h-[.2px] bg-black my-2" />

              <ProfileInfo profile={profile} />

              <div className="w-full flex justify-center">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-4 hover:bg-white/80 hover:text-black rounded-lg px-3 py-2 transition-colors"
                >
                  <PenLine size={16} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="w-full p-2 lg:w-2/3">
            <div className="rounded-lg bg-neutral-900 p-4">
              <h2 className="text-2xl font-cabin">Posts</h2>
              <div className="my-4 h-[.01rem] w-full bg-white/50" />
              <div className="flex flex-col gap-4 items-center w-full py-[10rem]">
                <span className="text-gray-500">
                  Your Blog Posts and Interactions will appear here
                </span>
              </div>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="w-full p-2 lg:w-1/3 flex flex-col gap-4">
            <h2 className="text-2xl font-cabin">Subscriptions</h2>
            <div className="w-full p-2 max-h-[35rem] overflow-y-auto no-scrollbar flex flex-col gap-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-lg bg-neutral-900">
                  <Subscription title="Mobile Only v4" percentage={28.0} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </>
  );
};

const DesktopProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { loading } = useProfile();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    // if (session.user.role !== "admin") {
    //   router.push("/denied");
    //   return;
    // }
  }, [session, status, router]);

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Content />
    </Suspense>
  );
};

export default DesktopProfilePage;
