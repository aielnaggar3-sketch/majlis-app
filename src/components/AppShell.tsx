import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "./Icons";
import { LanguageSwitch } from "./LanguageSwitch";

const NAV = [
  ["home", "/", Icon.home],
  ["explore", "/explore", Icon.explore],
  ["characters", "/characters", Icon.characters],
  ["wallet", "/wallet", Icon.wallet],
] as const;

export function AppShell({ title, current, children }: { title: string; current?: (typeof NAV)[number][0]; children: ReactNode }) {
  const t = useTranslations();
  return (
    <>
      <div className="shell">
        <nav className="rail" aria-label="Main">
          <div className="brand"><div className="mark">م</div><b>{t("app.name")}</b></div>
          {NAV.map(([key, href, I]) => (
            <Link key={key} href={href} className="navbtn" aria-current={current === key ? "page" : undefined}><I />{t(`nav.${key}`)}</Link>
          ))}
        </nav>
        <div className="main">
          <header className="topbar">
            <div className="brand mobile-brand" style={{ padding: 0 }}><div className="mark" style={{ width: 30, height: 30, fontSize: 16 }}>م</div></div>
            <div className="title">{title}</div>
            <LanguageSwitch />
          </header>
          <main className="content">{children}</main>
        </div>
      </div>
      <nav className="tabbar" aria-label="Main" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {NAV.map(([key, href, I]) => (
          <Link key={key} href={href} aria-current={current === key ? "page" : undefined}><I /><span>{t(`nav.${key}`)}</span></Link>
        ))}
      </nav>
    </>
  );
}
