import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { SessionRoom } from "@/components/SessionRoom";
import { CHARACTERS, VENUES } from "@/domain/catalog";
import { publicCharacter } from "@/server/public";

export default function SessionPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  setRequestLocale(locale);
  const venues = VENUES.map(({ id, name, art, palette }) => ({ id, name, art, palette }));
  return <SessionRoom id={id} characters={CHARACTERS.map(publicCharacter)} venues={venues} />;
}
