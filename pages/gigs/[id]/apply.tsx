// pages/gigs/[id]/apply.tsx
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import NavBar from "../../../components/NavBar";
import { supabase } from "../../../utils/supabaseClient";
import { useUser } from "../../../utils/useUser";
import type { Database } from "../../../supabase/types";

export default function ApplyToGig() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [gig, setGig] = useState<Database["public"]["Tables"]["gigs"]["Row"] | null>(null);
  const [form, setForm] = useState({ cover_letter: "", proposed_price: "" });

  useEffect(() => {
    if (!id) return;
    const fetchGig = async () => {
      const { data, error } = await supabase.from("gigs").select("*").eq("id", id).single();
      if (error) console.error(error);
      else setGig(data as any);
      setLoading(false);
    };
    fetchGig();
  }, [id]);

  if (!user) {
    router.replace("/auth");
    return null;
  }

  if (loading) return (<><NavBar /><p className="p-4">Loading…</p></>);
  if (!gig) return (<><NavBar /><p className="p-4 text-red-600">Gig not found.</p></>);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      gig_id: gig.id,
      artisan_id: (await supabase
        .from("artisan_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()).data?.id,
      cover_letter: form.cover_letter || null,
      proposed_price: form.proposed_price ? Number(form.proposed_price) : null,
    };
    const { error } = await supabase.from("gig_applications").insert(payload as any);
    if (error) alert(error.message);
    else {
      alert("Application submitted!");
      router.push(`/gigs/${id}`);
    }
  };

  return (
    <>
      <NavBar />
      <main className="max-w-lg mx-auto mt-8 p-4">
        <h2 className="text-2xl font-bold mb-4">Apply to: {gig.title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            name="cover_letter"
            placeholder="Cover letter (optional)"
            value={form.cover_letter}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border rounded"
          />
          <input
            name="proposed_price"
            placeholder="Proposed price (₦)"
            type="number"
            value={form.proposed_price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Submit Application
          </button>
        </form>
      </main>
    </>
  );
}
