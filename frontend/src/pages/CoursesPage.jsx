import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";

function parseJwt(token) {
  if (!token) return {};
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

const initialForm = {
  title: "",
  description: "",
  courseType: "Theory"
};

export default function CoursesPage() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  // JWT'den DrivingSchoolId bul
  const jwtPayload = parseJwt(token);
  const drivingSchoolId = jwtPayload.DrivingSchoolId || jwtPayload.drivingSchoolId;

  // Kursları çek
  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError("");
      try {
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        const res = await fetch("http://192.168.1.78:5068/api/courses", { headers });
        if (!res.ok) throw new Error("Kurslar alınamadı");
        const data = await res.json();
        setCourses(data);
      } catch {
        setError("Kurslar alınamadı.");
      }
      setLoading(false);
    }
    fetchCourses();
  }, [showForm]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    if (!form.title) { setFormError("Kurs adı zorunlu"); return; }
    if (!form.courseType) { setFormError("Kurs türü zorunlu"); return; }
    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      const res = await fetch("http://192.168.1.78:5068/api/courses", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          courseType: form.courseType,
          drivingSchoolId
        })
      });
      if (res.ok) {
        setSuccess("Kurs başarıyla eklendi!");
        setForm(initialForm);
        setShowForm(false);
      } else {
        setFormError("Kurs eklenemedi!");
      }
    } catch {
      setFormError("Sunucu hatası!");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kurslar</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
        onClick={() => setShowForm(true)}
      >
        Yeni Kurs Ekle
      </button>
      {showForm && (
        <div className="bg-white dark:bg-[#161B22] rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Yeni Kurs Ekle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Kurs Adı *</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full p-2 rounded border" />
            </div>
            <div>
              <label className="block mb-1">Açıklama</label>
              <input name="description" value={form.description} onChange={handleChange} className="w-full p-2 rounded border" />
            </div>
            <div>
              <label className="block mb-1">Kurs Türü *</label>
              <select name="courseType" value={form.courseType} onChange={handleChange} className="w-full p-2 rounded border">
                <option value="Theory">Teorik</option>
                <option value="Practice">Pratik</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-blue-700 transition">Kaydet</button>
            {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}
            {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
          </form>
        </div>
      )}
      <div className="bg-white dark:bg-[#161B22] rounded-2xl shadow p-6 mb-8">
        <div className="text-lg font-semibold mb-4">Kayıtlı Kurslar</div>
        {loading ? (
          <div className="text-gray-500">Yükleniyor...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : courses.length === 0 ? (
          <div className="text-gray-500">Henüz kurs kaydı yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#23272F]">
                  <th className="px-4 py-2 text-left">Kurs Adı</th>
                  <th className="px-4 py-2 text-left">Açıklama</th>
                  <th className="px-4 py-2 text-left">Türü</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="px-4 py-2">{c.title}</td>
                    <td className="px-4 py-2">{c.description}</td>
                    <td className="px-4 py-2">{c.courseType === "Theory" ? "Teorik" : "Pratik"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 