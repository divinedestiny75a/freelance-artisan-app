// components/GigCard.tsx
import Link from "next/link";
import type { Database } from "../supabase/types";

type Gig = Database["public"]["Tables"]["gigs"]["Row"];

export default function GigCard({ gig }: { gig: Gig }) {
  return (
    <div className="border rounded shadow p-4 bg-white mb-4">
      <h3 className="text-xl font-semibold mb-1">{gig.title}</h3>
      <p className="text-gray-700 mb-2 line-clamp-2">{gig.description}</p>
      <p className="text-sm text-gray-600 mb-1">Budget: ₦{gig.budget.toLocaleString()}</p>
      {gig.location && <p className="text-sm text-gray-600 mb-1">Location: {gig.location}</p>}
      <Link
        href={`/gigs/${gig.id}`}
        className="inline-block mt-2 text-blue-600 hover:underline"
      >
        View Details
      </Link>
    </div>
  );
}
