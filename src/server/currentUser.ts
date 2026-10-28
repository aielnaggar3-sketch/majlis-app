import { cookies } from "next/headers";
import { getStore, type UserRecord } from "./store";

const COOKIE = "majlis_uid";

/**
 * Development identity: an anonymous user keyed by a cookie. Replaced by the auth
 * provider (email OTP, Apple, Google) in the accounts milestone.
 */
export async function getCurrentUser(): Promise<UserRecord> {
  const jar = await cookies();
  const store = getStore();
  const id = jar.get(COOKIE)?.value;
  const existing = id ? await store.getUser(id) : undefined;
  if (existing) return existing;
  const user = await store.createUser({});
  jar.set(COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return user;
}
