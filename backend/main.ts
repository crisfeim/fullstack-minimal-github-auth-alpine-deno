import "https://deno.land/std@0.204.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.204.0/http/server.ts";

const CLIENT_ID = Deno.env.get("CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("CLIENT_SECRET")!;

console.log("CLIENT_ID:", Deno.env.get("CLIENT_ID"));
console.log("CLIENT_SECRET:", Deno.env.get("CLIENT_SECRET"));

serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/login") {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`;
    return Response.redirect(redirectUrl, 302);
  }

  if (url.pathname === "/callback") {
    const code = url.searchParams.get("code");
    if (!code) return new Response("Code no encontrado", { status: 400 });

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) return new Response("Token inválido", { status: 400 });

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });

    const redirect = `http://localhost:3000/?token=${token}`;
    return Response.redirect(redirect, 302);
  }

  return new Response("Not Found", { status: 404 });
});
