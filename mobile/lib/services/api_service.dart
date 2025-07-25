import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://localhost:7154/api';
  
  // HTTP Headers
  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Token ile birlikte headers
  static Future<Map<String, String>> get _authenticatedHeaders async {
    final token = await getToken();
    return {
      ..._headers,
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Token kaydetme
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  // Token okuma
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  // Token silme
  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // LOGIN
  static Future<Map<String, dynamic>?> login(String tc) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _headers,
        body: jsonEncode({
          'email': '$tc@example.com', // TC'yi email formatına çevir
          'password': 'password123', // Sabit şifre
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['token'] != null) {
          await saveToken(data['token']);
        }
        return data;
      }
      return null;
    } catch (e) {
      print('Login hatası: $e');
      return null;
    }
  }

  // LOGOUT
  static Future<bool> logout() async {
    try {
      await clearToken();
      return true;
    } catch (e) {
      print('Logout hatası: $e');
      return false;
    }
  }

  // KURSLAR
  static Future<List<Map<String, dynamic>>?> getCourses() async {
    try {
      final headers = await _authenticatedHeaders;
      final response = await http.get(
        Uri.parse('$baseUrl/courses'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return null;
    } catch (e) {
      print('Kurs getirme hatası: $e');
      return null;
    }
  }

  // KURS DETAYI
  static Future<Map<String, dynamic>?> getCourseDetail(int courseId) async {
    try {
      final headers = await _authenticatedHeaders;
      final response = await http.get(
        Uri.parse('$baseUrl/courses/$courseId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Kurs detay hatası: $e');
      return null;
    }
  }

  // QUIZLER
  static Future<List<Map<String, dynamic>>?> getQuizzes() async {
    try {
      final headers = await _authenticatedHeaders;
      final response = await http.get(
        Uri.parse('$baseUrl/quizzes'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return null;
    } catch (e) {
      print('Quiz getirme hatası: $e');
      return null;
    }
  }

  // QUIZ DETAYI
  static Future<Map<String, dynamic>?> getQuizDetail(int quizId) async {
    try {
      final headers = await _authenticatedHeaders;
      final response = await http.get(
        Uri.parse('$baseUrl/quizzes/$quizId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Quiz detay hatası: $e');
      return null;
    }
  }

  // QUIZ BAŞLAT
  static Future<Map<String, dynamic>?> startQuiz(int quizId) async {
    try {
      final headers = await _authenticatedHeaders;
      final response = await http.post(
        Uri.parse('$baseUrl/quizzes/$quizId/start'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Quiz başlatma hatası: $e');
      return null;
    }
  }

  // QUIZ TAMAMLA
  static Future<Map<String, dynamic>?> submitQuiz(int quizId, List<Map<String, dynamic>> answers) async {
    try {
      final headers = await _authenticatedHeaders;
      final response = await http.post(
        Uri.parse('$baseUrl/quizzes/$quizId/submit'),
        headers: headers,
        body: jsonEncode({
          'answers': answers,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Quiz gönderme hatası: $e');
      return null;
    }
  }

  // ÖĞRENCİ PROGRESS
  static Future<Map<String, dynamic>?> getStudentProgress() async {
    try {
      final headers = await _authenticatedHeaders;
      final response = await http.get(
        Uri.parse('$baseUrl/students/progress'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Progress getirme hatası: $e');
      return null;
    }
  }

  // BİLDİRİMLER
  static Future<List<Map<String, dynamic>>?> getNotifications() async {
    try {
      final headers = await _authenticatedHeaders;
      final response = await http.get(
        Uri.parse('$baseUrl/notifications'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return null;
    } catch (e) {
      print('Bildirim getirme hatası: $e');
      return null;
    }
  }

  // BİLDİRİM OKUNDU OLARAK İŞARETLE
  static Future<bool> markNotificationAsRead(int notificationId) async {
    try {
      final headers = await _authenticatedHeaders;
      final response = await http.patch(
        Uri.parse('$baseUrl/notifications/$notificationId/read'),
        headers: headers,
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Bildirim güncelleme hatası: $e');
      return false;
    }
  }

  // USER PROFİL
  static Future<Map<String, dynamic>?> getUserProfile() async {
    try {
      final headers = await _authenticatedHeaders;
      final response = await http.get(
        Uri.parse('$baseUrl/users/profile'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Profil getirme hatası: $e');
      return null;
    }
  }

  // TOKEN CONTROL
  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null;
  }

  // API TEST
  static Future<bool> testConnection() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
        headers: _headers,
      );
      return response.statusCode == 200;
    } catch (e) {
      print('API bağlantı testi hatası: $e');
      return false;
    }
  }
} 