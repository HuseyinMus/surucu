import 'package:flutter/material.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> with TickerProviderStateMixin {
  String selectedCategory = 'Tümü';
  final List<String> categories = ['Tümü', 'Duyuru', 'Sistem', 'Kurs', 'Sınav'];
  
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );
    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  // Bildirim verileri
  List<Map<String, dynamic>> notifications = [
    {
      'id': 1,
      'title': 'Yeni Kurs Eklendi',
      'message': 'Güvenli Sürüş kursu artık mevcut. Hemen başla!',
      'type': 'Kurs',
      'time': '2 saat önce',
      'isRead': false,
      'icon': Icons.book_outlined,
      'color': Colors.blue,
    },
    {
      'id': 2,
      'title': 'Sınav Sonucun Hazır',
      'message': 'Trafik İşaretleri sınavından 92 puan aldın. Tebrikler!',
      'type': 'Sınav',
      'time': '5 saat önce',
      'isRead': false,
      'icon': Icons.quiz_outlined,
      'color': Colors.green,
    },
    {
      'id': 3,
      'title': 'Günlük Hedefin Tamamlandı',
      'message': 'Bugün 2 saat çalışma hedefini başarıyla tamamladın.',
      'type': 'Sistem',
      'time': '1 gün önce',
      'isRead': true,
      'icon': Icons.check_circle_outlined,
      'color': Colors.orange,
    },
    {
      'id': 4,
      'title': 'Önemli Duyuru',
      'message': 'Sistem bakımı nedeniyle yarın 14:00-16:00 arası hizmet verilmeyecek.',
      'type': 'Duyuru',
      'time': '1 gün önce',
      'isRead': true,
      'icon': Icons.campaign_outlined,
      'color': Colors.red,
    },
    {
      'id': 5,
      'title': 'Kurs Hatırlatması',
      'message': 'Direksiyon Teknikleri kursunda 3 ders kaldı.',
      'type': 'Kurs',
      'time': '2 gün önce',
      'isRead': true,
      'icon': Icons.schedule_outlined,
      'color': Colors.purple,
    },
    {
      'id': 6,
      'title': 'Başarı Rozeti Kazandın',
      'message': '"Azimli Öğrenci" rozetini kazandın. 7 gün üst üste çalıştın!',
      'type': 'Sistem',
      'time': '3 gün önce',
      'isRead': true,
      'icon': Icons.military_tech_outlined,
      'color': Colors.amber,
    },
    {
      'id': 7,
      'title': 'Yeni Sınav Açıldı',
      'message': 'Park Teknikleri sınavı artık mevcut.',
      'type': 'Sınav',
      'time': '4 gün önce',
      'isRead': true,
      'icon': Icons.assignment_outlined,
      'color': Colors.indigo,
    },
    {
      'id': 8,
      'title': 'Haftalık Rapor',
      'message': 'Bu hafta 42 saat çalıştın ve 3 sınav tamamladın.',
      'type': 'Sistem',
      'time': '1 hafta önce',
      'isRead': true,
      'icon': Icons.bar_chart_outlined,
      'color': Colors.cyan,
    },
  ];

  List<Map<String, dynamic>> get filteredNotifications {
    if (selectedCategory == 'Tümü') return notifications;
    return notifications.where((notif) => notif['type'] == selectedCategory).toList();
  }

  int get unreadCount {
    return notifications.where((notif) => !notif['isRead']).length;
  }

  void markAsRead(int id) {
    setState(() {
      notifications = notifications.map((notif) {
        if (notif['id'] == id) {
          notif['isRead'] = true;
        }
        return notif;
      }).toList();
    });
  }

  void markAllAsRead() {
    setState(() {
      notifications = notifications.map((notif) {
        notif['isRead'] = true;
        return notif;
      }).toList();
    });
  }

  void deleteNotification(int id) {
    setState(() {
      notifications.removeWhere((notif) => notif['id'] == id);
    });
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
              Colors.orange[50]!,
              Colors.white,
              Colors.amber[50]!,
            ],
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: Column(
              children: [
                // Modern AppBar
                _buildModernAppBar(),
                
                // Category Filter
                _buildCategoryFilter(),
                
                // Notifications List
                Expanded(
                  child: filteredNotifications.isEmpty
                      ? _buildEmptyState()
                      : RefreshIndicator(
                          onRefresh: () async {
                            await Future.delayed(const Duration(seconds: 1));
                            setState(() {});
                          },
                          child: ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: filteredNotifications.length,
                            itemBuilder: (context, index) {
                              return _buildNotificationCard(filteredNotifications[index], index);
                            },
                          ),
                        ),
                ),
              ],
            ),
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
          colors: [Colors.orange[600]!, Colors.amber[600]!],
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
                  'Bildirimler',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${notifications.length} bildirim, $unreadCount okunmamış',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          if (unreadCount > 0)
            GestureDetector(
              onTap: markAllAsRead,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.done_all,
                  color: Colors.white,
                  size: 24,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCategoryFilter() {
    return Container(
      height: 50,
      margin: const EdgeInsets.all(16),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = selectedCategory == category;
          final categoryCount = category == 'Tümü' 
              ? notifications.length 
              : notifications.where((n) => n['type'] == category).length;
          
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
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  gradient: isSelected
                      ? LinearGradient(colors: [Colors.orange[600]!, Colors.amber[600]!])
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
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      category,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.grey[700],
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                        fontSize: 14,
                      ),
                    ),
                    if (categoryCount > 0) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isSelected ? Colors.white.withOpacity(0.3) : Colors.grey[300],
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          categoryCount.toString(),
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.grey[600],
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> notification, int index) {
    final isUnread = !notification['isRead'];
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Dismissible(
        key: Key('notification_${notification['id']}'),
        direction: DismissDirection.endToStart,
        background: Container(
          alignment: Alignment.centerRight,
          padding: const EdgeInsets.only(right: 20),
          decoration: BoxDecoration(
            color: Colors.red[400],
            borderRadius: BorderRadius.circular(15),
          ),
          child: const Icon(
            Icons.delete_outline,
            color: Colors.white,
            size: 28,
          ),
        ),
        onDismissed: (direction) {
          deleteNotification(notification['id']);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${notification['title']} silindi'),
              backgroundColor: Colors.red[400],
            ),
          );
        },
        child: GestureDetector(
          onTap: () {
            if (isUnread) {
              markAsRead(notification['id']);
            }
          },
          child: AnimatedContainer(
            duration: Duration(milliseconds: 300 + (index * 50)),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(15),
              border: isUnread ? Border.all(color: Colors.orange[200]!, width: 2) : null,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(isUnread ? 0.15 : 0.08),
                  spreadRadius: isUnread ? 3 : 1,
                  blurRadius: isUnread ? 12 : 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  // Icon
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: notification['color'][100],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      notification['icon'],
                      color: notification['color'][600],
                      size: 24,
                    ),
                  ),
                  
                  const SizedBox(width: 16),
                  
                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                notification['title'],
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: isUnread ? FontWeight.bold : FontWeight.w600,
                                  color: Colors.grey[800],
                                ),
                              ),
                            ),
                            if (isUnread)
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: Colors.orange[600],
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                        
                        const SizedBox(height: 4),
                        
                        Text(
                          notification['message'],
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                            height: 1.3,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        
                        const SizedBox(height: 8),
                        
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: notification['color'][50],
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                notification['type'],
                                style: TextStyle(
                                  fontSize: 12,
                                  color: notification['color'][700],
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Text(
                              notification['time'],
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[500],
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
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none_outlined,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Bildirim Yok',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            selectedCategory == 'Tümü' 
                ? 'Henüz hiç bildiriminiz yok'
                : '$selectedCategory kategorisinde bildirim yok',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
} 