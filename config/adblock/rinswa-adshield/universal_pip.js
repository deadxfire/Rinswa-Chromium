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

    // Recursively collect all video elements, including those inside Shadow DOM
    function getAllVideos(root = document) {
        let vids = [];
        try {
            vids = Array.from(root.querySelectorAll('video'));
            const allElements = root.querySelectorAll('*');
            for (const el of allElements) {
                if (el.shadowRoot) {
                    vids = vids.concat(getAllVideos(el.shadowRoot));
                }
            }
        } catch (_) {}
        return vids;
    }

    function unblockPiP(video) {
        if (!video) return;
        if (video.hasAttribute('disablePictureInPicture')) {
            video.removeAttribute('disablePictureInPicture');
        }
        video.disablePictureInPicture = false;
    }

    // Toggle Picture-in-Picture for a video
    async function togglePiP(video) {
        if (!video) return;
        unblockPiP(video);
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

    // Global floating PiP button that positions over the active hovered video
    let floatingPiPBtn = null;
    let currentHoveredVideo = null;
    let hideTimer = null;

    function getOrCreateFloatingButton() {
        if (floatingPiPBtn && document.documentElement.contains(floatingPiPBtn)) {
            return floatingPiPBtn;
        }
        floatingPiPBtn = document.createElement('div');
        floatingPiPBtn.className = 'rinswa-pip-overlay-btn';
        floatingPiPBtn.innerHTML = `${PIP_SVG_HTML}<span>Pop Out</span>`;
        floatingPiPBtn.title = 'Rinswa Video Popout / Picture-in-Picture (Alt+P)';

        floatingPiPBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (currentHoveredVideo) {
                togglePiP(currentHoveredVideo);
            }
        });

        floatingPiPBtn.addEventListener('mouseenter', () => {
            clearTimeout(hideTimer);
            floatingPiPBtn.classList.add('rinswa-visible');
        });

        floatingPiPBtn.addEventListener('mouseleave', () => {
            hideTimer = setTimeout(() => {
                if (floatingPiPBtn) floatingPiPBtn.classList.remove('rinswa-visible');
            }, 600);
        });

        (document.body || document.documentElement).appendChild(floatingPiPBtn);
        return floatingPiPBtn;
    }

    // Track mouse over videos across document
    document.addEventListener('mousemove', (e) => {
        if (document.fullscreenElement) {
            if (floatingPiPBtn) floatingPiPBtn.classList.remove('rinswa-visible');
            return;
        }

        const videos = getAllVideos(document);
        let matchedVideo = null;

        for (const v of videos) {
            const rect = v.getBoundingClientRect();
            // Visible video on screen
            if (rect.width >= 140 && rect.height >= 80) {
                if (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    matchedVideo = v;
                    break;
                }
            }
        }

        if (matchedVideo) {
            unblockPiP(matchedVideo);
            currentHoveredVideo = matchedVideo;
            const btn = getOrCreateFloatingButton();
            const vRect = matchedVideo.getBoundingClientRect();
            btn.style.top = `${Math.max(12, vRect.top + 14)}px`;
            btn.style.left = `${Math.max(12, vRect.right - 120)}px`;
            btn.classList.add('rinswa-visible');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                btn.classList.remove('rinswa-visible');
            }, 3500);
        }
    }, { passive: true });

    // Dedicated YouTube Player Control Bar Integration
    function injectYouTubeNativeButton() {
        if (!location.hostname.includes('youtube.com')) return;
        const rightControls = document.querySelector('.ytp-right-controls');
        if (!rightControls || rightControls.querySelector('.rinswa-ytp-pip-btn')) return;

        const ytBtn = document.createElement('button');
        ytBtn.className = 'ytp-button rinswa-ytp-pip-btn';
        ytBtn.title = 'Picture-in-Picture (Alt+P)';
        ytBtn.setAttribute('aria-label', 'Picture-in-Picture (Alt+P)');
        ytBtn.innerHTML = PIP_SVG_HTML;

        ytBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mainVideo = document.querySelector('video.html5-main-video') || document.querySelector('video');
            if (mainVideo) {
                togglePiP(mainVideo);
            }
        });

        const sizeBtn = rightControls.querySelector('.ytp-size-button');
        const fullscreenBtn = rightControls.querySelector('.ytp-fullscreen-button');
        if (sizeBtn) {
            rightControls.insertBefore(ytBtn, sizeBtn);
        } else if (fullscreenBtn) {
            rightControls.insertBefore(ytBtn, fullscreenBtn);
        } else {
            rightControls.appendChild(ytBtn);
        }
    }

    // Dynamic scanner
    setInterval(injectYouTubeNativeButton, 800);
    window.addEventListener('yt-navigate-finish', injectYouTubeNativeButton);

    // Universal Shortcut: Alt + P
    window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            const videos = getAllVideos(document);
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
            const playingVideo = getAllVideos(document).find(v => !v.paused && !v.ended && v.readyState > 2);
            if (playingVideo && !document.pictureInPictureElement) {
                togglePiP(playingVideo);
            }
        }
    });

})();
