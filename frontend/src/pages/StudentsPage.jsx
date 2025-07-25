import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  User,
  GraduationCap,
  MapPin
} from "lucide-react";

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
  const [drivingSchools, setDrivingSchools] = useState([]); // eslint-disable-line no-unused-vars
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [schoolForm, setSchoolForm] = useState({ name: "", address: "", phone: "", email: "", taxNumber: "", password: "" });
  const [schoolError, setSchoolError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterLicenseClass, setFilterLicenseClass] = useState("");

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
        
        // Backend'den gelen veri yapısını frontend'e uygun hale getir
        const formattedStudents = data.map(student => ({
          id: student.id,
          ad: student.fullName?.split(' ')[0] || '',
          soyad: student.fullName?.split(' ').slice(1).join(' ') || '',
          tc: student.tc || '',
          email: student.email || '',
          telefon: student.telefon || '',
          dogumTarihi: student.dogumTarihi || '',
          kayitTarihi: student.kayitTarihi || student.registrationDate || '',
          cinsiyet: student.cinsiyet || '',
          ehliyetSinifi: student.licenseType || student.ehliyetSinifi || '',
          notlar: student.notlar || '',
          user: {
            fullName: student.fullName || '',
            email: student.email || ''
          }
        }));
        
        setStudents(formattedStudents);
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
    if (!form.tc) newErrors.tc = "TC zorunlu";
    if (!form.email) newErrors.email = "E-posta zorunlu";
    if (!form.telefon) newErrors.telefon = "Telefon zorunlu";
    if (!form.dogumTarihi) newErrors.dogumTarihi = "Doğum tarihi zorunlu";
    if (!form.cinsiyet) newErrors.cinsiyet = "Cinsiyet zorunlu";
    if (!form.ehliyetSinifi) newErrors.ehliyetSinifi = "Ehliyet sınıfı zorunlu";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      const res = await fetch("http://192.168.1.78:5068/api/students", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...form,
          drivingSchoolId: drivingSchoolId
        })
      });
      if (res.ok) {
        setToast({ type: "success", message: "Öğrenci başarıyla eklendi!" });
        setForm(initialForm);
        setShowForm(false);
      } else {
        const errorData = await res.json();
        setToast({ type: "error", message: errorData.title || "Öğrenci eklenemedi!" });
      }
    } catch {
      setToast({ type: "error", message: "Sunucu hatası!" });
    }
    setLoading(false);
  };

  // Filtreleme
  const filteredStudents = students.filter(student => {
    const fullName = student.user?.fullName || `${student.ad} ${student.soyad}`;
    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.tc?.includes(searchTerm);
    
    const matchesGender = !filterGender || student.cinsiyet === filterGender;
    const matchesLicenseClass = !filterLicenseClass || student.ehliyetSinifi === filterLicenseClass;
    
    return matchesSearch && matchesGender && matchesLicenseClass;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getGenderColor = (gender) => {
    switch (gender) {
      case "Erkek": return "bg-blue-100 text-blue-800";
      case "Kadın": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLicenseClassColor = (licenseClass) => {
    switch (licenseClass) {
      case "A": return "bg-green-100 text-green-800";
      case "B": return "bg-blue-100 text-blue-800";
      case "C": return "bg-yellow-100 text-yellow-800";
      case "D": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (listLoading) {
    return (
      <div className="min-h-screen bg-google-gray-50 font-inter">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-google-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-google-gray-50 font-inter">
      {/* Header */}
      <div className="bg-white border-b border-google-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-semibold text-google-gray-900">Öğrenciler</h1>
              <p className="text-sm text-google-gray-600 mt-1">Öğrenci kayıtlarını yönetin</p>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-google-blue text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm"
            >
              <Plus size={20} />
              Yeni Öğrenci
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-google-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-google-gray-400" size={20} />
              <input
                type="text"
                placeholder="Öğrenci ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
              />
            </div>

            {/* Gender Filter */}
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
            >
              <option value="">Tüm Cinsiyetler</option>
              {cinsiyetler.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>

            {/* License Class Filter */}
            <select
              value={filterLicenseClass}
              onChange={(e) => setFilterLicenseClass(e.target.value)}
              className="px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
            >
              <option value="">Tüm Ehliyet Sınıfları</option>
              {ehliyetSiniflari.map(licenseClass => (
                <option key={licenseClass} value={licenseClass}>{licenseClass}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {listError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {listError}
          </div>
        )}

        {toast.message && (
          <div className={`mb-6 p-4 rounded-lg ${
            toast.type === "success" 
              ? "bg-green-50 border border-green-200 text-green-700" 
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {toast.message}
          </div>
        )}

        {/* Student Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-google-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
              {/* Student Header */}
              <div className="p-6 border-b border-google-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-google-blue rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-google-gray-900">
                        {student.user?.fullName || `${student.ad} ${student.soyad}`}
                      </h3>
                      <p className="text-sm text-google-gray-600">TC: {student.tc}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-google-gray-100 rounded-lg transition-colors duration-200">
                      <Eye size={16} className="text-google-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-google-gray-100 rounded-lg transition-colors duration-200">
                      <Edit size={16} className="text-google-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGenderColor(student.cinsiyet)}`}>
                    {student.cinsiyet}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLicenseClassColor(student.ehliyetSinifi)}`}>
                    {student.ehliyetSinifi} Sınıfı
                  </span>
                </div>
              </div>

              {/* Student Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-google-gray-400" />
                  <span className="text-google-gray-700">{student.user?.email || student.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-google-gray-400" />
                  <span className="text-google-gray-700">{student.telefon}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-google-gray-400" />
                  <span className="text-google-gray-700">
                    Doğum: {formatDate(student.dogumTarihi)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="w-4 h-4 text-google-gray-400" />
                  <span className="text-google-gray-700">
                    Kayıt: {formatDate(student.kayitTarihi)}
                  </span>
                </div>

                {student.notlar && (
                  <div className="pt-3 border-t border-google-gray-100">
                    <p className="text-sm text-google-gray-600 line-clamp-2">
                      {student.notlar}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && !listLoading && (
          <div className="text-center py-12">
            <Users size={64} className="mx-auto text-google-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-google-gray-900 mb-2">Öğrenci bulunamadı</h3>
            <p className="text-google-gray-600">Arama kriterlerinize uygun öğrenci bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-google-gray-200">
              <h2 className="text-xl font-semibold text-google-gray-900">Yeni Öğrenci Ekle</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-google-gray-700 mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    name="ad"
                    value={form.ad}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                    placeholder="Öğrenci adı"
                  />
                  {errors.ad && <p className="text-sm text-red-600 mt-1">{errors.ad}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-google-gray-700 mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    name="soyad"
                    value={form.soyad}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                    placeholder="Öğrenci soyadı"
                  />
                  {errors.soyad && <p className="text-sm text-red-600 mt-1">{errors.soyad}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-google-gray-700 mb-2">
                    TC Kimlik No *
                  </label>
                  <input
                    type="text"
                    name="tc"
                    value={form.tc}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                    placeholder="11 haneli TC kimlik numarası"
                  />
                  {errors.tc && <p className="text-sm text-red-600 mt-1">{errors.tc}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-google-gray-700 mb-2">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                    placeholder="ornek@email.com"
                  />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-google-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="telefon"
                    value={form.telefon}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                    placeholder="05XX XXX XX XX"
                  />
                  {errors.telefon && <p className="text-sm text-red-600 mt-1">{errors.telefon}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-google-gray-700 mb-2">
                    Doğum Tarihi *
                  </label>
                  <input
                    type="date"
                    name="dogumTarihi"
                    value={form.dogumTarihi}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                  />
                  {errors.dogumTarihi && <p className="text-sm text-red-600 mt-1">{errors.dogumTarihi}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-google-gray-700 mb-2">
                    Cinsiyet *
                  </label>
                  <select
                    name="cinsiyet"
                    value={form.cinsiyet}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                  >
                    <option value="">Seçiniz</option>
                    {cinsiyetler.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                  {errors.cinsiyet && <p className="text-sm text-red-600 mt-1">{errors.cinsiyet}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-google-gray-700 mb-2">
                    Ehliyet Sınıfı *
                  </label>
                  <select
                    name="ehliyetSinifi"
                    value={form.ehliyetSinifi}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                  >
                    <option value="">Seçiniz</option>
                    {ehliyetSiniflari.map(licenseClass => (
                      <option key={licenseClass} value={licenseClass}>{licenseClass}</option>
                    ))}
                  </select>
                  {errors.ehliyetSinifi && <p className="text-sm text-red-600 mt-1">{errors.ehliyetSinifi}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-google-gray-700 mb-2">
                  Notlar
                </label>
                <textarea
                  name="notlar"
                  value={form.notlar}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                  placeholder="Öğrenci hakkında notlar..."
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-google-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-google-gray-300 text-google-gray-700 rounded-lg hover:bg-google-gray-50 transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-google-blue text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? "Ekleniyor..." : "Öğrenci Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Driving School Modal */}
      {showSchoolForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-google-gray-200">
              <h2 className="text-xl font-semibold text-google-gray-900">Sürücü Kursu Ekle</h2>
            </div>

            <form onSubmit={handleSchoolSubmit} className="p-6 space-y-4">
              {schoolError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {schoolError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-google-gray-700 mb-2">
                  Kurs Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  value={schoolForm.name}
                  onChange={handleSchoolChange}
                  className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                  placeholder="Kurs adını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-google-gray-700 mb-2">
                  Adres
                </label>
                <input
                  type="text"
                  name="address"
                  value={schoolForm.address}
                  onChange={handleSchoolChange}
                  className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                  placeholder="Kurs adresini girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-google-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={schoolForm.phone}
                  onChange={handleSchoolChange}
                  className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                  placeholder="Kurs telefonunu girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-google-gray-700 mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  name="email"
                  value={schoolForm.email}
                  onChange={handleSchoolChange}
                  className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                  placeholder="Kurs e-posta adresini girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-google-gray-700 mb-2">
                  Vergi Numarası *
                </label>
                <input
                  type="text"
                  name="taxNumber"
                  value={schoolForm.taxNumber}
                  onChange={handleSchoolChange}
                  className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                  placeholder="Vergi numarasını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-google-gray-700 mb-2">
                  Şifre *
                </label>
                <input
                  type="password"
                  name="password"
                  value={schoolForm.password}
                  onChange={handleSchoolChange}
                  className="w-full px-4 py-2 border border-google-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent"
                  placeholder="Şifre belirleyin"
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-google-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-google-blue text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Kurs Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 