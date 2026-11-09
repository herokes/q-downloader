// Points the download buttons at the latest GitHub release. Without JavaScript (or if the
// request fails) every button links to the release page, which always works.
(function () {
  var REPO = 'herokes/q-downloader';
  var ua = navigator.userAgent || '';
  var os = /Mac/i.test(ua) && !/iPhone|iPad/i.test(ua) ? 'mac' : /Windows/i.test(ua) ? 'win' : 'other';

  var heroBtn = document.getElementById('hero-dl');
  var heroLabel = document.getElementById('hero-dl-label');
  var heroMeta = document.getElementById('hero-meta');
  var versionLine = document.getElementById('version-line');

  function setHero(href, label) {
    heroBtn.href = href;
    heroLabel.textContent = label;
  }

  if (os === 'win') heroLabel.textContent = 'Download for Windows';
  if (os === 'mac') heroLabel.textContent = 'Download for macOS';
  if (os === 'other') heroMeta.textContent = 'Q Downloader runs on Windows and macOS. Installers are not code-signed yet.';

  var recommended = document.getElementById(os === 'win' ? 'card-win' : os === 'mac' ? 'card-mac' : '');
  if (recommended) {
    recommended.setAttribute('data-rec', '');
    var tag = document.createElement('span');
    tag.className = 'self-start rounded-lg bg-primary-container px-3 py-0.5 text-xs font-medium text-on-primary-container';
    tag.textContent = 'For your computer';
    recommended.insertBefore(tag, recommended.firstChild);
  }

  fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (rel) {
      var assets = rel.assets || [];
      function find(re) {
        for (var i = 0; i < assets.length; i++) if (re.test(assets[i].name)) return assets[i].browser_download_url;
        return null;
      }
      var win = find(/win.*\.exe$/i);
      var arm = find(/mac.*arm64.*\.dmg$/i);
      var x64 = find(/mac.*x64.*\.dmg$/i);
      if (win) document.getElementById('dl-win').href = win;
      if (arm) document.getElementById('dl-mac-arm').href = arm;
      if (x64) document.getElementById('dl-mac-x64').href = x64;
      if (os === 'win' && win) setHero(win, 'Download for Windows');
      if (os === 'mac') {
        var isArm = /arm/i.test(navigator.platform || '') || !x64;
        var pick = isArm ? arm || x64 : x64 || arm;
        if (pick) setHero(pick, 'Download for macOS');
      }
      var v = (rel.tag_name || '').replace(/^v/, '');
      if (v) {
        versionLine.textContent = 'Version ' + v + (rel.published_at ? ', released ' + new Date(rel.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '') + '.';
        heroMeta.textContent = 'Version ' + v + '. Installers are not code-signed yet.';
      }
    })
    .catch(function () { /* keep the release-page links */ });
})();
