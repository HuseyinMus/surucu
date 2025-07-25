import 'package:flutter/material.dart';
import 'pages/login_page.dart';
import 'pages/dashboard_page.dart';
import 'pages/courses_page.dart';
import 'pages/quizzes_page.dart';
import 'pages/progress_page.dart';
import 'pages/notifications_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sürücü Kursu',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const LoginPage(),
      routes: {
        '/dashboard': (context) => const DashboardPage(),
        '/courses': (context) => const CoursesPage(),
        '/quizzes': (context) => const QuizzesPage(),
        '/progress': (context) => const ProgressPage(),
        '/notifications': (context) => const NotificationsPage(),
      },
    );
  }
}


