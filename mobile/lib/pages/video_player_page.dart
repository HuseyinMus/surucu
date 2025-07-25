import 'package:flutter/material.dart';
import 'dart:async';

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

  // Örnek video listesi
  late List<Map<String, dynamic>> courseVideos;

  @override
  void initState() {
    super.initState();
    _initializeCourseVideos();
    _startHideControlsTimer();
  }

  @override
  void dispose() {
    progressTimer?.cancel();
    hideControlsTimer?.cancel();
    super.dispose();
  }

  void _initializeCourseVideos() {
    courseVideos = [
      {
        'id': 1,
        'title': 'Temel Trafik Kuralları',
        'duration': '12:30',
        'isCompleted': true,
        'isLocked': false,
      },
      {
        'id': 2,
        'title': 'Kavşak Geçiş Kuralları',
        'duration': '8:45',
        'isCompleted': false,
        'isLocked': false,
      },
      {
        'id': 3,
        'title': 'Park Etme Teknikleri',
        'duration': '15:20',
        'isCompleted': false,
        'isLocked': false,
      },
      {
        'id': 4,
        'title': 'Gece Sürüş',
        'duration': '10:15',
        'isCompleted': false,
        'isLocked': true,
      },
    ];
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
            // Video Placeholder
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
                    size: 60,
                    color: Colors.white.withOpacity(0.3),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Video Oynatılıyor...',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
            
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
            child: ListView.separated(
              itemCount: courseVideos.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final video = courseVideos[index];
                final isCurrentVideo = video['title'] == widget.lesson['title'];
                
                return GestureDetector(
                  onTap: video['isLocked'] ? null : () {
                    if (!isCurrentVideo) {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) => VideoPlayerPage(
                            lesson: video,
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