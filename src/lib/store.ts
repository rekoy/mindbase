// Local JSON file standing in for the database until the real backend exists.
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Draft, Project } from "@/lib/types";

const FILE = path.join(process.cwd(), ".data", "db.json");

export type UserData = { project?: Project; drafts: Draft[] };
type DB = { users: Record<string, UserData> };

async function readDb(): Promise<DB> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
  } catch {
    return { users: {} };
  }
}

export async function getUserData(email: string): Promise<UserData> {
  const db = await readDb();
  return db.users[email] ?? { drafts: [] };
}

export async function updateUserData(email: string, update: (data: UserData) => UserData) {
  const db = await readDb();
  db.users[email] = update(db.users[email] ?? { drafts: [] });
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2));
  return db.users[email];
}
