// pages/gigs/new.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import { supabase } from "../../utils/supabaseClient";
import { useUser } from "../../utils/useUser";

type GigForm = {
  title: string;
  description: string;
  budget: string;
  location: string;
  required_skills: string;
  deadline: string;
};

export default function NewGig() {
  const { user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState<GigForm>({
    title: "",
    description: "",
    budget: "",
    location: "",
    required_skills: "",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);

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
      client_id: user.id,
      title: form.title,
      description: form.description,
      budget: Number(form.budget),
      location: form.location || null,
      required_skills: form.required_skills ? form.required_skills.split(/\s*,\s*/).filter(Boolean) : null,
      deadline: form.deadline || null,
    };
    const { error } = await supabase.from("gigs").insert(payload as any);
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert("Gig posted!");
      router.push("/gigs");
    }
  };

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto mt-8 p-4">
        <h2 className="text-2xl font-bold mb-4">Post a New Gig</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full p-2 border rounded"
          />
          <input
            name="budget"
            placeholder="Budget (₦)"
            type="number"
            value={form.budget}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            name="location"
            placeholder="Location (optional)"
            value={form.location}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="required_skills"
            placeholder="Required skills (comma separated)"
            value={form.required_skills}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            name="deadline"
            placeholder="Deadline (YYYY-MM-DD)"
            type="date"
            value={form.deadline}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Posting..." : "Post Gig"}
          </button>
        </form>
      </main>
    </>
  );
}
