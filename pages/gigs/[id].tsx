// pages/gigs/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { supabase } from "../../utils/supabaseClient";
import type { Database } from "../../supabase/types";
import GigCard from "../../components/GigCard";
import Link from "next/link";
import { useUser } from "../../utils/useUser";

// after existing imports (add needed ones)

import PaystackButton from "../../components/PaystackButton";

export default function GigDetail() {
  const router = useRouter();
  
  const { id } = router.query as { id: string };
  const { user } = useUser();
  const [gig, setGig] = useState<Database["public"]["Tables"]["gigs"]["Row"] | null>(null);
  const [applications, setApplications] = useState<Database["public"]["Tables"]["gig_applications"]["Row"][]>([]);
  const [escrow, setEscrow] = useState<Database["public"]["Tables"]["escrows"]["Row"] | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      // Gig
      const { data: gigData, error: gigErr } = await supabase
        .from("gigs")
        .select("*")
        .eq("id", id)
        .single();
      if (gigErr) { console.error(gigErr); setLoading(false); return; }
      setGig(gigData as any);

      // Applications
      const { data: appData, error: appErr } = await supabase
        .from("gig_applications")
        .select("*")
        .eq("gig_id", id);
      if (!appErr && appData) setApplications(appData as any);

      // Escrow (if any)
      const { data: escData, error: escErr } = await supabase
        .from("escrows")
        .select("*")
        .eq("gig_id", id)
        .single();
      if (!escErr && escData) setEscrow(escData as any);

      setLoading(false);
    };
    fetchData();
  }, [id]);

  const releaseFunds = async () => {
    if (!escrow) return;
    const { error } = await supabase
      .from("escrows")
      .update({ status: "released" })
      .eq("id", escrow.id);
    if (error) alert(error.message);
    else {
      alert("Funds released to artisan.");
      setEscrow({ ...escrow, status: "released" } as any);
    }
  };

  const submitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gig) return;
    // Find the accepted application to get artisan_id
    const acceptedApp = applications.find(a => a.status === "accepted");
    if (!acceptedApp) { alert("No accepted application found."); return; }
    // Update artisan profile rating (simple average for demo)
    const { data: artisan, error: artErr } = await supabase
      .from("artisan_profiles")
      .select("rating, review_count")
      .eq("id", acceptedApp.artisan_id)
      .single();
    if (artErr) { alert(artErr.message); return; }
    const newCount = (artisan?.review_count ?? 0) + 1;
    const newRating = ((artisan?.rating ?? 0) * (artisan?.review_count ?? 0) + rating) / newCount;
    const { error: updErr } = await supabase
      .from("artisan_profiles")
      .update({ rating: newRating, review_count: newCount })
      .eq("id", acceptedApp.artisan_id);
    if (updErr) alert(updErr.message);
    else alert("Thank you for rating the artisan!");
  };

  if (loading) return (<> <NavBar /> <p className="p-4">Loading...</p> </>);
  if (!gig) return (<> <NavBar /> <p className="p-4 text-red-600">Gig not found.</p> </>);

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto p-4">
        <GigCard gig={gig} />
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Applications</h2>
          {applications.length === 0 ? (
            <p>No applications yet.</p>
          ) : (
            <ul className="space-y-2">
              {applications.map((app) => (
                <li key={app.id} className="border p-2 rounded bg-gray-50">
                  <p><strong>Artisan ID:</strong> {app.artisan_id}</p>
                  <p><strong>Cover Letter:</strong> {app.cover_letter}</p>
                  <p><strong>Proposed Price:</strong> ₦{app.proposed_price?.toLocaleString()}</p>
                  <p><strong>Status:</strong> {app.status}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        {/* Client actions – accept/reject already added earlier */}
        {user && gig && gig.client_id === user.id && (
          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Manage Applications</h2>
            {applications.map((app) => (
              <div key={app.id} className="border p-2 rounded bg-gray-100 mb-2 flex justify-between items-center">
                <div>
                  <p><strong>Artisan ID:</strong> {app.artisan_id}</p>
                  <p><strong>Proposed:</strong> ₦{app.proposed_price?.toLocaleString()}</p>
                  <p><strong>Status:</strong> {app.status}</p>
                </div>
                {app.status === "pending" && (
                  <div className="space-x-2">
                    <button
                      onClick={async () => {
                        const { error: updErr } = await supabase.from("gig_applications").update({ status: "accepted" }).eq("id", app.id);
                        if (updErr) return alert(updErr.message);
                        // Create escrow (amount = proposed_price or gig budget)
                        const { data: esc, error: escErr } = await supabase.from("escrows").insert({ gig_id: gig.id, amount: app.proposed_price || gig.budget }).single();
                        if (escErr) return alert(escErr.message);
                        // Send notifications (email/SMS) – simple fetch to API routes
                        await fetch("/api/sendEmail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: user.email, subject: "Application Accepted", text: `Your application for "${gig.title}" has been accepted. Please proceed to payment.` }) });
                        await fetch("/api/sendSMS", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: user.phone, body: `Application accepted for ${gig.title}. Pay now.` }) });
                        router.replace(router.asPath);
                      }}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >Accept</button>
                    <button
                      onClick={async () => {
                        const { error: updErr } = await supabase.from("gig_applications").update({ status: "rejected" }).eq("id", app.id);
                        if (updErr) return alert(updErr.message);
                        router.replace(router.asPath);
                      }}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >Reject</button>
                  </div>
                )}
                {app.status === "accepted" && (
                  <PaystackButton gigId={gig.id} amount={app.proposed_price || gig.budget} />
                )}
              </div>
            ))}
          </section>
        )}
        {/* Escrow release for client */}
        {user && gig && gig.client_id === user.id && escrow && escrow.status === "paid" && (
          <section className="mt-6">
            <button onClick={releaseFunds} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Release Funds to Artisan
            </button>
          </section>
        )}
        {/* Rating after completion */}
        {user && gig && gig.client_id === user.id && gig.status === "completed" && (
          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Rate the Artisan</h2>
            <form onSubmit={submitRating} className="space-y-3">
              <label>
                Rating (1‑5):
                <select value={rating} onChange={e => setRating(Number(e.target.value))} className="ml-2 p-1 border rounded">
                  <option value={0}>Select</option>
                  {[1,2,3,4,5].map(n => (<option key={n} value={n}>{n}</option>))}
                </select>
              </label>
              <textarea placeholder="Write a short review (optional)" value={review} onChange={e => setReview(e.target.value)} className="w-full p-2 border rounded" rows={3} />
              <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded">Submit Rating</button>
            </form>
          </section>
        )}
        {/* Apply button for artisans */}
        <section className="mt-6">
          <Link href={`/gigs/${id}/apply`} className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Apply to this Gig
          </Link>
        </section>
      </main>
    </>
  );
}

