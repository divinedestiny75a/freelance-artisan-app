// pages/index.tsx
import Head from "next/head";
import NavBar from "../components/NavBar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>ArtisanMatch – Connect Rural Artisans with Gigs</title>
        <meta name="description" content="Find skilled artisans in rural Nigeria or post a gig for them." />
      </Head>
      <NavBar />
      <main className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">ArtisanMatch</h1>
        <p className="text-lg mb-6">
          A free platform that connects rural artisans with clients who need their skills.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/gigs"
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Browse Gigs
          </Link>
          <Link
            href="/auth"
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            Sign In / Register
          </Link>
        </div>
      </main>
    </>
  );
}
