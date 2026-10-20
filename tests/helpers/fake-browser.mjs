// Navegador mínimo para testar lib/tracking.ts e lib/whatsapp.ts no Node.
// Instala `window` e `document` globais; chame `teardown()` no fim do teste.

export function fakeBrowser({ url = "https://nicoliadvogados.adv.br/", referrer = "", cookie = "", gtm = false } = {}) {
  const u = new URL(url);
  const storage = new Map();
  let jar = cookie;
  const abertos = [];
  const dataLayer = [];
  if (gtm) {
    // Simula o GTM chamando eventCallback assim que o evento é processado
    const pushOriginal = dataLayer.push.bind(dataLayer);
    dataLayer.push = (...itens) => {
      const r = pushOriginal(...itens);
      for (const item of itens) {
        if (item && typeof item.eventCallback === "function") item.eventCallback("GTM-TESTE");
      }
      return r;
    };
  }

  const doc = {
    title: "Direito Trabalhista | Nicoli Advogados",
    referrer,
    visibilityState: "visible",
    get cookie() {
      return jar;
    },
    set cookie(valor) {
      const par = String(valor).split(";")[0];
      const nome = par.split("=")[0];
      const resto = jar ? jar.split("; ").filter((p) => !p.startsWith(nome + "=")) : [];
      resto.push(par);
      jar = resto.join("; ");
    },
  };

  const location = {
    href: u.href,
    pathname: u.pathname,
    search: u.search,
    origin: u.origin,
    hostname: u.hostname,
    protocol: u.protocol,
  };

  const win = {
    location,
    dataLayer,
    crypto: globalThis.crypto,
    localStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
    },
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    dispatchEvent: () => true,
    open: (href, alvo) => {
      abertos.push({ href, alvo });
      return {};
    },
  };

  globalThis.window = win;
  globalThis.document = doc;
  if (typeof globalThis.CustomEvent === "undefined") {
    globalThis.CustomEvent = class CustomEvent {
      constructor(type, init) {
        this.type = type;
        this.detail = init?.detail;
      }
    };
  }

  return {
    window: win,
    document: doc,
    storage,
    abertos,
    get cookie() {
      return jar;
    },
    navegar(novaUrl) {
      const n = new URL(novaUrl, location.href);
      Object.assign(location, { href: n.href, pathname: n.pathname, search: n.search });
    },
    teardown() {
      delete globalThis.window;
      delete globalThis.document;
    },
  };
}

/** Converte entradas `arguments` do dataLayer em arrays (para comparar). */
export function normalizarDataLayer(dl) {
  return dl.map((e) => (e && typeof e === "object" && !Array.isArray(e) && typeof e.length === "number" && !("event" in e) ? Array.from(e) : e));
}

let contador = 0;
/** Importa uma instância NOVA do módulo (estado de módulo zerado). */
export function importarFresco(caminhoRelativoAoTeste, baseUrl) {
  contador += 1;
  return import(new URL(`${caminhoRelativoAoTeste}?t=${contador}`, baseUrl).href);
}
