// pages/profile.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import { supabase } from "../utils/supabaseClient";
import { useUser } from "../utils/useUser";
import type { Database } from "../supabase/types";

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Database["public"]["Tables"]["artisan_profiles"]["Row"] | null>(null);
  const [form, setForm] = useState({ name: "", location: "", skill_tags: "", bio: "", portfolio_url: "" });

  // fetch existing profile if any
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("artisan_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error && error.code !== "PGRST116") {
        console.error(error);
      } else if (data) {
        setProfile(data);
        setForm({
          name: data.name,
          location: data.location ?? "",
          skill_tags: data.skill_tags?.join(", ") ?? "",
          bio: data.bio ?? "",
          portfolio_url: data.portfolio_url ?? "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  if (!user) {
    router.replace("/auth");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      user_id: user.id,
      name: form.name,
      location: form.location || null,
      skill_tags: form.skill_tags ? form.skill_tags.split(/\s*,\s*/).filter(Boolean) : null,
      bio: form.bio || null,
      portfolio_url: form.portfolio_url || null,
    };
    let result;
    if (profile) {
      result = await supabase.from("artisan_profiles").update(payload).eq("id", profile.id);
    } else {
      result = await supabase.from("artisan_profiles").insert(payload);
    }
    if (result.error) {
      alert(result.error.message);
    } else {
      alert("Profile saved!");
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <>
      <NavBar />
      <main className="max-w-lg mx-auto mt-8 p-4">
        <h2 className="text-2xl font-bold mb-4">My Artisan Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            name="location"
            placeholder="Location (city/state)"
            value={form.location}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="skill_tags"
            placeholder="Skills (comma separated)"
            value={form.skill_tags}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <textarea
            name="bio"
            placeholder="Short bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border rounded"
          />
          <input
            name="portfolio_url"
            placeholder="Portfolio URL (optional)"
            value={form.portfolio_url}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            {loading ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </main>
    </>
  );
}
