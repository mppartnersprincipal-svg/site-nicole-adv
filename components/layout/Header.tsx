"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoHeader } from "@/components/brand/LogoHeader";
import { AreaIcon } from "@/components/icons/AreaIcon";
import { IconeFechar, IconeMenu, IconeSetaDiagonal, IconeWhatsApp } from "@/components/icons/Icones";
import { AREAS_NAV, MENU_PRINCIPAL, rotaArea } from "@/lib/nav";
import { MENSAGEM_WHATSAPP_PADRAO, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const WHATSAPP_URL = `https://wa.me/${SITE.whatsapp.numero}?text=${encodeURIComponent(MENSAGEM_WHATSAPP_PADRAO)}`;
const LIMIAR_SCROLL = 24;

export function Header() {
  const pathname = usePathname();
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [submenuAberto, setSubmenuAberto] = useState(false);
  const botaoMenuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > LIMIAR_SCROLL);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha menus ao trocar de rota
  useEffect(() => {
    setMenuAberto(false);
    setSubmenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = menuAberto ? "hidden" : "";
    if (!menuAberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuAberto(false);
        botaoMenuRef.current?.focus();
      }
    };
    // Ao ampliar a janela até o desktop o menu móvel some (lg:hidden): destrava o scroll da página
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuAberto(false);
    };
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [menuAberto]);

  // Destrava o scroll se o Header desmontar com o menu aberto
  useEffect(
    () => () => {
      document.documentElement.style.overflow = "";
    },
    [],
  );

  // Sobre o hero escuro da home (topo da página), o header usa texto claro para manter contraste
  const claro = pathname === "/" && !rolou && !menuAberto;

  // Links com âncora (ex.: "Equipe" → /quem-somos#socios) não disputam o estado ativo com a página-mãe
  const ativo = (href: string) => !href.includes("#") && (pathname === href || (href !== "/" && pathname.startsWith(href)));

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[var(--header-h)] transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-elegante",
        rolou || menuAberto
          ? "bg-marfim/92 shadow-[0_1px_0_0_var(--cor-pedra)] backdrop-blur-md"
          : "bg-marfim/0",
        claro && "header-claro",
      )}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-bordo-700 focus:px-4 focus:py-2 focus:text-marfim"
      >
        Pular para o conteúdo
      </a>
      <div className="container-site flex h-full items-center justify-between gap-6">
        <Link href="/" className={cn("transition-colors duration-500", claro ? "text-marfim" : "text-bordo-700")} data-track-nav="logo">
          <LogoHeader />
          <span className="sr-only"> — página inicial</span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {MENU_PRINCIPAL.map((item) =>
              "temSubmenu" in item ? (
                <li
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setSubmenuAberto(true)}
                  onMouseLeave={() => setSubmenuAberto(false)}
                  onBlur={(e) => {
                    // Foco saiu do item (trigger + mega menu): fecha, inclusive com Shift+Tab a partir do trigger
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSubmenuAberto(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSubmenuAberto(false);
                  }}
                >
                  <Link
                    href={item.href}
                    className={cn("nav-link", ativo(item.href) && "nav-link-ativo")}
                    aria-haspopup="true"
                    aria-expanded={submenuAberto}
                    onFocus={() => setSubmenuAberto(true)}
                    data-track-nav={item.label}
                  >
                    {item.label}
                  </Link>
                  <MegaMenu aberto={submenuAberto} onFechar={() => setSubmenuAberto(false)} />
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn("nav-link", ativo(item.href) && "nav-link-ativo")}
                    data-track-nav={item.label}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track-location="header"
            className={cn(
              "hidden items-center gap-2 rounded-full px-6 py-3 text-[0.75rem] font-medium uppercase tracking-[0.16em] transition-colors duration-300 sm:inline-flex",
              claro ? "bg-marfim text-bordo-800 hover:bg-white" : "bg-bordo-700 text-marfim hover:bg-bordo-800",
            )}
          >
            <IconeWhatsApp className="size-4" />
            Agendar conversa
          </a>
          <button
            ref={botaoMenuRef}
            type="button"
            className={cn("inline-flex size-12 items-center justify-center transition-colors lg:hidden", claro ? "text-marfim" : "text-bordo-700")}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            onClick={() => setMenuAberto((v) => !v)}
          >
            {menuAberto ? <IconeFechar className="size-6" /> : <IconeMenu className="size-6" />}
          </button>
        </div>
      </div>

    </header>
    {/* Fora do <header>: o backdrop-blur dele cria um containing block e colapsaria este "fixed" para altura 0 */}
    <MenuMobile aberto={menuAberto} onNavegar={() => setMenuAberto(false)} />
    </>
  );
}

function MegaMenu({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const grupos = [
    { titulo: "Para empresas e patrimônios", itens: AREAS_NAV.filter((a) => a.publico === "empresas") },
    { titulo: "Para pessoas e famílias", itens: AREAS_NAV.filter((a) => a.publico === "pessoas") },
  ];
  return (
    <div
      className={cn(
        "absolute left-1/2 top-full w-[min(760px,90vw)] -translate-x-1/2 pt-5 transition-[opacity,transform,visibility] duration-300 ease-elegante",
        aberto ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
      )}
      onKeyDown={(e) => e.key === "Escape" && onFechar()}
    >
      <div className="grid grid-cols-[1.15fr_1fr] gap-10 border border-pedra bg-marfim p-8 shadow-[0_30px_60px_-30px_rgba(43,1,2,0.35)]">
        {grupos.map((g) => (
          <div key={g.titulo}>
            <p className="eyebrow mb-4 text-champanhe-700">{g.titulo}</p>
            <ul className="space-y-1">
              {g.itens.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={rotaArea(a.slug)}
                    className="group/item flex items-center gap-3 py-1.5 text-[0.95rem] text-grafite transition-colors hover:text-bordo-700"
                    data-track-nav={`area:${a.slug}`}
                    onBlur={(e) => {
                      if (!e.currentTarget.closest("div")?.parentElement?.contains(e.relatedTarget as Node)) onFechar();
                    }}
                  >
                    <AreaIcon nome={a.icone} className="size-5 shrink-0 text-bordo-700/70 transition-colors group-hover/item:text-bordo-700" />
                    <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-elegante group-hover/item:bg-[length:100%_1px]">
                      {a.nome}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuMobile({ aberto, onNavegar }: { aberto: boolean; onNavegar: () => void }) {
  return (
    <div
      id="menu-mobile"
      className={cn(
        "fixed inset-x-0 bottom-0 top-[var(--header-h)] z-[45] overflow-y-auto overscroll-contain bg-marfim transition-[opacity,transform,visibility] duration-500 ease-elegante lg:hidden",
        aberto ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0",
      )}
      aria-hidden={!aberto}
      inert={!aberto}
      data-lenis-prevent
    >
      <nav aria-label="Menu móvel" className="container-site flex min-h-full flex-col pb-10 pt-6">
        <ul className="divide-y divide-pedra border-y border-pedra">
          {MENU_PRINCIPAL.filter((i) => !("temSubmenu" in i)).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between py-4 font-display text-[1.65rem] text-bordo-700"
                onClick={onNavegar}
                data-track-nav={item.label}
              >
                {item.label}
                <IconeSetaDiagonal className="size-5 text-champanhe-700" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="eyebrow mb-3 mt-8 text-champanhe-700">Áreas de atuação</p>
        <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          {AREAS_NAV.map((a) => (
            <li key={a.slug}>
              <Link
                href={rotaArea(a.slug)}
                className="flex items-center gap-3 py-2.5 text-grafite"
                onClick={onNavegar}
                data-track-nav={`area:${a.slug}`}
              >
                <AreaIcon nome={a.icone} className="size-5 shrink-0 text-bordo-700" />
                {a.nome}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-8">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track-location="menu-mobile"
            className="flex min-h-14 items-center justify-center gap-3 rounded-full bg-bordo-700 text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-marfim"
          >
            <IconeWhatsApp className="size-5" />
            Agendar uma conversa
          </a>
          <a
            href={`tel:${SITE.telefone.e164}`}
            className="mt-3 flex min-h-12 items-center justify-center text-sm text-cinza"
          >
            ou ligue {SITE.telefone.exibicao}
          </a>
        </div>
      </nav>
    </div>
  );
}
