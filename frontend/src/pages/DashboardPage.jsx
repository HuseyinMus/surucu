import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([
    { label: "Toplam Öğrenci", value: 0 },
    { label: "Toplam Kurs", value: 0 },
    { label: "Toplam Eğitmen", value: 0 },
    { label: "Gönderilen Bildirim", value: 0 },
  ]);
  const [latestStudents, setLatestStudents] = useState([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Kullanıcı rolünü localStorage'dan al
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}
  const role = user?.role;

  useEffect(() => {
    if (role === "Student") {
      navigate("/students", { replace: true });
      return;
    }
    if (role !== "Admin" && role !== "Instructor") {
      setLoading(false);
      setError("Bu sayfaya erişim yetkiniz yok.");
      return;
    }
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        // Öğrenciler
        const studentsRes = await fetch("http://192.168.1.78:5068/api/students", { credentials: "include", headers });
        const students = await studentsRes.json();
        // Kurslar
        const coursesRes = await fetch("http://192.168.1.78:5068/api/courses", { credentials: "include", headers });
        const courses = await coursesRes.json();
        // Eğitmenler
        const instructorsRes = await fetch("http://192.168.1.78:5068/api/instructors", { credentials: "include", headers });
        const instructors = await instructorsRes.json();
        // Bildirimler
        const notificationsRes = await fetch("http://192.168.1.78:5068/api/notifications", { credentials: "include", headers });
        const notifications = await notificationsRes.json();
        // Sınavlar
        const quizzesRes = await fetch("http://192.168.1.78:5068/api/quizzes", { credentials: "include", headers });
        const quizzes = await quizzesRes.json();

        setSummary([
          { label: "Toplam Öğrenci", value: students.length },
          { label: "Toplam Kurs", value: courses.length },
          { label: "Toplam Eğitmen", value: instructors.length },
          { label: "Gönderilen Bildirim", value: notifications.length },
        ]);
        setLatestStudents(students.slice(0, 5));
        // Yaklaşan sınavlar: bugünden sonraki ilk 3 sınav
        const now = new Date();
        const upcoming = quizzes
          .filter(q => new Date(q.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3)
          .map(q => ({
            course: q.courseTitle || q.title || "-",
            date: q.date ? q.date.slice(0, 10) : "-",
            participants: q.participants || q.participantCount || "-"
          }));
        setUpcomingQuizzes(upcoming);
      } catch (err) {
        setError("Veriler alınırken hata oluştu.");
      }
      setLoading(false);
    }
    fetchData();
  }, [role, navigate]);

  if (loading) {
    return <div className="p-6 text-center text-lg text-gray-600 dark:text-gray-300">Yükleniyor...</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summary.map((item) => (
          <div
            key={item.label}
            className="bg-white dark:bg-[#161B22] rounded-2xl shadow p-6 flex flex-col items-center justify-center"
          >
            <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">{item.label}</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Son 5 Öğrenci Tablosu */}
      <div className="bg-white dark:bg-[#161B22] rounded-2xl shadow p-6">
        <div className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">Son 5 Öğrenci</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#23272F]">
                <th className="px-4 py-2 text-left">Ad Soyad</th>
                <th className="px-4 py-2 text-left">E-posta</th>
                <th className="px-4 py-2 text-left">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {latestStudents.map((s, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2">{s.fullName || s.name}</td>
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2">{s.registrationDate ? s.registrationDate.slice(0, 10) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yaklaşan Sınavlar Tablosu */}
      <div className="bg-white dark:bg-[#161B22] rounded-2xl shadow p-6">
        <div className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">Yaklaşan Sınavlar</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#23272F]">
                <th className="px-4 py-2 text-left">Kurs Adı</th>
                <th className="px-4 py-2 text-left">Tarih</th>
                <th className="px-4 py-2 text-left">Katılımcı Sayısı</th>
              </tr>
            </thead>
            <tbody>
              {upcomingQuizzes.map((q, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2">{q.course}</td>
                  <td className="px-4 py-2">{q.date}</td>
                  <td className="px-4 py-2">{q.participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bildirim Butonu */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate("/notifications")}
          className="bg-blue-600 dark:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow hover:bg-blue-700 dark:hover:bg-blue-400 transition"
        >
          Yeni Bildirim Gönder
        </button>
      </div>
    </div>
  );
} 