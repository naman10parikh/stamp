// User admin endpoint: create and list users.
import { log } from "../../../lib/logger";

interface User {
  id: string;
  email: string;
  role: string;
}

const users: User[] = [];

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as { email: string; role: string };
  const user: User = { id: crypto.randomUUID(), email: body.email, role: body.role };
  users.push(user);
  log("info", `created user ${user.id}`);
  return Response.json(user, { status: 201 });
}

export async function GET(): Promise<Response> {
  return Response.json(users);
}
