/* Gestor de consentimento de cookies com Google Analytics.
 *
 * Substituir "G-XXXXXXXXXX" pelo ID de medição do Google Analytics 4 deste site (começa por "G-").
 * Enquanto o ID for o de exemplo, o site não mostra faixa nem carrega o Analytics.
 * O Analytics só é carregado depois de a pessoa aceitar. Recusar é tão fácil como aceitar.
 */
(function () {
  var CONFIG = { ativo: true, analytics: "G-XXXXXXXXXX" };
  if (!CONFIG.ativo || !/^G-[A-Z0-9]{6,}$/.test(CONFIG.analytics) || /^G-X+$/.test(CONFIG.analytics)) return;

  var KEY = "cookies-escolha", MESES = 6;
  var area = document.getElementById("cookies-set"), abrir = document.getElementById("abrir-cookies");
  if (area) area.hidden = false;

  function ler() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!v || (Date.now() - v.t) > MESES * 30 * 24 * 3600 * 1000) return null;
      return v;
    } catch (e) { return null; }
  }
  function guardar(stats) {
    try { localStorage.setItem(KEY, JSON.stringify({ stats: !!stats, t: Date.now() })); } catch (e) {}
    aplicar(!!stats);
  }
  function aplicar(stats) {
    if (!stats || !CONFIG.analytics || window.__gaCarregado) return;
    window.__gaCarregado = true;
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.analytics);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", CONFIG.analytics, { allow_google_signals: false, allow_ad_personalization_signals: false });
  }

  var banner;
  function fechar() { if (banner) { banner.remove(); banner = null; } }
  function mostrar(painel) {
    fechar();
    banner = document.createElement("div");
    banner.className = "cookie-banner"; banner.setAttribute("role", "dialog"); banner.setAttribute("aria-labelledby", "ck-t");
    var atual = ler();
    banner.innerHTML =
      '<div class="cookie-in"><h2 id="ck-t">Cookies</h2>' +
      '<p>Usamos cookies de estatística para perceber como o site é usado. Só os ativamos se aceitar. ' +
      'Pode saber mais na <a href="cookies.html">Política de Cookies</a> e na <a href="privacidade.html">Política de Privacidade</a>.</p>' +
      (painel ? '<label class="ck-op"><input type="checkbox" id="ck-stats"' + (atual && atual.stats ? " checked" : "") + '> Estatísticas (medem as visitas ao site)</label>' +
        '<div class="ck-btns"><button type="button" class="btn btn-navy" id="ck-guardar">Guardar escolha</button></div>'
      : '<div class="ck-btns"><button type="button" class="btn btn-navy" id="ck-sim">Aceitar</button>' +
        '<button type="button" class="btn btn-navy" id="ck-nao">Rejeitar</button>' +
        '<button type="button" class="link-btn" id="ck-conf">Configurar</button></div>') +
      '</div>';
    document.body.appendChild(banner);
    var $ = function (id) { return document.getElementById(id); };
    if ($("ck-sim")) $("ck-sim").onclick = function () { guardar(true); fechar(); };
    if ($("ck-nao")) $("ck-nao").onclick = function () { guardar(false); fechar(); };
    if ($("ck-conf")) $("ck-conf").onclick = function () { mostrar(true); };
    if ($("ck-guardar")) $("ck-guardar").onclick = function () { guardar($("ck-stats").checked); fechar(); };
    var primeiro = banner.querySelector("button, input"); if (primeiro) primeiro.focus();
  }

  var escolha = ler();
  if (escolha) aplicar(escolha.stats); else mostrar(false);
  if (abrir) abrir.addEventListener("click", function () { mostrar(true); });
})();
