// components/PaystackButton.tsx
import { useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import type { Database } from "../supabase/types";

interface Props {
  gigId: string;
  amount: number; // amount in Naira (NGN)
  onSuccess?: (reference: string) => void;
}

export default function PaystackButton({ gigId, amount, onSuccess }: Props) {
  // Load Paystack script only once
  useEffect(() => {
    if (!document.getElementById("paystack-sdk")) {
      const script = document.createElement("script");
      script.id = "paystack-sdk";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePay = () => {
    // First create an escrow row in Supabase
    const createEscrow = async () => {
      const { data, error } = await supabase
        .from("escrows")
        .insert({ gig_id: gigId, amount })
        .single();
      if (error) {
        alert("Failed to create escrow: " + error.message);
        return null;
      }
      return data as Database["public"]["Tables"]["escrows"]["Row"];
    };

    createEscrow().then((escrow) => {
      if (!escrow) return;
      // @ts-ignore – the Paystack script adds a global `PaystackPop`
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: "placeholder@example.com", // In a real app you'd collect the client email
        amount: amount * 100, // convert to kobo
        ref: escrow.id,
        callback: function (response: any) {
          // On successful payment, update escrow status
          supabase
            .from("escrows")
            .update({ status: "paid", paystack_ref: response.reference })
            .eq("id", escrow.id)
            .then(() => {
              alert("Payment successful!\nReference: " + response.reference);
              if (onSuccess) onSuccess(response.reference);
            });
        },
        onClose: function () {
          alert("Payment window closed.");
        },
      });
      handler.openIframe();
    });
  };

  return (
    <button
      onClick={handlePay}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Pay ₦{amount.toLocaleString()}
    </button>
  );
}
