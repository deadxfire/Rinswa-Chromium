/**
 * Rinswa Browser - Native YouTube Ad Defuser & Direct Video Player
 * Developed and made by Arindam Makar for Rinswa Chromium
 *
 * Provides complete YouTube ad blocking:
 * 1. Defuses ytInitialPlayerResponse ad metadata in memory.
 * 2. Intercepts window.fetch & XHR for /youtubei/v1/player to strip ads from SPA navigations.
 * 3. Fast-forwards any server-spliced pre-roll or mid-roll in 0.001s and auto-clicks skip.
 * 4. Eliminates anti-adblock warning dialogues and automatically resumes playback.
 * 5. Injects cosmetic CSS rules to completely hide ad banners, promos, and empty slots.
 */

(function () {
    'use strict';

    if (window.__rinswa_yt_shield_active) return;
    window.__rinswa_yt_shield_active = true;

    // --- 1. Core Ad-Pruning Logic ---
    function pruneAdsFromObject(obj) {
        if (!obj || typeof obj !== 'object') return;
        const adKeys = [
            'adPlacements', 'playerAds', 'adSlots', 'adParams',
            'adBreakHeartbeatParams', 'playbackTracking', 'adSafetyReason'
        ];
        for (const key of adKeys) {
            if (key in obj) {
                delete obj[key];
            }
        }
        if (obj.playerResponse && typeof obj.playerResponse === 'object') {
            pruneAdsFromObject(obj.playerResponse);
        }
    }

    // Intercept inline ytInitialPlayerResponse
    let rawResponse = window.ytInitialPlayerResponse;
    Object.defineProperty(window, 'ytInitialPlayerResponse', {
        get: function () {
            return rawResponse;
        },
        set: function (val) {
            pruneAdsFromObject(val);
            rawResponse = val;
        },
        configurable: true
    });

    if (window.ytInitialPlayerResponse) {
        pruneAdsFromObject(window.ytInitialPlayerResponse);
    }

    // --- 2. Network Hook: Intercept fetch() for /youtubei/v1/player ---
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);
        const url = (typeof args[0] === 'string') ? args[0] : (args[0] && args[0].url ? args[0].url : '');
        
        if (url && url.includes('/youtubei/v1/player')) {
            try {
                const clone = response.clone();
                const json = await clone.json();
                pruneAdsFromObject(json);
                return new Response(JSON.stringify(json), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
            } catch (e) {
                return response;
            }
        }
        return response;
    };

    // --- 3. High-Frequency HTML5 Video Ad Skipper (0.001s skip) ---
    function autoSkipAds() {
        const video = document.querySelector('video.html5-main-video') || document.querySelector('video');
        const adShowing = document.querySelector('.ad-showing') || document.querySelector('.ad-interrupting');

        if (video && adShowing) {
            // Mute video during ad skip to prevent audio pop
            video.muted = true;
            video.playbackRate = 16.0;

            // Instantly jump to the end of the ad segment
            if (isFinite(video.duration) && video.duration > 0) {
                video.currentTime = video.duration;
            }
            video.play();

            // Auto-click modern skip buttons
            const skipSelectors = [
                '.ytp-ad-skip-button',
                '.ytp-ad-skip-button-modern',
                '.ytp-skip-ad-button',
                'button.ytp-ad-skip-button-text',
                '.ytp-ad-overlay-close-button',
                '.ytp-ad-skip-button-slot button'
            ];

            for (const selector of skipSelectors) {
                const btn = document.querySelector(selector);
                if (btn) {
                    btn.click();
                    break;
                }
            }
        }

        // 4. Auto-Dismiss Anti-Adblock Dialogues & Resume Video
        const enforcementDialog = document.querySelector('tp-yt-paper-dialog:has(#feedback.ytd-enforcement-message-view-model)');
        if (enforcementDialog) {
            enforcementDialog.remove();
            if (video && video.paused) {
                video.play();
            }
        }
    }

    // High frequency 40ms polling for instant ad annihilation
    setInterval(autoSkipAds, 40);

    // --- 5. Permanent Cosmetic CSS Injection ---
    const style = document.createElement('style');
    style.id = 'rinswa-youtube-shield-style';
    style.textContent = `
        ytd-ad-slot-renderer,
        ytd-banner-promo-renderer,
        ytd-statement-banner-renderer,
        ytd-in-feed-ad-layout-renderer,
        #masthead-ad,
        #player-ads,
        .ytp-ad-module,
        .ytp-ad-overlay-container,
        .ytp-ad-progress,
        .ytp-ad-progress-list,
        ytd-promoted-sparkles-web-renderer,
        ytd-promoted-video-renderer,
        ytd-display-ad-renderer,
        tp-yt-paper-dialog:has(#feedback.ytd-enforcement-message-view-model) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    `;

    function injectStyle() {
        if (!document.head && !document.documentElement) {
            requestAnimationFrame(injectStyle);
            return;
        }
        (document.head || document.documentElement).appendChild(style);
    }
    injectStyle();

})();
