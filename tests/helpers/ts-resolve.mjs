// Hook de resolução para os testes: os módulos de lib/ importam uns aos outros
// sem extensão ("./tracking"), como o Next/TS (moduleResolution: bundler) exige.
// O Node com --experimental-strip-types precisa da extensão — este hook adiciona
// ".ts" e resolve o alias "@/". Importe este arquivo ANTES de `await import(...)`.
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

registerHooks({
  resolve(specifier, context, nextResolve) {
    let alvo = specifier;
    if (alvo.startsWith("@/")) alvo = pathToFileURL(path.join(RAIZ, alvo.slice(2))).href;
    const relativo = alvo.startsWith("./") || alvo.startsWith("../");
    const ehArquivo = alvo.startsWith("file:");
    if ((relativo || ehArquivo) && !path.extname(alvo)) {
      const base = ehArquivo ? fileURLToPath(alvo) : fileURLToPath(new URL(alvo, context.parentURL));
      for (const ext of [".ts", ".tsx", "/index.ts"]) {
        if (existsSync(base + ext)) return nextResolve(pathToFileURL(base + ext).href, context);
      }
    }
    return nextResolve(alvo, context);
  },
});
