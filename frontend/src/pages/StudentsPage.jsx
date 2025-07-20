import React, { useState, useEffect } from "react";

const initialForm = {
  ad: "",
  soyad: "",
  tc: "",
  email: "",
  telefon: "",
  dogumTarihi: "",
  kayitTarihi: new Date().toISOString().slice(0, 10),
  cinsiyet: "",
  ehliyetSinifi: "",
  notlar: "",
};

const cinsiyetler = ["Erkek", "Kadın", "Belirtmek istemiyor"];
const ehliyetSiniflari = ["A", "B", "C", "D"];

export default function StudentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [drivingSchoolId, setDrivingSchoolId] = useState("");
  const [drivingSchools, setDrivingSchools] = useState([]);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [schoolForm, setSchoolForm] = useState({ name: "", address: "", phone: "", email: "", taxNumber: "", password: "" });
  const [schoolError, setSchoolError] = useState("");

  // Öğrenci listesini çek
  useEffect(() => {
    async function fetchStudents() {
      setListLoading(true);
      setListError("");
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        const res = await fetch("http://192.168.1.78:5068/api/students", { credentials: "include", headers });
        if (!res.ok) throw new Error("Liste alınamadı");
        const data = await res.json();
        console.log("Öğrenci listesi:", data);
        setStudents(data);
      } catch {
        setListError("Öğrenci listesi alınamadı.");
      }
      setListLoading(false);
    }
    fetchStudents();
  }, [showForm]);

  // Sürücü kursu listesini çek
  useEffect(() => {
    fetch("http://192.168.1.78:5068/api/drivingschools")
      .then((res) => res.json())
      .then((data) => {
        setDrivingSchools(data);
        if (data.length === 0) setShowSchoolForm(true);
        else setShowSchoolForm(false);
        if (data.length > 0) setDrivingSchoolId(data[0].id);
      })
      .catch(() => {
        setDrivingSchools([]);
        setShowSchoolForm(true);
      });
  }, [showForm]);

  // Sürücü kursu ekleme
  const handleSchoolChange = (e) => {
    setSchoolForm({ ...schoolForm, [e.target.name]: e.target.value });
  };
  const handleSchoolSubmit = async (e) => {
    e.preventDefault();
    setSchoolError("");
    if (!schoolForm.name) { setSchoolError("Kurs adı zorunlu"); return; }
    if (!schoolForm.email) { setSchoolError("E-posta zorunlu"); return; }
    if (!schoolForm.taxNumber) { setSchoolError("Vergi numarası zorunlu"); return; }
    if (!schoolForm.password) { setSchoolError("Şifre zorunlu"); return; }
    try {
      const res = await fetch("http://192.168.1.78:5068/api/drivingschools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: schoolForm.name,
          address: schoolForm.address,
          phone: schoolForm.phone,
          email: schoolForm.email,
          taxNumber: schoolForm.taxNumber,
          password: schoolForm.password
        })
      });
      if (res.ok) {
        setShowSchoolForm(false);
        setSchoolForm({ name: "", address: "", phone: "", email: "", taxNumber: "", password: "" });
        // Kurs listesini tekrar çek
        fetch("http://192.168.1.78:5068/api/drivingschools")
          .then((res) => res.json())
          .then((data) => {
            setDrivingSchools(data);
            if (data.length > 0) setDrivingSchoolId(data[0].id);
          });
      } else {
        setSchoolError("Kurs eklenemedi!");
      }
    } catch {
      setSchoolError("Sunucu hatası!");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.ad) newErrors.ad = "Ad zorunlu";
    if (!form.soyad) newErrors.soyad = "Soyad zorunlu";
    if (!form.tc || !/^\d{11}$/.test(form.tc)) newErrors.tc = "T.C. Kimlik No 11 haneli olmalı";
    if (!form.email) newErrors.email = "E-posta zorunlu";
    if (!form.telefon || !/^\+90\d{10}$/.test(form.telefon)) newErrors.telefon = "+90 formatında 11 haneli olmalı";
    if (!form.dogumTarihi) newErrors.dogumTarihi = "Doğum tarihi zorunlu";
    if (!form.kayitTarihi) newErrors.kayitTarihi = "Kayıt tarihi zorunlu";
    if (!form.cinsiyet) newErrors.cinsiyet = "Cinsiyet seçilmeli";
    if (!form.ehliyetSinifi) newErrors.ehliyetSinifi = "Ehliyet sınıfı seçilmeli";
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    setToast({ type: "", message: "" });
    try {
      // 1. Önce kullanıcı kaydı
      const registerRes = await fetch("http://192.168.1.78:5068/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.ad + " " + form.soyad,
          email: form.email,
          password: form.tc, // Geçici olarak TC'yi şifre olarak kullanıyoruz, gerçek projede farklı olmalı!
          phone: form.telefon,
          role: "Student",
          drivingSchoolId: drivingSchoolId
        })
      });
      if (!registerRes.ok) {
        let msg = "Kullanıcı kaydı başarısız!";
        try { const data = await registerRes.json(); if (data.message) msg = data.message; } catch { /* ignore */ }
        setToast({ type: "error", message: msg });
        setLoading(false);
        return;
      }
      const registerData = await registerRes.json();
      const userId = registerData.userId;
      // 2. Sonra öğrenci kaydı
      // --- Debug log ---
      console.log({
        userId,
        drivingSchoolId,
        tcNumber: form.tc,
        birthDate: form.dogumTarihi,
        licenseType: form.ehliyetSinifi
      });
      const token = localStorage.getItem("token");
      const response = await fetch("http://192.168.1.78:5068/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          drivingSchoolId: drivingSchoolId,
          tcNumber: form.tc,
          birthDate: new Date(form.dogumTarihi).toISOString(),
          licenseType: form.ehliyetSinifi
        }),
      });
      if (response.ok) {
        setToast({ type: "success", message: "Öğrenci başarıyla kaydedildi!" });
        setForm(initialForm);
        setShowForm(false);
      } else {
        let msg = "Öğrenci kaydı başarısız!";
        try { const data = await response.json(); if (data.message) msg = data.message; } catch { /* ignore */ }
        setToast({ type: "error", message: msg });
      }
    } catch {
      setToast({ type: "error", message: "Sunucu hatası!" });
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Öğrenciler</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
        onClick={() => setShowForm(true)}
        disabled={drivingSchools.length === 0}
      >
        Yeni Öğrenci Ekle
      </button>
      {showSchoolForm && (
        <div className="bg-white dark:bg-[#161B22] rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Sürücü Kursu Oluştur</h2>
          <form onSubmit={handleSchoolSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Kurs Adı *</label>
              <input name="name" value={schoolForm.name} onChange={handleSchoolChange} className="w-full p-2 rounded border" />
            </div>
            <div>
              <label className="block mb-1">Adres</label>
              <input name="address" value={schoolForm.address} onChange={handleSchoolChange} className="w-full p-2 rounded border" />
            </div>
            <div>
              <label className="block mb-1">Telefon</label>
              <input name="phone" value={schoolForm.phone} onChange={handleSchoolChange} className="w-full p-2 rounded border" />
            </div>
            <div>
              <label className="block mb-1">E-posta *</label>
              <input name="email" value={schoolForm.email} onChange={handleSchoolChange} className="w-full p-2 rounded border" />
            </div>
            <div>
              <label className="block mb-1">Vergi Numarası *</label>
              <input name="taxNumber" value={schoolForm.taxNumber} onChange={handleSchoolChange} className="w-full p-2 rounded border" />
            </div>
            <div>
              <label className="block mb-1">Şifre *</label>
              <input name="password" type="password" value={schoolForm.password} onChange={handleSchoolChange} className="w-full p-2 rounded border" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-blue-700 transition">Kaydet</button>
            {schoolError && <div className="text-red-500 text-sm mt-2">{schoolError}</div>}
          </form>
        </div>
      )}

      {/* Öğrenci Listesi */}
      <div className="bg-white dark:bg-[#161B22] rounded-2xl shadow p-6 mb-8">
        <div className="text-lg font-semibold mb-4">Kayıtlı Öğrenciler</div>
        {listLoading ? (
          <div className="text-gray-500">Yükleniyor...</div>
        ) : listError ? (
          <div className="text-red-500">{listError}</div>
        ) : students.length === 0 ? (
          <div className="text-gray-500">Henüz öğrenci kaydı yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#23272F]">
                  <th className="px-4 py-2 text-left">Ad Soyad</th>
                  <th className="px-4 py-2 text-left">E-posta</th>
                  <th className="px-4 py-2 text-left">Kayıt Tarihi</th>
                  <th className="px-4 py-2 text-left">Ehliyet Sınıfı</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2">{s.fullName || "-"}</td>
                    <td className="px-4 py-2">{s.email || "-"}</td>
                    <td className="px-4 py-2">{s.registrationDate ? s.registrationDate.slice(0, 10) : "-"}</td>
                    <td className="px-4 py-2">{s.licenseType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#161B22] rounded-2xl shadow-lg p-8 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Yeni Öğrenci Ekle</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-1">Ad *</label>
                  <input name="ad" value={form.ad} onChange={handleChange} className="w-full p-2 rounded border" />
                  {errors.ad && <div className="text-red-500 text-xs mt-1">{errors.ad}</div>}
                </div>
                <div className="w-1/2">
                  <label className="block mb-1">Soyad *</label>
                  <input name="soyad" value={form.soyad} onChange={handleChange} className="w-full p-2 rounded border" />
                  {errors.soyad && <div className="text-red-500 text-xs mt-1">{errors.soyad}</div>}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-1">T.C. Kimlik No *</label>
                  <input name="tc" value={form.tc} onChange={handleChange} className="w-full p-2 rounded border" maxLength={11} />
                  {errors.tc && <div className="text-red-500 text-xs mt-1">{errors.tc}</div>}
                </div>
                <div className="w-1/2">
                  <label className="block mb-1">E-posta *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full p-2 rounded border" />
                  {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-1">Telefon Numarası *</label>
                  <input name="telefon" value={form.telefon} onChange={handleChange} className="w-full p-2 rounded border" placeholder="+905xxxxxxxxx" />
                  {errors.telefon && <div className="text-red-500 text-xs mt-1">{errors.telefon}</div>}
                </div>
                <div className="w-1/2">
                  <label className="block mb-1">Doğum Tarihi *</label>
                  <input name="dogumTarihi" type="date" value={form.dogumTarihi} onChange={handleChange} className="w-full p-2 rounded border" />
                  {errors.dogumTarihi && <div className="text-red-500 text-xs mt-1">{errors.dogumTarihi}</div>}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-1">Kayıt Tarihi *</label>
                  <input name="kayitTarihi" type="date" value={form.kayitTarihi} onChange={handleChange} className="w-full p-2 rounded border" />
                  {errors.kayitTarihi && <div className="text-red-500 text-xs mt-1">{errors.kayitTarihi}</div>}
                </div>
                <div className="w-1/2">
                  <label className="block mb-1">Cinsiyet *</label>
                  <select name="cinsiyet" value={form.cinsiyet} onChange={handleChange} className="w-full p-2 rounded border">
                    <option value="">Seçiniz</option>
                    {cinsiyetler.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.cinsiyet && <div className="text-red-500 text-xs mt-1">{errors.cinsiyet}</div>}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-1">Ehliyet Sınıfı *</label>
                  <select name="ehliyetSinifi" value={form.ehliyetSinifi} onChange={handleChange} className="w-full p-2 rounded border">
                    <option value="">Seçiniz</option>
                    {ehliyetSiniflari.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  {errors.ehliyetSinifi && <div className="text-red-500 text-xs mt-1">{errors.ehliyetSinifi}</div>}
                </div>
              </div>
              <div>
                <label className="block mb-1">Notlar</label>
                <textarea name="notlar" value={form.notlar} onChange={handleChange} className="w-full p-2 rounded border" rows={2} />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </form>
            {toast.message && (
              <div className={`mt-4 text-center text-sm ${toast.type === "success" ? "text-green-600" : "text-red-600"}`}>{toast.message}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 