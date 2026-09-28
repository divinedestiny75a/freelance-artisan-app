// pages/gigs/index.tsx
import NavBar from "../../components/NavBar";
import { supabase } from "../../utils/supabaseClient";
import useSWR from "swr";
import GigCard from "../../components/GigCard";
import type { Database } from "../../supabase/types";

const fetcher = async (url: string) => {
  const { data, error } = await supabase.from("gigs").select("*").eq("status", "open");
  if (error) throw error;
  return data as Database["public"]["Tables"]["gigs"]["Row"][];
};

export default function GigsPage() {
  const { data: gigs, error, isLoading } = useSWR("/gigs", fetcher);

  return (
    <>
      <NavBar />
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Open Gigs</h1>
        {isLoading && <p>Loading gigs...</p>}
        {error && <p className="text-red-600">Failed to load gigs.</p>}
        {gigs && gigs.length === 0 && <p>No gigs at the moment.</p>}
        {gigs && gigs.map((gig) => (
          <GigCard key={gig.id} gig={gig} />
        ))}
      </main>
    </>
  );
}
