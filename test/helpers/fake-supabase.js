function clone(book) {
  return { ...book };
}

function response(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return data;
    },
    async text() {
      return typeof data === "string" ? data : JSON.stringify(data);
    },
  };
}

function readId(searchParams) {
  const id = searchParams.get("id") || "";
  return id.startsWith("eq.") ? id.slice(3) : "";
}

function readStatus(searchParams) {
  const status = searchParams.get("status") || "";
  return status.startsWith("eq.") ? status.slice(3) : "";
}

function installFakeSupabase() {
  const hadFetch = Object.prototype.hasOwnProperty.call(global, "fetch");
  const originalFetch = global.fetch;
  const calls = [];
  let books = [];
  let nextId = 1;

  function seed(nextBooks) {
    books = nextBooks.map(clone);
    nextId = books.reduce((max, book) => Math.max(max, Number(book.id) || 0), 0) + 1;
  }

  global.fetch = async function fakeFetch(url, options = {}) {
    const requestUrl = new URL(String(url));
    const method = (options.method || "GET").toUpperCase();
    calls.push({ url: String(url), method });

    if (!requestUrl.pathname.endsWith("/rest/v1/books")) {
      return response("Nao encontrado.", 404);
    }

    if (method === "GET") {
      const status = readStatus(requestUrl.searchParams);
      const result = status ? books.filter((book) => book.status === status) : books;
      return response(result.map(clone));
    }

    if (method === "POST") {
      const input = JSON.parse(options.body || "{}");
      const now = new Date().toISOString();
      const book = {
        id: String(nextId++),
        ...input,
        created_at: input.created_at || now,
        updated_at: input.updated_at || now,
      };
      books.push(book);
      return response([clone(book)], 201);
    }

    if (method === "PATCH") {
      const id = readId(requestUrl.searchParams);
      const index = books.findIndex((book) => book.id === id);
      if (index === -1) return response("Livro nao encontrado.", 404);

      books[index] = {
        ...books[index],
        ...JSON.parse(options.body || "{}"),
        updated_at: new Date().toISOString(),
      };
      return response([clone(books[index])]);
    }

    if (method === "DELETE") {
      const id = readId(requestUrl.searchParams);
      books = books.filter((book) => book.id !== id);
      return response(null, 204);
    }

    return response("Metodo nao permitido.", 405);
  };

  function restore() {
    if (hadFetch) {
      global.fetch = originalFetch;
    } else {
      delete global.fetch;
    }
  }

  return { restore, calls, seed };
}

module.exports = { installFakeSupabase };
