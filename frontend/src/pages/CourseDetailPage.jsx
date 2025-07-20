import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrInstructor = user && (user.role === "Admin" || user.role === "Instructor");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", courseType: "Theory", tags: "" });
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("info");
  const [contents, setContents] = useState([]);
  const [contentsLoading, setContentsLoading] = useState(false);
  const [contentsError, setContentsError] = useState("");
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", contentType: "Video", contentUrl: "", order: 1, duration: "", quizId: "" });
  const [lessonFormError, setLessonFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', totalPoints: 0 });
  const [quizFormError, setQuizFormError] = useState('');
  const [quizLessonId, setQuizLessonId] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({ questionText: '', questionType: 'MultipleChoice', options: [{ text: '', isCorrect: false }], });
  const [questionFormError, setQuestionFormError] = useState('');
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizAddModal, setShowQuizAddModal] = useState(false);
  const [newQuizForm, setNewQuizForm] = useState({ title: '', description: '', totalPoints: 0 });
  const [newQuizError, setNewQuizError] = useState('');
  const [lessonQuizzes, setLessonQuizzes] = useState({});

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://192.168.1.78:5068/api/courses/${id}`);
        if (!res.ok) throw new Error("Kurs bulunamadı");
        const data = await res.json();
        setCourse(data);
        setEditForm({
          title: data.title || "",
          description: data.description || "",
          courseType: data.courseType === 0 ? "Theory" : data.courseType === 1 ? "Practice" : data.courseType || "Theory",
          tags: data.tags ? data.tags.join(", ") : ""
        });
      } catch {
        setError("Kurs bulunamadı veya sunucu hatası.");
      }
      setLoading(false);
    }
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (tab === "lessons") {
      setContentsLoading(true);
      setContentsError("");
      fetch(`http://192.168.1.78:5068/api/courses/${id}/contents`)
        .then(res => res.json())
        .then(data => setContents(data))
        .catch(() => setContentsError("Dersler alınamadı."))
        .finally(() => setContentsLoading(false));
    }
  }, [tab, id]);

  useEffect(() => {
    if (showLessonForm) {
      fetch("http://192.168.1.78:5068/api/quizzes")
        .then(res => res.json())
        .then(data => setQuizzes(data))
        .catch(() => setQuizzes([]));
    }
  }, [showLessonForm]);

  useEffect(() => {
    if (tab === "lessons") {
      fetch("http://192.168.1.78:5068/api/quizzes")
        .then(res => res.json())
        .then(data => {
          // Her dersin id'sine göre quizleri grupla
          const map = {};
          data.forEach(q => {
            if (q.courseContentId) {
              if (!map[q.courseContentId]) map[q.courseContentId] = [];
              map[q.courseContentId].push(q);
            }
          });
          setLessonQuizzes(map);
        })
        .catch(() => setLessonQuizzes({}));
    }
  }, [tab, contentsLoading]);

  async function handleDelete() {
    if (!window.confirm("Bu kursu silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`http://192.168.1.78:5068/api/courses/${id}`, { method: "DELETE" });
    if (res.ok) {
      navigate("/panel/courses");
    } else {
      alert("Kurs silinemedi!");
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setSuccess("");
    const res = await fetch(`http://192.168.1.78:5068/api/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        tags: editForm.tags ? editForm.tags.split(",").map(t => t.trim()).filter(Boolean) : []
      })
    });
    if (res.ok) {
      setSuccess("Kurs başarıyla güncellendi!");
      setEditMode(false);
      const updated = await res.json();
      setCourse(updated);
    } else {
      setSuccess("");
      alert("Kurs güncellenemedi!");
    }
  }

  function openAddLesson() {
    setEditingLesson(null);
    setLessonForm({ title: "", description: "", contentType: "Video", contentUrl: "", order: 1, duration: "", quizId: "" });
    setShowLessonForm(true);
  }
  function openEditLesson(lesson) {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || "",
      description: lesson.description || "",
      contentType: lesson.contentType || "Video",
      contentUrl: lesson.contentUrl || "",
      order: lesson.order || 1,
      duration: lesson.duration || "",
      quizId: lesson.quizId || ""
    });
    setShowLessonForm(true);
  }
  async function handleLessonFormSubmit(e) {
    e.preventDefault();
    setLessonFormError("");
    if (!lessonForm.title) { setLessonFormError("Ders başlığı zorunlu"); return; }
    if (!lessonForm.contentType) { setLessonFormError("İçerik türü zorunlu"); return; }
    if (!lessonForm.contentUrl) { setLessonFormError("İçerik bağlantısı zorunlu"); return; }
    const method = editingLesson ? "PUT" : "POST";
    const url = editingLesson
      ? `http://192.168.1.78:5068/api/courses/${id}/contents/${editingLesson.id}`
      : `http://192.168.1.78:5068/api/courses/${id}/contents`;
    const body = {
      ...lessonForm,
      contentType: lessonForm.contentType,
      order: Number(lessonForm.order),
      duration: lessonForm.duration,
      quizId: lessonForm.quizId || null
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowLessonForm(false);
        setEditingLesson(null);
        setLessonForm({ title: "", description: "", contentType: "Video", contentUrl: "", order: 1, duration: "", quizId: "" });
        setContentsLoading(true); // Yeniden yükle
        fetch(`http://192.168.1.78:5068/api/courses/${id}/contents`).then(res => res.json()).then(data => setContents(data)).finally(() => setContentsLoading(false));
      } else {
        setLessonFormError("Ders kaydedilemedi!");
      }
    } catch {
      setLessonFormError("Sunucu hatası!");
    }
  }
  async function handleDeleteLesson(lesson) {
    if (!window.confirm("Bu dersi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`http://192.168.1.78:5068/api/courses/${id}/contents/${lesson.id}`, { method: "DELETE" });
      if (res.ok) {
        setContentsLoading(true);
        fetch(`http://192.168.1.78:5068/api/courses/${id}/contents`).then(res => res.json()).then(data => setContents(data)).finally(() => setContentsLoading(false));
      } else {
        alert("Ders silinemedi!");
      }
    } catch {
      alert("Sunucu hatası!");
    }
  }

  async function handleFileUpload(e) {
    setUploading(true);
    setUploadError("");
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    if (lessonForm.contentType === "Video") formData.append("video", file);
    if (lessonForm.contentType === "PDF") formData.append("pdf", file);
    if (lessonForm.contentType === "Text") formData.append("image", file); // Text için resim yüklenirse
    try {
      const res = await fetch("http://192.168.1.78:5068/api/courses/upload-media", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.videoUrl) setLessonForm(f => ({ ...f, contentUrl: data.videoUrl }));
      if (data.pdfUrl) setLessonForm(f => ({ ...f, contentUrl: data.pdfUrl }));
      if (data.imageUrl) setLessonForm(f => ({ ...f, contentUrl: data.imageUrl }));
    } catch {
      setUploadError("Dosya yüklenemedi!");
    }
    setUploading(false);
  }

  function openQuizForm(lessonId) {
    setQuizLessonId(lessonId);
    setQuizForm({ title: '', description: '', totalPoints: 0 });
    setQuizFormError('');
    setShowQuizForm(true);
  }
  async function handleQuizFormSubmit(e) {
    e.preventDefault();
    setQuizFormError('');
    if (!quizForm.title) { setQuizFormError('Quiz başlığı zorunlu'); return; }
    try {
      const res = await fetch('http://192.168.1.78:5068/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizForm.title,
          description: quizForm.description,
          totalPoints: Number(quizForm.totalPoints),
          courseId: id,
          courseContentId: quizLessonId
        })
      });
      if (res.ok) {
        const quiz = await res.json();
        // Dersi güncelle, quizId'yi ekle
        await fetch(`http://192.168.1.78:5068/api/courses/${id}/contents/${quizLessonId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId: quiz.id })
        });
        setShowQuizForm(false);
        setCurrentQuizId(quiz.id);
        setShowQuestionForm(true);
        setContentsLoading(true);
        fetch(`http://192.168.1.78:5068/api/courses/${id}/contents`).then(res => res.json()).then(data => setContents(data)).finally(() => setContentsLoading(false));
      } else {
        setQuizFormError('Quiz eklenemedi!');
      }
    } catch {
      setQuizFormError('Sunucu hatası!');
    }
  }
  function openQuestionForm(quizId) {
    setCurrentQuizId(quizId);
    setQuestionForm({ questionText: '', questionType: 'MultipleChoice', options: [{ text: '', isCorrect: false }] });
    setShowQuestionForm(true);
    setQuestionFormError('');
  }
  function handleOptionChange(i, field, value) {
    setQuestionForm(f => {
      const options = [...f.options];
      if (field === 'isCorrect') options[i][field] = value;
      else options[i][field] = value;
      return { ...f, options };
    });
  }
  function addOption() {
    setQuestionForm(f => ({ ...f, options: [...f.options, { text: '', isCorrect: false }] }));
  }
  function removeOption(i) {
    setQuestionForm(f => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));
  }
  async function handleQuestionFormSubmit(e) {
    e.preventDefault();
    setQuestionFormError('');
    if (!questionForm.questionText) { setQuestionFormError('Soru metni zorunlu'); return; }
    if (questionForm.options.length < 2) { setQuestionFormError('En az 2 şık olmalı'); return; }
    if (!questionForm.options.some(o => o.isCorrect)) { setQuestionFormError('En az 1 doğru şık seçilmeli'); return; }
    try {
      const res = await fetch(`http://192.168.1.78:5068/api/quizzes/${currentQuizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: questionForm.questionText,
          questionType: questionForm.questionType,
          options: questionForm.options.map(o => ({ optionText: o.text, isCorrect: o.isCorrect }))
        })
      });
      if (res.ok) {
        setShowQuestionForm(false);
        setQuestionForm({ questionText: '', questionType: 'MultipleChoice', options: [{ text: '', isCorrect: false }] });
      } else {
        setQuestionFormError('Soru eklenemedi!');
      }
    } catch {
      setQuestionFormError('Sunucu hatası!');
    }
  }

  if (loading) return <div className="p-8 text-center text-lg">Yükleniyor...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!course) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-[#161B22] rounded-2xl shadow p-8 mt-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 underline">← Geri</button>
      {/* Sekmeler */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab("info")} className={`px-4 py-2 rounded-xl font-semibold ${tab === "info" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-[#23272F] text-blue-600"}`}>Genel Bilgi</button>
        <button onClick={() => setTab("lessons")} className={`px-4 py-2 rounded-xl font-semibold ${tab === "lessons" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-[#23272F] text-blue-600"}`}>Dersler</button>
      </div>
      {tab === "info" && (
        <>
          {isAdminOrInstructor && (
            <div className="flex gap-4 mb-4">
              <button onClick={() => setEditMode(true)} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded">Düzenle</button>
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Sil</button>
            </div>
          )}
          {success && <div className="text-green-600 mb-2">{success}</div>}
          {editMode ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Kurs Adı *</label>
                <input name="title" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="w-full p-2 rounded border" />
              </div>
              <div>
                <label className="block mb-1">Açıklama</label>
                <input name="description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="w-full p-2 rounded border" />
              </div>
              <div>
                <label className="block mb-1">Kurs Türü *</label>
                <select name="courseType" value={editForm.courseType} onChange={e => setEditForm(f => ({ ...f, courseType: e.target.value }))} className="w-full p-2 rounded border">
                  <option value="Theory">Teorik</option>
                  <option value="Practice">Pratik</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Etiketler (virgülle ayırın)</label>
                <input name="tags" value={editForm.tags || ""} onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))} className="w-full p-2 rounded border" placeholder="örn. trafik, ilk yardım, direksiyon" />
                <div className="text-xs text-gray-400 mt-1">Birden fazla etiket için virgül kullanın.</div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-blue-700 transition">Kaydet</button>
            </form>
          ) : (
            <>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{course.title}</div>
              <div className="text-gray-600 dark:text-gray-300 mb-4">{course.description}</div>
              {course.imageUrl && <img src={course.imageUrl} alt="Kurs görseli" className="rounded-xl mb-4" style={{ maxWidth: 320 }} />}
              {course.videoUrl && <video src={course.videoUrl} controls className="rounded-xl mb-4" style={{ maxWidth: 400 }} />}
              {course.pdfUrl && <a href={course.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mb-4 block">PDF'i Görüntüle</a>}
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-1">{tag}</span>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-2">Oluşturulma: {course.createdAt ? new Date(course.createdAt).toLocaleString('tr-TR') : '-'}</div>
            </>
          )}
        </>
      )}
      {tab === "lessons" && (
        <div>
          {isAdminOrInstructor && (
            <button onClick={openAddLesson} className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Ders Ekle</button>
          )}
          {contentsLoading ? (
            <div className="text-center text-blue-600">Dersler yükleniyor...</div>
          ) : contentsError ? (
            <div className="text-center text-red-500">{contentsError}</div>
          ) : contents.length === 0 ? (
            <div className="text-center text-gray-500">Bu kursa ait ders yok.</div>
          ) : (
            <div className="space-y-6">
              {contents.map((lesson, i) => (
                <div key={lesson.id} className="bg-gray-50 dark:bg-[#23272F] rounded-xl p-4 shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-blue-600">{i + 1}. {lesson.title}</span>
                    <span className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-1 ml-2">{lesson.contentType}</span>
                  </div>
                  {lesson.description && <div className="text-gray-600 dark:text-gray-300 mb-2">{lesson.description}</div>}
                  {lesson.contentType === 0 || lesson.contentType === "Video" ? (
                    <video src={lesson.contentUrl} controls className="rounded-xl mb-2" style={{ maxWidth: 400 }} />
                  ) : lesson.contentType === 2 || lesson.contentType === "PDF" ? (
                    <a href={lesson.contentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mb-2 block">PDF'i Görüntüle</a>
                  ) : lesson.contentType === 1 || lesson.contentType === "Text" ? (
                    <a href={lesson.contentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mb-2 block">Metni Görüntüle</a>
                  ) : null}
                  {lesson.duration && <div className="text-xs text-gray-400">Süre: {lesson.duration}</div>}
                  {lesson.quizId && <div className="mt-2"><a href={`/quizzes/${lesson.quizId}`} className="text-xs text-green-600 underline">Quiz'e Git</a></div>}
                  {/* Bu derse bağlı sınavlar */}
                  {lessonQuizzes[lesson.id] && lessonQuizzes[lesson.id].length > 0 && (
                    <div className="mt-3">
                      <div className="font-semibold text-sm text-purple-700 mb-1">Bu derse bağlı sınavlar:</div>
                      <ul className="list-disc ml-6">
                        {lessonQuizzes[lesson.id].map(q => (
                          <li key={q.id} className="text-sm text-gray-700 dark:text-gray-200">{q.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {isAdminOrInstructor && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => openEditLesson(lesson)} className="text-xs bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Düzenle</button>
                      <button onClick={() => handleDeleteLesson(lesson)} className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Sil</button>
                    </div>
                  )}
                  {/* Quiz Ekle Butonu ve Quiz Arayüzü */}
                  {isAdminOrInstructor && !lesson.quizId && (
                    <button onClick={() => openQuizForm(lesson.id)} className="mt-2 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-xs">Quiz Ekle</button>
                  )}
                  {isAdminOrInstructor && lesson.quizId && (
                    <button onClick={() => openQuestionForm(lesson.quizId)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs">Soru Ekle</button>
                  )}
                  {/* Quiz Ekle Modalı */}
                  {showQuizForm && quizLessonId === lesson.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-[#161B22] rounded-2xl shadow-lg p-8 w-full max-w-lg relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowQuizForm(false)}>×</button>
                        <h2 className="text-xl font-bold mb-4 text-purple-600 dark:text-purple-400">Quiz Ekle</h2>
                        <form onSubmit={handleQuizFormSubmit} className="space-y-4">
                          <div>
                            <label className="block mb-1">Quiz Başlığı *</label>
                            <input name="title" value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} className="w-full p-2 rounded border" />
                          </div>
                          <div>
                            <label className="block mb-1">Açıklama</label>
                            <input name="description" value={quizForm.description} onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))} className="w-full p-2 rounded border" />
                          </div>
                          <div>
                            <label className="block mb-1">Toplam Puan</label>
                            <input name="totalPoints" type="number" value={quizForm.totalPoints} onChange={e => setQuizForm(f => ({ ...f, totalPoints: e.target.value }))} className="w-full p-2 rounded border" />
                          </div>
                          <button type="submit" className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-purple-700 transition">Quiz Oluştur</button>
                          {quizFormError && <div className="text-red-500 text-sm mt-2">{quizFormError}</div>}
                        </form>
                      </div>
                    </div>
                  )}
                  {/* Soru Ekle Modalı */}
                  {showQuestionForm && lesson.quizId === currentQuizId && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-[#161B22] rounded-2xl shadow-lg p-8 w-full max-w-lg relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowQuestionForm(false)}>×</button>
                        <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Soru Ekle</h2>
                        <form onSubmit={handleQuestionFormSubmit} className="space-y-4">
                          <div>
                            <label className="block mb-1">Soru Metni *</label>
                            <input name="questionText" value={questionForm.questionText} onChange={e => setQuestionForm(f => ({ ...f, questionText: e.target.value }))} className="w-full p-2 rounded border" />
                          </div>
                          <div>
                            <label className="block mb-1">Soru Tipi</label>
                            <select name="questionType" value={questionForm.questionType} onChange={e => setQuestionForm(f => ({ ...f, questionType: e.target.value }))} className="w-full p-2 rounded border">
                              <option value="MultipleChoice">Çoktan Seçmeli</option>
                              <option value="TrueFalse">Doğru/Yanlış</option>
                            </select>
                          </div>
                          <div>
                            <label className="block mb-1">Şıklar</label>
                            {questionForm.options.map((opt, i) => (
                              <div key={i} className="flex items-center gap-2 mb-2">
                                <input value={opt.text} onChange={e => handleOptionChange(i, 'text', e.target.value)} className="p-2 rounded border flex-1" placeholder={`Şık ${i + 1}`} />
                                <label className="flex items-center gap-1 text-xs">
                                  <input type="checkbox" checked={opt.isCorrect} onChange={e => handleOptionChange(i, 'isCorrect', e.target.checked)} /> Doğru
                                </label>
                                {questionForm.options.length > 2 && (
                                  <button type="button" onClick={() => removeOption(i)} className="text-red-500 text-xs">Sil</button>
                                )}
                              </div>
                            ))}
                            <button type="button" onClick={addOption} className="text-green-600 text-xs underline">+ Şık Ekle</button>
                          </div>
                          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-blue-700 transition">Soru Ekle</button>
                          {questionFormError && <div className="text-red-500 text-sm mt-2">{questionFormError}</div>}
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Ders Ekle/Düzenle Modalı */}
          {showLessonForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#161B22] rounded-2xl shadow-lg p-8 w-full max-w-lg relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowLessonForm(false)}>×</button>
                <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">{editingLesson ? "Dersi Düzenle" : "Ders Ekle"}</h2>
                <form onSubmit={handleLessonFormSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-1">Başlık *</label>
                    <input name="title" value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} className="w-full p-2 rounded border" />
                  </div>
                  <div>
                    <label className="block mb-1">Açıklama</label>
                    <input name="description" value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} className="w-full p-2 rounded border" />
                  </div>
                  <div>
                    <label className="block mb-1">İçerik Türü *</label>
                    <select name="contentType" value={lessonForm.contentType} onChange={e => setLessonForm(f => ({ ...f, contentType: e.target.value }))} className="w-full p-2 rounded border">
                      <option value="Video">Video</option>
                      <option value="Text">Metin</option>
                      <option value="PDF">PDF</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">İçerik Bağlantısı (URL) *</label>
                    <input name="contentUrl" value={lessonForm.contentUrl} onChange={e => setLessonForm(f => ({ ...f, contentUrl: e.target.value }))} className="w-full p-2 rounded border mb-2" />
                    <input type="file"
                      accept={lessonForm.contentType === "Video" ? "video/*" : lessonForm.contentType === "PDF" ? "application/pdf" : "image/*"}
                      onChange={handleFileUpload}
                      className="w-full p-2 rounded border"
                      disabled={uploading}
                    />
                    {uploading && <div className="text-xs text-blue-600 mt-1">Yükleniyor...</div>}
                    {uploadError && <div className="text-xs text-red-500 mt-1">{uploadError}</div>}
                  </div>
                  <div>
                    <label className="block mb-1">Sıra</label>
                    <input name="order" type="number" value={lessonForm.order} onChange={e => setLessonForm(f => ({ ...f, order: e.target.value }))} className="w-full p-2 rounded border" />
                  </div>
                  <div>
                    <label className="block mb-1">Süre (örn. 00:10:00)</label>
                    <input name="duration" value={lessonForm.duration} onChange={e => setLessonForm(f => ({ ...f, duration: e.target.value }))} className="w-full p-2 rounded border" />
                  </div>
                  <div>
                    <label className="block mb-1">Sınav Seç</label>
                    <select
                      name="quizId"
                      value={lessonForm.quizId || ''}
                      onChange={e => setLessonForm(f => ({ ...f, quizId: e.target.value }))}
                      className="w-full p-2 rounded border"
                    >
                      <option value="">Sınav seçiniz (isteğe bağlı)</option>
                      {quizzes.map(q => (
                        <option key={q.id} value={q.id}>{q.title}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-blue-700 transition">Kaydet</button>
                  {lessonFormError && <div className="text-red-500 text-sm mt-2">{lessonFormError}</div>}
                </form>
              </div>
            </div>
          )}
          {/* Yeni Sınav Ekle Modalı */}
          {showQuizAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#161B22] rounded-2xl shadow-lg p-8 w-full max-w-lg relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowQuizAddModal(false)}>×</button>
                <h2 className="text-xl font-bold mb-4 text-purple-600 dark:text-purple-400">Yeni Sınav Ekle</h2>
                <form onSubmit={async e => {
                  e.preventDefault();
                  setNewQuizError('');
                  if (!newQuizForm.title) { setNewQuizError('Başlık zorunlu'); return; }
                  try {
                    const res = await fetch('http://192.168.1.78:5068/api/quizzes', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: newQuizForm.title,
                        description: newQuizForm.description,
                        totalPoints: Number(newQuizForm.totalPoints),
                        courseId: id
                      })
                    });
                    if (res.ok) {
                      setShowQuizAddModal(false);
                      setNewQuizForm({ title: '', description: '', totalPoints: 0 });
                      // Sınav listesini güncelle
                      fetch("http://192.168.1.78:5068/api/quizzes").then(res => res.json()).then(data => setQuizzes(data));
                    } else {
                      setNewQuizError('Sınav eklenemedi!');
                    }
                  } catch {
                    setNewQuizError('Sunucu hatası!');
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block mb-1">Başlık *</label>
                    <input name="title" value={newQuizForm.title} onChange={e => setNewQuizForm(f => ({ ...f, title: e.target.value }))} className="w-full p-2 rounded border" />
                  </div>
                  <div>
                    <label className="block mb-1">Açıklama</label>
                    <input name="description" value={newQuizForm.description} onChange={e => setNewQuizForm(f => ({ ...f, description: e.target.value }))} className="w-full p-2 rounded border" />
                  </div>
                  <div>
                    <label className="block mb-1">Toplam Puan</label>
                    <input name="totalPoints" type="number" value={newQuizForm.totalPoints} onChange={e => setNewQuizForm(f => ({ ...f, totalPoints: e.target.value }))} className="w-full p-2 rounded border" />
                  </div>
                  <button type="submit" className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-purple-700 transition">Kaydet</button>
                  {newQuizError && <div className="text-red-500 text-sm mt-2">{newQuizError}</div>}
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 