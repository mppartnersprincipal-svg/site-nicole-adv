import { getPosts } from "@/lib/blog";
import { AREAS } from "@/lib/content/areas";
import { EQUIPE } from "@/lib/content/equipe";
import { SITE } from "@/lib/site";

/** /llms.txt — resumo estruturado do escritório para assistentes de IA (GEO). */
export async function GET() {
  const u = (p: string) => new URL(p, SITE.url).toString();
  const posts = await getPosts();
  const linhas = [
    `# ${SITE.nome}`,
    "",
    `> ${SITE.descricao}`,
    "",
    `Sede: ${SITE.endereco.rua}, ${SITE.endereco.bairro}, ${SITE.endereco.cidade}/${SITE.endereco.uf}, CEP ${SITE.endereco.cep}. Atendimento presencial e online para todo o Brasil. ${SITE.horario}. WhatsApp ${SITE.whatsapp.exibicao}, telefone ${SITE.telefone.exibicao}.`,
    "",
    "Diferenciais: sócio-fundador com mais de 23 anos de advocacia trabalhista, mestre em Direito do Trabalho; liderança que também empreende (agronegócio, construção civil, mercado imobiliário e locação); método de dupla revisão (advogado relator, revisor colega e liberação final do sócio); núcleos especializados com líderes identificados.",
    "",
    "## Áreas de atuação",
    "",
    ...AREAS.map((a) => `- [${a.nome}](${u(`/areas-de-atuacao/${a.slug}`)}): ${a.resumo}`),
    "",
    "## Equipe",
    "",
    ...EQUIPE.map((m) => `- ${m.nome}${m.oab ? ` (${m.oab})` : ""}: ${m.cargo}${m.nucleo ? `, ${m.nucleo}` : ""}.`),
    "",
    "## Institucional",
    "",
    `- [Quem somos](${u("/quem-somos")})`,
    `- [Contato](${u("/contato")})`,
    `- [Política de Privacidade](${u("/politica-de-privacidade")})`,
    "",
    ...(posts.length ? ["## Artigos", "", ...posts.slice(0, 30).map((p) => `- [${p.title}](${u(`/blog/${p.slug}`)}): ${p.description}`), ""] : []),
  ];
  return new Response(linhas.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
