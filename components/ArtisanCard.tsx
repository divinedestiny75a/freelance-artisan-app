// components/ArtisanCard.tsx
import Image from "next/image";
import Link from "next/link";
import type { Database } from "../supabase/types";

type Artisan = Database["public"]["Tables"]["artisan_profiles"]["Row"];

export default function ArtisanCard({ artisan }: { artisan: Artisan }) {
  return (
    <div className="border rounded shadow p-4 bg-white">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div>
          <h3 className="font-semibold text-lg">{artisan.name}</h3>
          <p className="text-sm text-gray-500">{artisan.location}</p>
          <p className="text-sm">Rating: {artisan.rating?.toFixed(1) ?? "0"} ⭐️</p>
        </div>
      </div>
      <Link
        href={`/artisan/${artisan.id}`}
        className="mt-2 inline-block text-blue-600 hover:underline"
      >
        View profile
      </Link>
    </div>
  );
}
