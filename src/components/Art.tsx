import { avatarSvg, sceneSvg } from "./art";
import type { AvatarLook, Venue } from "@/domain/types";

// The SVG strings are built only from static catalogue values, never from user input.

export function Avatar({ look, size, ring }: { look: AvatarLook; size: number; ring?: string }) {
  return <span style={{ display: "inline-flex", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: avatarSvg(look, size, { ring }) }} />;
}

export function Scene({ venue }: { venue: Pick<Venue, "id" | "art" | "palette"> }) {
  return <span style={{ position: "absolute", inset: 0 }} dangerouslySetInnerHTML={{ __html: sceneSvg(venue) }} />;
}
