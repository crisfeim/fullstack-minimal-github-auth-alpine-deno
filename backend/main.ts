import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import "https://deno.land/std@0.204.0/dotenv/load.ts";

const CLIENT_ID = Deno.env.get("CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("CLIENT_SECRET")!;
const FRONTEND_URL = "http://localhost:3000";

serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/login") {
    const redirect = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`;
    return Response.redirect(redirect, 302);
  }

  if (url.pathname === "/callback") {
    const code = url.searchParams.get("code");
    if (!code) return new Response("Code not found", { status: 400 });

    // Intercambio de code por access_token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) return new Response("Invalid token", { status: 400 });

    const headers = new Headers();
    headers.set("Set-Cookie", `token=${token}; Path=/; SameSite=Strict`);
    headers.set("Location", FRONTEND_URL);

    return new Response(null, { status: 302, headers });
  }

  if (url.pathname === "/logout") {
    const headers = new Headers();
    headers.set("Set-Cookie", "token=; Path=/; Max-Age=0; SameSite=Strict");
    headers.set("Location", FRONTEND_URL);
    return new Response(null, { status: 302, headers });
  }

  return new Response("Not Found", { status: 404 });
});
