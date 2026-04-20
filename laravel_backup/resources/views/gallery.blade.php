@extends('layout')

@section('title', 'Galería')

@section('styles')
<style>
    .gallery-container {
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
        padding-top: 20px;
    }

    /* Instagram Profile Header */
    .profile-header {
        display: flex;
        padding: 0 20px 20px 20px; /* Reduced bottom padding */
        border-bottom: 1px solid var(--glass-border);
        margin-bottom: 0;
        align-items: center; /* Center items vertically */
    }
    .profile-photo {
        flex: 0 0 auto; /* Don't take up 30% fixed space */
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .profile-photo .circle {
        width: 100px; /* Reduced from 150px */
        height: 100px; /* Reduced from 150px */
        border-radius: 50%;
        background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
        padding: 3px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .profile-photo .inner {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: var(--bg-dark);
        display: flex;
        justify-content: center;
        align-items: center;
        border: 3px solid var(--bg-dark);
        overflow: hidden;
    }
    .profile-info {
        flex: 1;
        padding-left: 30px; /* More space from the photo */
    }
    .profile-username {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 0; /* Removed bottom margin */
    }
    .profile-username h2 {
        font-weight: 400;
        font-size: 24px; /* Slightly smaller */
        margin: 0;
    }

    /* Tabs */
    .gallery-tabs {
        display: flex;
        justify-content: center;
        gap: 60px;
        border-top: 1px solid var(--glass-border);
        margin-top: -1px;
    }
    .tab {
        padding: 15px 0;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #8e8e8e;
        cursor: pointer;
        border-top: 1px solid transparent;
    }
    .tab.active {
        color: #fff;
        border-top: 1px solid #fff;
    }

    /* Grid */
    .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        padding-top: 20px;
    }

    @media (max-width: 1200px) {
        .grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }
    .photo-card {
        position: relative;
        overflow: hidden;
        aspect-ratio: 1 / 1;
        cursor: pointer;
    }
    .photo-card img, .photo-card video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .video-icon {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));
    }

    /* Mobile Adaptations */
    @media (max-width: 768px) {
        .profile-header {
            flex-direction: column;
            padding: 20px;
            align-items: center;
            text-align: center;
        }
        .profile-photo .circle {
            width: 80px;
            height: 80px;
        }
        .profile-username {
            flex-direction: column;
            align-items: center;
            gap: 10px;
            margin-top: 20px;
        }
        .grid {
            gap: 3px;
            padding: 0;
        }
        .profile-info { padding: 0; }
    }

    /* Modal Styles */
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.95);
        backdrop-filter: blur(10px);
        justify-content: center;
        align-items: center;
    }
    .modal-content-wrapper {
        position: relative;
        max-width: 90%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .modal-content {
        max-width: 100%;
        max-height: 80vh;
        border-radius: 4px;
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
    }
    .modal-close {
        position: absolute;
        top: -40px;
        right: 0;
        color: #fff;
        font-size: 35px;
        cursor: pointer;
    }
    .modal-caption {
        margin-top: 15px;
        color: var(--primary);
        font-weight: 600;
        font-size: 1.1rem;
    }
</style>
@endsection

@section('content')
<div class="gallery-container fade-in">
    <!-- Simplified Header -->
    <header class="profile-header" style="justify-content: space-between; align-items: center;">
        <div class="event-title">
            <h2 style="font-weight: 600; font-size: 28px; margin: 0; color: #fff; letter-spacing: 1px;">Boda</h2>
        </div>
        <div class="header-actions">
            <a href="{{ route('home') }}" class="btn-gold" style="padding: 10px 20px; font-size: 14px;">Escanear QR</a>
        </div>
    </header>

    <!-- Tabs -->
    <div class="gallery-tabs">
        <div class="tab active" id="tab-all" onclick="switchTab('all')">
            <svg aria-label="" color="#fff" fill="none" height="12" role="img" viewBox="0 0 24 24" width="12" stroke="currentColor" stroke-width="2"><rect height="18" width="18" x="3" y="3"></rect><line x1="9" x2="9" y1="3" y2="21"></line><line x1="15" x2="15" y1="3" y2="21"></line><line x1="3" x2="21" y1="9" y2="9"></line><line x1="3" x2="21" y1="15" y2="15"></line></svg>
            Todas
        </div>
        <div class="tab" id="tab-posts" onclick="switchTab('image')">
            <svg aria-label="" color="#8e8e8e" fill="none" height="12" role="img" viewBox="0 0 24 24" width="12" stroke="currentColor" stroke-width="2"><rect height="18" width="18" x="3" y="3" rx="2"></rect><path d="M12 4v16m8-8H4" stroke-width="2"></path></svg>
            Imágenes
        </div>
        <div class="tab" id="tab-reels" onclick="switchTab('video')">
            <svg aria-label="" color="#8e8e8e" fill="none" height="12" role="img" viewBox="0 0 24 24" width="12" stroke="currentColor" stroke-width="2"><rect height="18" width="18" x="3" y="3" rx="2"></rect><path d="M12 8l4 4-4 4V8z" fill="currentColor"></path></svg>
            Reels
        </div>
    </div>

    @if($photos->isEmpty())
        <div class="glass-container" style="text-align: center; margin-top: 40px; border: none;">
            <p>Todavía no hay contenido en esta boda.</p>
        </div>
    @else
        <div class="grid" id="main-grid">
            @foreach($photos as $photo)
                <div class="photo-card media-item" data-type="{{ $photo->type }}" onclick="openMediaModal('{{ asset('storage/' . $photo->path) }}', '{{ $photo->guest_name }}', '{{ $photo->type }}')">
                    @if($photo->type == 'image')
                        <img src="{{ asset('storage/' . $photo->path) }}" alt="Foto">
                    @else
                        <video src="{{ asset('storage/' . $photo->path) }}" muted playsinline></video>
                        <div class="video-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </div>
                    @endif
                </div>
            @endforeach
        </div>
    @endif
</div>

<!-- Modal Structure -->
<div id="mediaModal" class="modal" onclick="closeMediaModal()">
    <div class="modal-content-wrapper" onclick="event.stopPropagation()">
        <span class="modal-close" onclick="closeMediaModal()">&times;</span>
        <div id="modal-body" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
            <!-- Content will be injected here -->
        </div>
        <div id="mediaCaption" class="modal-caption"></div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    let currentFilter = 'all';

    function switchTab(type) {
        currentFilter = type;
        
        // Update tabs UI
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
            t.querySelector('svg').style.color = '#8e8e8e';
        });
        
        let activeTabId;
        if (type === 'all') activeTabId = 'tab-all';
        else if (type === 'image') activeTabId = 'tab-posts';
        else activeTabId = 'tab-reels';

        const activeTab = document.getElementById(activeTabId);
        activeTab.classList.add('active');
        activeTab.querySelector('svg').style.color = '#fff';

        // Filter Grid
        document.querySelectorAll('.media-item').forEach(item => {
            if (type === 'all' || item.getAttribute('data-type') === type) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    function openMediaModal(src, name, type) {
        const modal = document.getElementById("mediaModal");
        const body = document.getElementById("modal-body");
        const captionText = document.getElementById("mediaCaption");
        
        body.innerHTML = '';
        
        if (type === 'image') {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'modal-content';
            body.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = src;
            video.className = 'modal-content';
            video.controls = true;
            video.autoplay = true;
            body.appendChild(video);
        }

        modal.style.display = "flex";
        captionText.innerHTML = name ? "Subido por: " + name : "";
        
        clearTimeout(refreshTimer);
    }

    function closeMediaModal() {
        document.getElementById("mediaModal").style.display = "none";
        document.getElementById("modal-body").innerHTML = ''; // Stop video if playing
        startRefreshTimer();
    }

    let refreshTimer;
    function startRefreshTimer() {
        refreshTimer = setTimeout(function() {
            location.reload();
        }, 30000);
    }

    // Initialize
    switchTab('all'); // Start with All (Mixed) content
    startRefreshTimer();
</script>
@endsection
