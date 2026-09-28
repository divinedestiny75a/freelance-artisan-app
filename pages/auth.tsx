// pages/auth.tsx
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useUser } from "../utils/useUser";
import NavBar from "../components/NavBar";
import { useRouter } from "next/router";

export default function AuthPage() {
  const { user } = useUser();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const requestOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else {
      setMessage("OTP sent. Check your phone.");
      setStage("otp");
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else {
      setMessage("Signed in!");
      router.push("/");
    }
  };

  if (user) {
    router.replace("/");
    return null;
  }

  return (
    <>
      <NavBar />
      <main className="max-w-md mx-auto mt-10 p-4">
        <h2 className="text-2xl font-bold mb-4">Sign In / Register</h2>
        {stage === "phone" && (
          <>
            <input
              type="tel"
              placeholder="Enter phone number (+234... )"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={requestOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}
        {stage === "otp" && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
        {message && <p className="mt-4 text-center text-red-600">{message}</p>}
      </main>
    </>
  );
}
