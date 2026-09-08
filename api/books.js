const { validateBookInput, VALID_STATUS } = require("../src/book-validation");

const FIELDS = "id,title,author,status,genre,start_date,end_date,rating,created_at,updated_at";

function getEnv() {
  return {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  };
}

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function requestSupabase(path, options = {}) {
  const env = getEnv();
  if (!env.url || !env.key) {
    const error = new Error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(`${env.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: env.key,
      Authorization: `Bearer ${env.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(text || "Erro ao acessar o Supabase.");
    error.statusCode = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function parseUrl(req) {
  const host = req.headers.host || "localhost";
  return new URL(req.url, `http://${host}`);
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    send(res, 200, { ok: true });
    return;
  }

  try {
    const url = parseUrl(req);
    const id = url.searchParams.get("id");

    if (req.method === "GET") {
      const status = url.searchParams.get("status") || "";
      if (status && !VALID_STATUS.includes(status)) {
        send(res, 400, { error: "Status inválido." });
        return;
      }

      const filter = status ? `&status=eq.${encodeURIComponent(status)}` : "";
      const books = await requestSupabase(`books?select=${FIELDS}${filter}&order=created_at.desc`, {
        method: "GET",
      });
      send(res, 200, books);
      return;
    }

    if (req.method === "POST") {
      const input = await readBody(req);
      const validation = validateBookInput(input);
      if (!validation.ok) {
        send(res, 400, { error: validation.errors.join(" ") });
        return;
      }

      const created = await requestSupabase("books", {
        method: "POST",
        body: JSON.stringify(validation.book),
      });
      send(res, 201, created[0]);
      return;
    }

    if (req.method === "PUT") {
      if (!id) {
        send(res, 400, { error: "Informe o id do livro." });
        return;
      }

      const input = await readBody(req);
      const validation = validateBookInput(input);
      if (!validation.ok) {
        send(res, 400, { error: validation.errors.join(" ") });
        return;
      }

      const updated = await requestSupabase(`books?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(validation.book),
      });
      send(res, 200, updated[0]);
      return;
    }

    if (req.method === "DELETE") {
      if (!id) {
        send(res, 400, { error: "Informe o id do livro." });
        return;
      }

      await requestSupabase(`books?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });
      send(res, 200, { ok: true });
      return;
    }

    send(res, 405, { error: "Método não permitido." });
  } catch (error) {
    send(res, error.statusCode || 500, { error: error.message || "Erro interno." });
  }
};
