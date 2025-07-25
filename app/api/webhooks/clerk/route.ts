import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const payload: WebhookEvent = await request.json();

  if (!payload || !payload.type) {
    return new Response("Invalid payload", { status: 400 });
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  }

  if (payload.type === "user.created") {
    try {
      const newUser: User = {
        id: payload.data.id,
        email: payload.data.email_addresses[0].email_address || "",
        firstName: payload.data.first_name || "",
        lastName: payload.data.last_name || "",
        avatar: payload.data.image_url || null,
      };

      const user = await db.insert(users).values(newUser);

      return new Response(JSON.stringify(user), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error inserting user:", error);
      return new Response("Error inserting user", { status: 500 });
    }
  }

  return new Response("Webhook event not handled", {
    status: 200,
  });
}
