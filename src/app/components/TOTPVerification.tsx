import React, { useState } from "react";

interface TOTPVerificationProps {
  email: string;
  onVerificationSuccess?: () => void;
}

const TOTPVerification: React.FC<TOTPVerificationProps> = ({
  email,
  onVerificationSuccess,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-totp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token: code,
        }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setSuccess(true);
        onVerificationSuccess?.();
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setCode(value);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-xl font-semibold text-green-800 mb-4">
          ✅ Verification Successful!
        </h2>
        <p className="text-green-700">
          Your authenticator code has been verified and your custom API call was
          executed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        🔐 Enter Authentication Code
      </h2>

      <p className="text-gray-600 mb-6">
        Open your authenticator app and enter the 6-digit code for{" "}
        <strong>{email}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            6-Digit Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
            maxLength={6}
            autoComplete="one-time-code"
            required
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">❌ {error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "⏳ Verifying..." : "Verify Code"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          ⏱️ Code expires in 30 seconds. Get a new code from your authenticator
          app if needed.
        </p>
      </div>
    </div>
  );
};

export default TOTPVerification;
