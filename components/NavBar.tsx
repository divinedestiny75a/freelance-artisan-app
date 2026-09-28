// components/NavBar.tsx
import Link from "next/link";
import { useUser } from "../utils/useUser";
import { supabase } from "../utils/supabaseClient";

export default function NavBar() {
  const { user } = useUser();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex space-x-4">
        <Link href="/" className="font-semibold text-lg text-blue-600">
          ArtisanMatch
        </Link>
        <Link href="/gigs" className="text-gray-700 hover:text-blue-500">
          Gigs
        </Link>
        {user && (
          <Link href="/profile" className="text-gray-700 hover:text-blue-500">
            My Profile
          </Link>
        )}
        {user && (
          <Link href="/gigs/new" className="text-gray-700 hover:text-blue-500">
            Post Gig
          </Link>
        )}
      </div>
      <div>
        {user ? (
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Sign Out
          </button>
        ) : (
          <Link href="/auth" className="bg-blue-600 text-white px-3 py-1 rounded">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
