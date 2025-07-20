import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";

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
  courseType: "Theory",
  tags: ""
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
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [imageError, setImageError] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const navigate = useNavigate();

  // JWT'den DrivingSchoolId bul
  const jwtPayload = parseJwt(token);
  const drivingSchoolId = jwtPayload.DrivingSchoolId || jwtPayload.drivingSchoolId;

  const isAdminOrInstructor = user && (user.role === "Admin" || user.role === "Instructor");

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

  // Dosya yükleme fonksiyonu
  async function handleFileUpload(type, file) {
    if (!file) return;
    if (type === "video") { setVideoLoading(true); setVideoError(""); }
    if (type === "image") { setImageLoading(true); setImageError(""); }
    if (type === "pdf") { setPdfLoading(true); setPdfError(""); }
    const formData = new FormData();
    if (type === "video") formData.append("video", file);
    if (type === "image") formData.append("image", file);
    if (type === "pdf") formData.append("pdf", file);
    try {
      const res = await fetch("http://192.168.1.78:5068/api/courses/upload-media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.videoUrl) setVideoUrl(data.videoUrl);
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.pdfUrl) setPdfUrl(data.pdfUrl);
    } catch {
      if (type === "video") setVideoError("Video yüklenemedi!");
      if (type === "image") setImageError("Resim yüklenemedi!");
      if (type === "pdf") setPdfError("PDF yüklenemedi!");
    }
    if (type === "video") setVideoLoading(false);
    if (type === "image") setImageLoading(false);
    if (type === "pdf") setPdfLoading(false);
  }

  function handleRemoveFile(type) {
    if (type === "video") { setVideoFile(null); setVideoUrl(""); }
    if (type === "image") { setImageFile(null); setImageUrl(""); }
    if (type === "pdf") { setPdfFile(null); setPdfUrl(""); }
  }

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
          drivingSchoolId,
          videoUrl,
          imageUrl,
          pdfUrl,
          category: form.category,
          tags: form.tags ? (Array.isArray(form.tags) ? form.tags.join(',') : form.tags) : ""
        })
      });
      if (res.ok) {
        setSuccess("Kurs başarıyla eklendi!");
        setForm(initialForm);
        setShowForm(false);
        setVideoUrl(""); setImageUrl(""); setPdfUrl("");
      } else {
        setFormError("Kurs eklenemedi!");
      }
    } catch {
      setFormError("Sunucu hatası!");
    }
  };

  // Filtrelenmiş kurslar
  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "" ||
      (course.courseType === 0 && typeFilter === "Theory") ||
      (course.courseType === 1 && typeFilter === "Practice") ||
      (course.courseType === "Theory" && typeFilter === "Theory") ||
      (course.courseType === "Practice" && typeFilter === "Practice");
    const matchesCategory = categoryFilter === "" || (course.category && course.category === categoryFilter);
    const matchesTag = tagFilter === "" || (course.tags && course.tags.includes(tagFilter));
    return matchesSearch && matchesType && matchesCategory && matchesTag;
  });

  // Kategorileri otomatik olarak kurslardan topla
  const allCategories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));
  // Tüm etiketleri otomatik olarak kurslardan topla
  const allTags = Array.from(new Set(courses.flatMap(c => c.tags || []).filter(Boolean)));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kurslar</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Kurs adı veya açıklama ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 rounded border w-full md:w-1/2"
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="p-2 rounded border w-full md:w-1/4"
        >
          <option value="">Tüm Türler</option>
          <option value="Theory">Teorik</option>
          <option value="Practice">Pratik</option>
        </select>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="p-2 rounded border w-full md:w-1/4"
        >
          <option value="">Tüm Kategoriler</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
          className="p-2 rounded border w-full md:w-1/4"
        >
          <option value="">Tüm Etiketler</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      {isAdminOrInstructor && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
          onClick={() => setShowForm(true)}
        >
          Yeni Kurs Ekle
        </button>
      )}
      {isAdminOrInstructor && showForm && (
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
            <div>
              <label className="block mb-1">Kategori</label>
              <input name="category" value={form.category || ""} onChange={handleChange} className="w-full p-2 rounded border" placeholder="örn. Trafik, İlk Yardım, Direksiyon" />
            </div>
            <div>
              <label className="block mb-1">Etiketler (virgülle ayırın)</label>
              <input name="tags" value={form.tags || ""} onChange={handleChange} className="w-full p-2 rounded border" placeholder="örn. trafik, ilk yardım, direksiyon" />
              <div className="text-xs text-gray-400 mt-1">Birden fazla etiket için virgül kullanın.</div>
            </div>
            <div>
              <label className="block mb-1">Video Yükle</label>
              <input type="file" accept="video/*" onChange={e => { setVideoFile(e.target.files[0]); handleFileUpload("video", e.target.files[0]); }} />
              {videoLoading && <span className="text-xs text-blue-600 ml-2">Yükleniyor...</span>}
              {videoError && <span className="text-xs text-red-500 ml-2">{videoError}</span>}
              {videoUrl && (
                <div className="flex items-center gap-2 mt-2">
                  <video src={videoUrl} controls style={{ width: 200 }} />
                  <button type="button" onClick={() => handleRemoveFile("video")}
                    className="text-xs text-red-500 underline ml-2">Kaldır</button>
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1">Resim Yükle</label>
              <input type="file" accept="image/*" onChange={e => { setImageFile(e.target.files[0]); handleFileUpload("image", e.target.files[0]); }} />
              {imageLoading && <span className="text-xs text-blue-600 ml-2">Yükleniyor...</span>}
              {imageError && <span className="text-xs text-red-500 ml-2">{imageError}</span>}
              {imageUrl && (
                <div className="flex items-center gap-2 mt-2">
                  <img src={imageUrl} alt="Kurs görseli" style={{ width: 120 }} />
                  <button type="button" onClick={() => handleRemoveFile("image")}
                    className="text-xs text-red-500 underline ml-2">Kaldır</button>
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1">PDF Yükle</label>
              <input type="file" accept="application/pdf" onChange={e => { setPdfFile(e.target.files[0]); handleFileUpload("pdf", e.target.files[0]); }} />
              {pdfLoading && <span className="text-xs text-blue-600 ml-2">Yükleniyor...</span>}
              {pdfError && <span className="text-xs text-red-500 ml-2">{pdfError}</span>}
              {pdfUrl && (
                <div className="flex items-center gap-2 mt-2">
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">PDF'i Görüntüle</a>
                  <button type="button" onClick={() => handleRemoveFile("pdf")}
                    className="text-xs text-red-500 underline ml-2">Kaldır</button>
                </div>
              )}
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-blue-700 transition">Kaydet</button>
            {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}
            {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
          </form>
        </div>
      )}
      {/* Kurslar Listesi */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white dark:bg-[#161B22] rounded-2xl shadow p-6 flex flex-col cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/panel/courses/${course.id}`)}
          >
            <div className="mb-2 text-lg font-bold text-blue-600 dark:text-blue-400">{course.title}</div>
            <div className="text-gray-600 dark:text-gray-300 mb-2">{course.description}</div>
            <div className="text-sm text-gray-500 mb-2">Tür: {course.courseType === 0 || course.courseType === 'Theory' ? 'Teorik' : 'Pratik'}</div>
            {course.category && <div className="text-xs inline-block bg-blue-100 text-blue-600 rounded-full px-3 py-1 mb-2">{course.category}</div>}
            {course.imageUrl && <img src={course.imageUrl} alt="Kurs görseli" className="rounded-xl mb-2" style={{ maxWidth: 180 }} />}
            {course.videoUrl && <video src={course.videoUrl} controls className="rounded-xl mb-2" style={{ maxWidth: 220 }} />}
            {course.pdfUrl && <a href={course.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mb-2">PDF'i Görüntüle</a>}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {course.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-1">{tag}</span>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-2">Oluşturulma: {course.createdAt ? new Date(course.createdAt).toLocaleString('tr-TR') : '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 