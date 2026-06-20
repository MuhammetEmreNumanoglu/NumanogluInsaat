/**
 * audio-manager.js
 * Sayfa geçişlerinde müziği kesintisiz oynatır.
 * SessionStorage kullanarak çalma zamanını korur.
 */
(function () {
  var STORAGE_KEY = 'bgAudioTime';
  var STORAGE_PLAYING = 'bgAudioPlaying';
  var AUDIO_SRC = 'Numanoğlu.mp3';

  var audio = new Audio(AUDIO_SRC);
  audio.loop = true;
  audio.volume = 0.05; // %5 ses

  // Bir önceki sayfadan kalan zaman bilgisini al
  var savedTime = parseFloat(sessionStorage.getItem(STORAGE_KEY) || '0');
  var wasPlaying = sessionStorage.getItem(STORAGE_PLAYING) !== 'false'; // İlk açılışta true

  if (savedTime > 0) {
    audio.currentTime = savedTime;
  }

  // Sayfadan ayrılmadan önce çalma zamanını kaydet
  window.addEventListener('beforeunload', function () {
    sessionStorage.setItem(STORAGE_KEY, audio.currentTime);
    sessionStorage.setItem(STORAGE_PLAYING, (!audio.paused).toString());
  });

  // Periyodik olarak zamanı güncelle (sayfanın çökmesine karşı önlem)
  setInterval(function () {
    if (!audio.paused) {
      sessionStorage.setItem(STORAGE_KEY, audio.currentTime);
    }
  }, 1000);

  // Sesi başlat – tarayıcılar kullanıcı etkileşimi olmadan otomatik sesi engeller.
  // İlk kullanıcı etkileşiminde başlatmayı dene.
  function tryPlay() {
    if (wasPlaying) {
      audio.play().catch(function () {
        // Otomatik oynatma engellendiyse herhangi bir etkileşimi bekle
        document.addEventListener('click', function startOnClick() {
          audio.play();
          document.removeEventListener('click', startOnClick);
        }, { once: true });
        document.addEventListener('keydown', function startOnKey() {
          audio.play();
          document.removeEventListener('keydown', startOnKey);
        }, { once: true });
        document.addEventListener('touchstart', function startOnTouch() {
          audio.play();
          document.removeEventListener('touchstart', startOnTouch);
        }, { once: true });
      });
    }
  }

  // DOM yüklenince başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryPlay);
  } else {
    tryPlay();
  }
})();
