/**
 * Rinswa Browser - Universal Native Video Popout (Picture-in-Picture) Engine
 * Developed and made by Arindam Makar for Rinswa Chromium
 *
 * Provides native floating Picture-in-Picture for all video platforms:
 * 1. Cyber-Glass hover button on any HTML5 video (YouTube, Twitch, Netflix, Vimeo, Twitter/X, etc.).
 * 2. Dedicated native icon inside YouTube's player control bar (.ytp-right-controls).
 * 3. Universal keyboard shortcut (Alt + P) to toggle popup player on any tab.
 * 4. Auto-PiP on tab backgrounding when playing.
 */

(function () {
    'use strict';

    if (window.__rinswa_pip_engine_active) return;
    window.__rinswa_pip_engine_active = true;

    // High-resolution PiP SVG icon
    const PIP_SVG_HTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" fill="none"/>
            <rect x="12" y="9" width="8" height="6" rx="1" ry="1" fill="currentColor" stroke="none"/>
        </svg>
    `;

    // Track attached videos
    const trackedVideos = new WeakSet();

    // Toggle Picture-in-Picture for a video
    async function togglePiP(video) {
        if (!video) return;
        try {
            if (document.pictureInPictureElement === video) {
                await document.exitPictureInPicture();
            } else {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                }
                if (video.readyState >= 1) {
                    await video.requestPictureInPicture();
                } else {
                    video.addEventListener('loadedmetadata', async () => {
                        await video.requestPictureInPicture();
                    }, { once: true });
                }
            }
        } catch (err) {
            console.debug('[Rinswa PiP] Picture-in-Picture toggle notice:', err);
        }
    }

    // Attach Cyber-Glass Popout button to a video element
    function attachPiPOverlay(video) {
        if (!video || trackedVideos.has(video)) return;
        // Ignore tiny utility videos, ads, or audio-only streams
        if (video.offsetWidth < 140 && video.offsetHeight < 90 && !video.paused) {
            return;
        }
        trackedVideos.add(video);

        // Find best container
        const container = video.parentElement || video;
        const computedPos = window.getComputedStyle(container).position;
        if (computedPos === 'static') {
            container.style.position = 'relative';
        }

        // Create overlay button
        const btn = document.createElement('div');
        btn.className = 'rinswa-pip-overlay-btn';
        btn.innerHTML = `${PIP_SVG_HTML}<span>Pop Out</span>`;
        btn.title = 'Rinswa Native Popout (Alt+P)';

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePiP(video);
        });

        container.appendChild(btn);

        // Hover handling
        let hideTimeout = null;

        function showButton() {
            if (document.fullscreenElement) {
                btn.classList.remove('rinswa-visible');
                return;
            }
            btn.classList.add('rinswa-visible');
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                btn.classList.remove('rinswa-visible');
            }, 2500);
        }

        container.addEventListener('mouseenter', showButton);
        container.addEventListener('mousemove', showButton);
        container.addEventListener('mouseleave', () => {
            clearTimeout(hideTimeout);
            btn.classList.remove('rinswa-visible');
        });
    }

    // Dedicated YouTube Player Control Bar Integration
    function injectYouTubeNativeButton() {
        if (!location.hostname.includes('youtube.com')) return;
        const rightControls = document.querySelector('.ytp-right-controls');
        if (!rightControls || rightControls.querySelector('.rinswa-ytp-pip-btn')) return;

        const ytBtn = document.createElement('button');
        ytBtn.className = 'ytp-button rinswa-ytp-pip-btn';
        ytBtn.title = 'Picture in picture (Alt+P)';
        ytBtn.setAttribute('aria-label', 'Picture in picture (Alt+P)');
        ytBtn.innerHTML = PIP_SVG_HTML;

        ytBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mainVideo = document.querySelector('video.html5-main-video') || document.querySelector('video');
            if (mainVideo) {
                togglePiP(mainVideo);
            }
        });

        // Insert before fullscreen or at the beginning of right controls
        const fullscreenBtn = rightControls.querySelector('.ytp-fullscreen-button');
        if (fullscreenBtn) {
            rightControls.insertBefore(ytBtn, fullscreenBtn);
        } else {
            rightControls.appendChild(ytBtn);
        }
    }

    // Scan for all video elements
    function scanVideos() {
        const videos = document.querySelectorAll('video');
        for (const v of videos) {
            attachPiPOverlay(v);
        }
        injectYouTubeNativeButton();
    }

    // Fast initial scan & dynamic DOM observer
    scanVideos();
    const observer = new MutationObserver(scanVideos);
    observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true
    });

    // Universal Shortcut: Alt + P
    window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            const videos = Array.from(document.querySelectorAll('video'));
            // Prioritize playing video
            const playing = videos.find(v => !v.paused && !v.ended && v.readyState > 2);
            const target = playing || videos[0];
            if (target) {
                togglePiP(target);
            }
        }
    }, true);

    // Auto-PiP on Tab Switch
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            const playingVideo = Array.from(document.querySelectorAll('video')).find(v => !v.paused && !v.ended && v.readyState > 2);
            if (playingVideo && !document.pictureInPictureElement) {
                // Auto pop out if user leaves the tab with an active video
                togglePiP(playingVideo);
            }
        }
    });

})();
