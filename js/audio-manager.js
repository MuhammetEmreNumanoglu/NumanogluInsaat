/**
 * audio-manager.js
 * Sayfa geçişlerinde müziği kesintisiz oynatır.
 * SessionStorage kullanarak çalma zamanını korur.
 * Mobil uyumlu: iOS/Android autoplay politikasına tam uyumlu.
 * Kullanıcıya görsel bir "Müziği Başlat" butonu gösterir (mobilde zorunlu).
 */
(function () {
  var STORAGE_KEY = 'bgAudioTime';
  var STORAGE_PLAYING = 'bgAudioPlaying';
  var AUDIO_SRC = 'numanoglu.mp3';

  var audio = new Audio(AUDIO_SRC);
  audio.loop = true;
  audio.volume = 0.05;
  audio.preload = 'auto';

  // Önceki sayfadan kalan zaman bilgisini al
  var savedTime = parseFloat(sessionStorage.getItem(STORAGE_KEY) || '0');
  var wasPlaying = sessionStorage.getItem(STORAGE_PLAYING) !== 'false';

  if (savedTime > 0) {
    audio.currentTime = savedTime;
  }

  /* ── Durum kaydetme ──────────────────────────────────────────────── */

  function saveState() {
    sessionStorage.setItem(STORAGE_KEY, audio.currentTime);
    sessionStorage.setItem(STORAGE_PLAYING, (!audio.paused).toString());
  }

  window.addEventListener('beforeunload', saveState);
  window.addEventListener('pagehide', saveState);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') saveState();
  });

  setInterval(function () {
    if (!audio.paused) {
      sessionStorage.setItem(STORAGE_KEY, audio.currentTime);
    }
  }, 1000);

  /* ── Müzik kontrol butonu (sağ alt köşe) ────────────────────────── */

  var btn = null;

  function createMusicBtn(isMuted) {
    btn = document.createElement('button');
    btn.id = 'music-toggle-btn';
    btn.setAttribute('aria-label', isMuted ? 'Müziği başlat' : 'Müziği durdur');
    btn.innerHTML = isMuted
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';

    btn.style.cssText = [
      'position:fixed',
      'bottom:20px',
      'right:20px',
      'z-index:9999',
      'width:48px',
      'height:48px',
      'border-radius:50%',
      'border:2px solid rgba(204,185,149,0.6)',
      'background:rgba(40,36,36,0.85)',
      'color:#ccb995',
      'cursor:pointer',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'box-shadow:0 2px 12px rgba(0,0,0,0.5)',
      'transition:all 0.3s ease',
      'backdrop-filter:blur(6px)',
      '-webkit-backdrop-filter:blur(6px)',
      'padding:0'
    ].join(';');

    btn.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().then(function () {
          updateBtn(false);
          sessionStorage.setItem(STORAGE_PLAYING, 'true');
        }).catch(function (e) { console.warn('play error:', e); });
      } else {
        audio.pause();
        updateBtn(true);
        sessionStorage.setItem(STORAGE_PLAYING, 'false');
      }
    });

    document.body.appendChild(btn);
  }

  function updateBtn(isMuted) {
    if (!btn) return;
    btn.setAttribute('aria-label', isMuted ? 'Müziği başlat' : 'Müziği durdur');
    btn.innerHTML = isMuted
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
  }

  /* ── Çalma başlatma ──────────────────────────────────────────────── */

  function tryAutoPlay() {
    if (!wasPlaying) {
      // Kullanıcı daha önce durdurduysa başlatma, sadece buton göster
      createMusicBtn(true);
      return;
    }

    audio.play().then(function () {
      // Autoplay başarılı (masaüstü veya daha önce etkileşim yapılmış)
      createMusicBtn(false);
    }).catch(function () {
      // Autoplay engellendi (ilk ziyaret kısıtlaması)
      // Hoparlörü ses açık (isMuted = false) durumunda gösteriyoruz
      createMusicBtn(false);

      var events = ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown'];
      var played = false;

      function onInteract(e) {
        if (played) return;

        // Butonun kendisine tıklanmışsa, genel sayfa etkileşim tetiklemesini pas geç
        if (e && e.target && (e.target.id === 'music-toggle-btn' || e.target.closest('#music-toggle-btn'))) {
          return;
        }

        played = true;
        // Remove all listeners
        events.forEach(function (evt) {
          document.removeEventListener(evt, onInteract, true);
        });

        audio.play().then(function () {
          updateBtn(false);
          sessionStorage.setItem(STORAGE_PLAYING, 'true');
        }).catch(function (err) { console.warn('play after interact:', err); });
      }

      events.forEach(function (e) {
        document.addEventListener(e, onInteract, { once: false, capture: true, passive: true });
      });
    });
  }

  // DOM yüklenince başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAutoPlay);
  } else {
    tryAutoPlay();
  }
})();
