import 'package:flutter/material.dart';
import 'course_detail_page.dart';

class CoursesPage extends StatefulWidget {
  const CoursesPage({super.key});

  @override
  State<CoursesPage> createState() => _CoursesPageState();
}

class _CoursesPageState extends State<CoursesPage> {
  String selectedCategory = 'Tümü';
  final List<String> categories = ['Tümü', 'Teori', 'Pratik', 'Sınav', 'Video'];

  // Örnek kurs verileri
  final List<Map<String, dynamic>> courses = [
    {
      'title': 'Trafik Kuralları',
      'category': 'Teori',
      'progress': 75,
      'duration': '2 saat 30 dk',
      'lessons': 12,
      'color': Colors.blue,
      'icon': Icons.traffic,
      'isCompleted': false,
    },
    {
      'title': 'Direksiyon Teknikleri',
      'category': 'Pratik',
      'progress': 45,
      'duration': '4 saat',
      'lessons': 8,
      'color': Colors.green,
      'icon': Icons.drive_eta,
      'isCompleted': false,
    },
    {
      'title': 'Park Etme Sanatı',
      'category': 'Pratik',
      'progress': 100,
      'duration': '1 saat 45 dk',
      'lessons': 6,
      'color': Colors.orange,
      'icon': Icons.local_parking,
      'isCompleted': true,
    },
    {
      'title': 'Ehliyet Sınavı Hazırlık',
      'category': 'Sınav',
      'progress': 30,
      'duration': '3 saat',
      'lessons': 15,
      'color': Colors.purple,
      'icon': Icons.quiz,
      'isCompleted': false,
    },
    {
      'title': 'Güvenli Sürüş',
      'category': 'Video',
      'progress': 60,
      'duration': '2 saat',
      'lessons': 10,
      'color': Colors.red,
      'icon': Icons.security,
      'isCompleted': false,
    },
  ];

  List<Map<String, dynamic>> get filteredCourses {
    if (selectedCategory == 'Tümü') return courses;
    return courses.where((course) => course['category'] == selectedCategory).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.blue[50]!,
              Colors.white,
              Colors.purple[50]!,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Modern AppBar
              _buildModernAppBar(),
              
              // Search Bar
              _buildSearchBar(),
              
              // Category Chips
              _buildCategoryChips(),
              
              // Courses List
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () async {
                    await Future.delayed(const Duration(seconds: 1));
                    setState(() {});
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredCourses.length,
                    itemBuilder: (context, index) {
                      return _buildModernCourseCard(filteredCourses[index], index);
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModernAppBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue[600]!, Colors.purple[600]!],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(25),
          bottomRight: Radius.circular(25),
        ),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Kurslarım',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${courses.length} kurs mevcut',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.notifications_outlined,
              color: Colors.white,
              size: 24,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 2,
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Kurs ara...',
          prefixIcon: Icon(Icons.search, color: Colors.grey[400]),
          suffixIcon: Icon(Icons.tune, color: Colors.grey[400]),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
    );
  }

  Widget _buildCategoryChips() {
    return Container(
      height: 50,
      margin: const EdgeInsets.only(bottom: 16),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = selectedCategory == category;
          
          return Container(
            margin: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  selectedCategory = category;
                });
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  gradient: isSelected
                      ? LinearGradient(colors: [Colors.blue[600]!, Colors.purple[600]!])
                      : null,
                  color: isSelected ? null : Colors.white,
                  borderRadius: BorderRadius.circular(25),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      spreadRadius: 1,
                      blurRadius: 5,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  category,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.grey[700],
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildModernCourseCard(Map<String, dynamic> course, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: GestureDetector(
        onTap: () {
          // Kurs detayına git
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CourseDetailPage(course: course),
            ),
          );
        },
        child: Hero(
          tag: 'course_$index',
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 2,
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              children: [
                // Header with icon and category
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [course['color'][100], course['color'][50]],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: course['color'][600],
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Icon(
                          course['icon'],
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              course['title'],
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[800],
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: course['color'][600],
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                course['category'],
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (course['isCompleted'])
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.green[600],
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check,
                            color: Colors.white,
                            size: 16,
                          ),
                        ),
                    ],
                  ),
                ),
                
                // Content
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      // Progress
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'İlerleme',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            '%${course['progress']}',
                            style: TextStyle(
                              color: course['color'][600],
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: LinearProgressIndicator(
                          value: course['progress'] / 100,
                          backgroundColor: Colors.grey[200],
                          valueColor: AlwaysStoppedAnimation<Color>(course['color'][600]),
                          minHeight: 6,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Stats
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatItem(
                              icon: Icons.play_circle_outline,
                              label: 'Süre',
                              value: course['duration'],
                              color: course['color'][600],
                            ),
                          ),
                          Expanded(
                            child: _buildStatItem(
                              icon: Icons.book_outlined,
                              label: 'Ders',
                              value: '${course['lessons']} bölüm',
                              color: course['color'][600],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 4),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
            Text(
              value,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.grey[800],
              ),
            ),
          ],
        ),
      ],
    );
  }
} 