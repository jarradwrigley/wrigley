"use client";

import { useState } from "react";
import bcrypt from "bcryptjs";

export default function PasswordCompare() {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    try {
      const match = await bcrypt.compare(password, hash);
      setResult(match);
    } catch (error) {
      console.error("Error comparing passwords:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">🔐 Bcrypt Password Compare</h2>
      <input
        type="text"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-3 px-4 py-2 border rounded"
      />
      <input
        type="text"
        placeholder="Enter bcrypt hash"
        value={hash}
        onChange={(e) => setHash(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded"
      />
      <button
        onClick={handleCompare}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Comparing..." : "Compare Passwords"}
      </button>

      {result !== null && (
        <p
          className={`mt-4 text-center font-medium ${
            result ? "text-green-600" : "text-red-600"
          }`}
        >
          {result ? "✅ Match!" : "❌ No match."}
        </p>
      )}
    </div>
  );
}
