import 'package:flutter/material.dart';
import 'dart:async';
import '../services/api_service.dart';

class VideoPlayerPage extends StatefulWidget {
  final Map<String, dynamic> lesson;
  final Map<String, dynamic> course;

  const VideoPlayerPage({
    super.key,
    required this.lesson,
    required this.course,
  });

  @override
  State<VideoPlayerPage> createState() => _VideoPlayerPageState();
}

class _VideoPlayerPageState extends State<VideoPlayerPage> {
  bool isPlaying = false;
  bool isFullscreen = false;
  double currentPosition = 0.0;
  double videoDuration = 180.0; // 3 dakika örnek video
  Timer? progressTimer;
  bool showControls = true;
  Timer? hideControlsTimer;

  // Backend'den gelecek video listesi
  List<Map<String, dynamic>> courseVideos = [];
  bool isLoadingVideos = true;

  @override
  void initState() {
    super.initState();
    _loadCourseContents();
    _startHideControlsTimer();
  }

  @override
  void dispose() {
    progressTimer?.cancel();
    hideControlsTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadCourseContents() async {
    try {
      setState(() {
        isLoadingVideos = true;
      });

      final courseId = widget.course['id'];
      if (courseId != null) {
        final courseDetail = await ApiService.getCourseDetail(courseId);
        
        if (courseDetail != null && courseDetail['courseContents'] != null) {
          setState(() {
            courseVideos = (courseDetail['courseContents'] as List).asMap().entries.map((entry) {
              int index = entry.key;
              var content = entry.value;
              
              return {
                'id': content['id'],
                'title': content['title'] ?? 'Başlıksız İçerik',
                'description': content['description'] ?? '',
                'duration': _formatContentDuration(content['duration']),
                'isCompleted': false, // TODO: Progress API'den gelecek
                'isLocked': index > 2, // İlk 3 içerik açık
                'contentUrl': content['contentUrl'] ?? '',
                'contentType': content['contentType'] ?? 0,
                'order': content['order'] ?? index,
              };
            }).toList()..sort((a, b) => (a['order'] as int).compareTo(b['order'] as int));
            
            isLoadingVideos = false;
          });
        } else {
          // Fallback: Mevcut lesson'ı tek video olarak göster
          setState(() {
            courseVideos = [
              {
                'id': widget.lesson['id'] ?? 'current',
                'title': widget.lesson['title'] ?? 'Mevcut Ders',
                'duration': widget.lesson['duration'] ?? '5:00',
                'isCompleted': false,
                'isLocked': false,
                'contentUrl': widget.lesson['contentUrl'] ?? '',
                'contentType': widget.lesson['type'] ?? 'video',
              }
            ];
            isLoadingVideos = false;
          });
        }
      }
    } catch (e) {
      print('Kurs içerikleri yüklenirken hata: $e');
      // Hata olursa mevcut lesson'ı göster
      setState(() {
        courseVideos = [
          {
            'id': widget.lesson['id'] ?? 'current',
            'title': widget.lesson['title'] ?? 'Mevcut Ders',
            'duration': widget.lesson['duration'] ?? '5:00',
            'isCompleted': false,
            'isLocked': false,
            'contentUrl': widget.lesson['contentUrl'] ?? '',
            'contentType': widget.lesson['type'] ?? 'video',
          }
        ];
        isLoadingVideos = false;
      });
    }
  }

  String _formatContentDuration(dynamic duration) {
    if (duration == null) return '5:00';
    
    if (duration is String) {
      // Backend'den string olarak gelirse parse et
      final parts = duration.split(':');
      if (parts.length >= 2) {
        return duration;
      }
    } else if (duration is int) {
      // Saniye cinsinden gelirse dakika:saniye formatına çevir
      final minutes = (duration / 60).floor();
      final seconds = duration % 60;
      return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    }
    
    return '5:00'; // Varsayılan
  }

  String _mapContentTypeToString(dynamic contentType) {
    if (contentType == null) return 'video';
    
    final typeStr = contentType.toString();
    switch (typeStr) {
      case '0':
        return 'video';
      case '1':
        return 'text';
      case '2':
        return 'quiz';
      default:
        return 'video';
    }
  }

  Widget _buildVideoContent() {
    final hasVideoUrl = widget.lesson['contentUrl'] != null && 
                       widget.lesson['contentUrl'].toString().isNotEmpty;
    
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.grey[800]!,
            Colors.grey[900]!,
          ],
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            hasVideoUrl ? Icons.play_circle_filled : Icons.video_library_outlined,
            size: 60,
            color: Colors.white.withOpacity(0.3),
          ),
          const SizedBox(height: 8),
          Text(
            hasVideoUrl 
                ? 'Video Hazır - Oynatmak için tıklayın'
                : 'Video URL bulunamadı',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 16,
            ),
            textAlign: TextAlign.center,
          ),
          if (hasVideoUrl) ...[
            const SizedBox(height: 12),
            Text(
              'URL: ${widget.lesson['contentUrl']}',
              style: TextStyle(
                color: Colors.white.withOpacity(0.5),
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }

  void _togglePlayPause() {
    setState(() {
      isPlaying = !isPlaying;
    });

    if (isPlaying) {
      _startProgressTimer();
    } else {
      progressTimer?.cancel();
    }
    
    _showControlsTemporary();
  }

  void _startProgressTimer() {
    progressTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      if (currentPosition < videoDuration) {
        setState(() {
          currentPosition += 0.5;
        });
      } else {
        _onVideoComplete();
      }
    });
  }

  void _onVideoComplete() {
    progressTimer?.cancel();
    setState(() {
      isPlaying = false;
      currentPosition = videoDuration;
    });
    _showVideoCompleteDialog();
  }

  void _seekTo(double position) {
    setState(() {
      currentPosition = position;
    });
    _showControlsTemporary();
  }

  void _showControlsTemporary() {
    setState(() {
      showControls = true;
    });
    _startHideControlsTimer();
  }

  void _startHideControlsTimer() {
    hideControlsTimer?.cancel();
    hideControlsTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          showControls = false;
        });
      }
    });
  }

  void _toggleFullscreen() {
    setState(() {
      isFullscreen = !isFullscreen;
    });
    _showControlsTemporary();
  }

  String _formatDuration(double seconds) {
    int minutes = (seconds / 60).floor();
    int remainingSeconds = (seconds % 60).floor();
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    if (isFullscreen) {
      return _buildFullscreenPlayer();
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            // Video Player Area
            _buildVideoPlayer(),
            
            // Content Area
            Expanded(
              child: Container(
                color: Colors.grey[50],
                child: Column(
                  children: [
                    // Video Info
                    _buildVideoInfo(),
                    
                    // Video List
                    Expanded(child: _buildVideoList()),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoPlayer() {
    return GestureDetector(
      onTap: _showControlsTemporary,
      child: Container(
        width: double.infinity,
        height: 220,
        color: Colors.black,
        child: Stack(
          children: [
            // Video Content
            _buildVideoContent(),
            
            // Top Controls
            if (showControls)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withOpacity(0.7),
                        Colors.transparent,
                      ],
                    ),
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                      Expanded(
                        child: Text(
                          widget.lesson['title'],
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                          isFullscreen ? Icons.fullscreen_exit : Icons.fullscreen,
                          color: Colors.white,
                        ),
                        onPressed: _toggleFullscreen,
                      ),
                    ],
                  ),
                ),
              ),
            
            // Center Play Button
            if (showControls)
              Center(
                child: IconButton(
                  icon: Icon(
                    isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                    size: 80,
                    color: Colors.white.withOpacity(0.9),
                  ),
                  onPressed: _togglePlayPause,
                ),
              ),
            
            // Bottom Controls
            if (showControls)
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        Colors.black.withOpacity(0.7),
                        Colors.transparent,
                      ],
                    ),
                  ),
                  child: Column(
                    children: [
                      // Progress Bar
                      Row(
                        children: [
                          Text(
                            _formatDuration(currentPosition),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                            ),
                          ),
                          Expanded(
                            child: Slider(
                              value: currentPosition,
                              min: 0.0,
                              max: videoDuration,
                              onChanged: _seekTo,
                              activeColor: Colors.blue[600],
                              inactiveColor: Colors.white.withOpacity(0.3),
                            ),
                          ),
                          Text(
                            _formatDuration(videoDuration),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildFullscreenPlayer() {
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTap: _showControlsTemporary,
        child: Stack(
          children: [
            // Fullscreen Video
            Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.grey[800]!,
                    Colors.grey[900]!,
                  ],
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.play_circle_filled,
                    size: 100,
                    color: Colors.white.withOpacity(0.3),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Tam Ekran Video',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 20,
                    ),
                  ),
                ],
              ),
            ),
            
            // Fullscreen Controls
            if (showControls) ...[
              // Top Bar
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: SafeArea(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withOpacity(0.7),
                          Colors.transparent,
                        ],
                      ),
                    ),
                    child: Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.fullscreen_exit, color: Colors.white),
                          onPressed: _toggleFullscreen,
                        ),
                        Expanded(
                          child: Text(
                            widget.lesson['title'],
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              
              // Center Play Button
              Center(
                child: IconButton(
                  icon: Icon(
                    isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                    size: 100,
                    color: Colors.white.withOpacity(0.9),
                  ),
                  onPressed: _togglePlayPause,
                ),
              ),
              
              // Bottom Controls
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: SafeArea(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          Colors.black.withOpacity(0.7),
                          Colors.transparent,
                        ],
                      ),
                    ),
                    child: Row(
                      children: [
                        Text(
                          _formatDuration(currentPosition),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                          ),
                        ),
                        Expanded(
                          child: Slider(
                            value: currentPosition,
                            min: 0.0,
                            max: videoDuration,
                            onChanged: _seekTo,
                            activeColor: Colors.blue[600],
                            inactiveColor: Colors.white.withOpacity(0.3),
                          ),
                        ),
                        Text(
                          _formatDuration(videoDuration),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildVideoInfo() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.lesson['title'],
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.grey[800],
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.play_circle_outline, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 4),
              Text(
                widget.lesson['duration'],
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(width: 16),
              Icon(Icons.book_outlined, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 4),
              Text(
                widget.course['title'],
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Progress
          Row(
            children: [
              Expanded(
                child: LinearProgressIndicator(
                  value: currentPosition / videoDuration,
                  backgroundColor: Colors.grey[200],
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.blue[600]!),
                  minHeight: 4,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '${((currentPosition / videoDuration) * 100).toInt()}%',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.blue[600],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVideoList() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Kurs Videoları',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.grey[800],
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: isLoadingVideos
                ? const Center(child: CircularProgressIndicator())
                : ListView.separated(
              itemCount: courseVideos.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final video = courseVideos[index];
                final isCurrentVideo = video['title'] == widget.lesson['title'] || 
                                     video['id'] == widget.lesson['id'];
                
                return GestureDetector(
                  onTap: video['isLocked'] ? null : () {
                    if (!isCurrentVideo) {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) => VideoPlayerPage(
                            lesson: {
                              'id': video['id'],
                              'title': video['title'],
                              'duration': video['duration'],
                              'contentUrl': video['contentUrl'],
                              'type': _mapContentTypeToString(video['contentType']),
                            },
                            course: widget.course,
                          ),
                        ),
                      );
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isCurrentVideo ? Colors.blue[50] : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isCurrentVideo ? Colors.blue[300]! : Colors.grey[200]!,
                        width: isCurrentVideo ? 2 : 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          spreadRadius: 0,
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Thumbnail
                        Container(
                          width: 60,
                          height: 40,
                          decoration: BoxDecoration(
                            color: video['isLocked'] ? Colors.grey[300] : Colors.grey[800],
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Icon(
                            video['isLocked'] ? Icons.lock : Icons.play_arrow,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                        
                        const SizedBox(width: 12),
                        
                        // Video Info
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                video['title'],
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: video['isLocked'] ? Colors.grey[500] : Colors.grey[800],
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                video['duration'],
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        // Status
                        if (video['isCompleted'])
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.green[100],
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.check,
                              size: 16,
                              color: Colors.green[600],
                            ),
                          )
                        else if (isCurrentVideo)
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.blue[100],
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.play_arrow,
                              size: 16,
                              color: Colors.blue[600],
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showVideoCompleteDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          title: Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green[600], size: 28),
              const SizedBox(width: 8),
              Text(
                'Video Tamamlandı',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[800],
                ),
              ),
            ],
          ),
          content: Text(
            'Bu videoyu başarıyla tamamladınız! Sonraki videoya geçmek ister misiniz?',
            style: TextStyle(
              color: Colors.grey[700],
              height: 1.4,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'Kapat',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                // Sonraki videoya geç (örnek)
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Sonraki video yakında!')),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue[600],
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Sonraki Video'),
            ),
          ],
        );
      },
    );
  }
} 