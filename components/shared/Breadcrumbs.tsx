import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { grafo, schemaBreadcrumb } from "@/lib/schema";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  itens: Array<{ nome: string; path: string }>;
  tom?: "claro" | "escuro";
}

export function Breadcrumbs({ itens, tom = "claro" }: BreadcrumbsProps) {
  const escuro = tom === "escuro";
  const todos = [{ nome: "Início", path: "/" }, ...itens];
  return (
    <>
      <nav aria-label="Você está em" className={cn("text-[0.78rem] tracking-wide", escuro ? "text-marfim/60" : "text-cinza")}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {todos.map((item, i) => {
            const ultimo = i === todos.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-2">
                {ultimo ? (
                  <span aria-current="page" className={escuro ? "text-marfim/90" : "text-grafite"}>
                    {item.nome}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="transition-colors hover:text-bordo-700">
                      {item.nome}
                    </Link>
                    <span aria-hidden="true" className="opacity-50">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={grafo(schemaBreadcrumb(itens))} />
    </>
  );
}
