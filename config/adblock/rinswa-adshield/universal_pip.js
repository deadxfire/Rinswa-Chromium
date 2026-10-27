/**
 * Rinswa Browser - Universal Native Video Popout (Picture-in-Picture) & Video Downloader Engine
 * Developed and made by Arindam Makar for Rinswa Chromium
 *
 * Provides native floating Picture-in-Picture & One-Click Video Download:
 * 1. Cyber-Glass transparent hover button on any HTML5 video (Pop Out & Download).
 * 2. Dedicated native icons inside YouTube's player control bar (.ytp-right-controls).
 * 3. Dynamic injection into YouTube's player context menu (.ytp-contextmenu) so "Download Video" is always accessible.
 * 4. Universal keyboard shortcuts: Alt + P (PiP), Alt + D (Download Video).
 * 5. Auto-PiP on tab backgrounding when playing.
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

    // High-resolution Download SVG icon
    const DOWNLOAD_SVG_HTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
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

    let toastTimeout = null;
    function showDownloadToast(text, isProcessing = false) {
        let toast = document.getElementById('rinswa-pip-toast-el');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'rinswa-pip-toast-el';
            toast.className = 'rinswa-pip-toast';
            (document.body || document.documentElement).appendChild(toast);
        }

        const iconHtml = isProcessing ?
            `<div class="rinswa-toast-spinner"></div>` :
            `<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
            </svg>`;

        toast.innerHTML = `
            ${iconHtml}
            <span class="rinswa-toast-text">${text}</span>
        `;

        clearTimeout(toastTimeout);
        void toast.offsetWidth;
        toast.classList.add('rinswa-toast-show');
        toastTimeout = setTimeout(() => {
            if (toast) toast.classList.remove('rinswa-toast-show');
        }, isProcessing ? 6000 : 4000);
    }

    // Trigger Video Download via Rinswa Browser Engine
    function triggerDownload(video) {
        let targetUrl = location.href;
        if (video) {
            const anchor = video.closest('a') ||
                           video.parentElement?.closest('a') ||
                           video.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-reel-video-renderer')?.querySelector('a#thumbnail, a[href*="watch"], a[href*="/shorts/"]');
            if (anchor && anchor.href && (anchor.href.includes('/watch') || anchor.href.includes('/shorts/'))) {
                targetUrl = anchor.href;
            } else if (video.currentSrc && video.currentSrc.startsWith('http') && !video.currentSrc.includes('blob:')) {
                targetUrl = video.currentSrc;
            } else if (video.src && video.src.startsWith('http') && !video.src.includes('blob:')) {
                targetUrl = video.src;
            }
        }

        showDownloadToast('Downloading video in background... Check Downloads folder', true);

        // Trigger native protocol handler via anchor click with user gesture
        try {
            const a = document.createElement('a');
            a.href = 'rinswa-download:' + encodeURIComponent(targetUrl);
            a.style.display = 'none';
            (document.body || document.documentElement).appendChild(a);
            a.click();
            setTimeout(() => a.remove(), 1000);
        } catch (e) {
            console.debug('[Rinswa Download] Protocol trigger notice:', e);
        }
    }


    // Global floating button that positions over the active hovered video
    let floatingPiPBtn = null;
    let currentHoveredVideo = null;
    let hideTimer = null;

    function getOrCreateFloatingButton() {
        if (floatingPiPBtn && document.documentElement.contains(floatingPiPBtn)) {
            return floatingPiPBtn;
        }
        floatingPiPBtn = document.createElement('div');
        floatingPiPBtn.className = 'rinswa-pip-overlay-btn';
        floatingPiPBtn.innerHTML = `
            <button class="rinswa-action-btn rinswa-pip-action" title="Pop Out Video (Alt+P)" aria-label="Pop Out Video">
                ${PIP_SVG_HTML}
            </button>
            <span class="rinswa-divider"></span>
            <button class="rinswa-action-btn rinswa-download-action" title="Download Video (Alt+D)" aria-label="Download Video">
                ${DOWNLOAD_SVG_HTML}
            </button>
        `;

        const pipBtn = floatingPiPBtn.querySelector('.rinswa-pip-action');
        const dlBtn = floatingPiPBtn.querySelector('.rinswa-download-action');

        if (pipBtn) {
            pipBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (currentHoveredVideo) {
                    togglePiP(currentHoveredVideo);
                }
            });
        }

        if (dlBtn) {
            dlBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                triggerDownload(currentHoveredVideo);
            });
        }

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

    function updateButtonPosition(video) {
        if (!video || !floatingPiPBtn) return;
        const vRect = video.getBoundingClientRect();
        if (vRect.width < 120 || vRect.height < 60 ||
            vRect.bottom < 0 || vRect.top > window.innerHeight ||
            vRect.right < 0 || vRect.left > window.innerWidth) {
            floatingPiPBtn.classList.remove('rinswa-visible');
            return;
        }

        const topY = Math.max(12, Math.min(window.innerHeight - 44, vRect.top + 12));
        const targetRight = Math.max(70, Math.min(window.innerWidth - 12, vRect.right - 12));

        floatingPiPBtn.style.top = `${topY}px`;
        floatingPiPBtn.style.left = `${targetRight}px`;
    }

    // Track mouse over videos across document
    document.addEventListener('mousemove', (e) => {
        if (document.fullscreenElement) {
            if (floatingPiPBtn) floatingPiPBtn.classList.remove('rinswa-visible');
            return;
        }

        if (e.target && floatingPiPBtn && (e.target === floatingPiPBtn || floatingPiPBtn.contains(e.target))) {
            clearTimeout(hideTimer);
            return;
        }

        const videos = getAllVideos(document);
        let matchedVideo = null;

        for (const v of videos) {
            const rect = v.getBoundingClientRect();
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
            updateButtonPosition(matchedVideo);
            btn.classList.add('rinswa-visible');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                btn.classList.remove('rinswa-visible');
            }, 3500);
        } else if (floatingPiPBtn && floatingPiPBtn.classList.contains('rinswa-visible')) {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                if (floatingPiPBtn) floatingPiPBtn.classList.remove('rinswa-visible');
            }, 800);
        }
    }, { passive: true });

    // Sync button position when page scrolls or resizes
    window.addEventListener('scroll', () => {
        if (currentHoveredVideo) updateButtonPosition(currentHoveredVideo);
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (currentHoveredVideo) updateButtonPosition(currentHoveredVideo);
    }, { passive: true });

    // Dedicated YouTube Player Control Bar & Context Menu Integration
    function injectYouTubeNativeButtons() {
        if (!location.hostname.includes('youtube.com')) return;
        const rightControls = document.querySelector('.ytp-right-controls');
        if (!rightControls) return;

        // 1. YouTube Control Bar PiP Button
        if (!rightControls.querySelector('.rinswa-ytp-pip-btn')) {
            const ytBtn = document.createElement('button');
            ytBtn.className = 'ytp-button rinswa-ytp-pip-btn';
            ytBtn.title = 'Picture-in-Picture (Alt+P)';
            ytBtn.setAttribute('aria-label', 'Picture-in-Picture (Alt+P)');
            ytBtn.innerHTML = PIP_SVG_HTML;

            ytBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const mainVideo = document.querySelector('video.html5-main-video') || document.querySelector('video');
                if (mainVideo) togglePiP(mainVideo);
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

        // 2. YouTube Control Bar Download Button
        if (!rightControls.querySelector('.rinswa-ytp-download-btn')) {
            const ytDlBtn = document.createElement('button');
            ytDlBtn.className = 'ytp-button rinswa-ytp-download-btn';
            ytDlBtn.title = 'Download Video (Alt+D)';
            ytDlBtn.setAttribute('aria-label', 'Download Video (Alt+D)');
            ytDlBtn.innerHTML = DOWNLOAD_SVG_HTML;

            ytDlBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const mainVideo = document.querySelector('video.html5-main-video') || document.querySelector('video');
                triggerDownload(mainVideo);
            });

            const pipBtn = rightControls.querySelector('.rinswa-ytp-pip-btn');
            if (pipBtn) {
                rightControls.insertBefore(ytDlBtn, pipBtn);
            } else {
                rightControls.appendChild(ytDlBtn);
            }
        }
    }

    // Dynamic injection into YouTube's own player context menu (.ytp-contextmenu)
    function injectYouTubeContextMenuDownload() {
        if (!location.hostname.includes('youtube.com')) return;
        const panelMenu = document.querySelector('.ytp-contextmenu .ytp-panel-menu');
        if (!panelMenu || panelMenu.querySelector('.rinswa-ytp-download-item')) return;

        const menuItem = document.createElement('div');
        menuItem.className = 'ytp-menuitem rinswa-ytp-download-item';
        menuItem.setAttribute('role', 'menuitem');
        menuItem.setAttribute('tabindex', '0');
        menuItem.innerHTML = `
            <div class="ytp-menuitem-icon" style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;margin-right:12px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="18" height="18" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
            </div>
            <div class="ytp-menuitem-label" style="font-weight:500;">Download Video (Rinswa)</div>
        `;

        menuItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const popup = document.querySelector('.ytp-contextmenu');
            if (popup) popup.style.display = 'none';
            const mainVideo = document.querySelector('video.html5-main-video') || document.querySelector('video');
            triggerDownload(mainVideo);
        });

        // Insert at the top of the context menu
        panelMenu.insertBefore(menuItem, panelMenu.firstChild);
    }

    // Dynamic scanner
    setInterval(() => {
        injectYouTubeNativeButtons();
        injectYouTubeContextMenuDownload();
    }, 700);

    window.addEventListener('yt-navigate-finish', () => {
        injectYouTubeNativeButtons();
        injectYouTubeContextMenuDownload();
    });

    // Universal Shortcuts: Alt + P (PiP), Alt + D (Download)
    window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            const videos = getAllVideos(document);
            const playing = videos.find(v => !v.paused && !v.ended && v.readyState > 2);
            const target = playing || videos[0];
            if (target) togglePiP(target);
        } else if (e.altKey && (e.key === 'd' || e.key === 'D')) {
            e.preventDefault();
            const videos = getAllVideos(document);
            const playing = videos.find(v => !v.paused && !v.ended && v.readyState > 2);
            triggerDownload(playing || videos[0]);
        }
    }, true);

})();
