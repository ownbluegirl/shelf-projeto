const VALID_STATUS = ["quero_ler", "lendo", "lido"];

function cleanText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function emptyToNull(value) {
  const cleaned = cleanText(value);
  return cleaned === "" ? null : cleaned;
}

function normalizeBookPayload(input = {}) {
  const ratingText = cleanText(input.rating);
  const rating = ratingText === "" ? null : Number(ratingText);

  return {
    title: cleanText(input.title),
    author: cleanText(input.author),
    status: cleanText(input.status),
    genre: emptyToNull(input.genre),
    start_date: emptyToNull(input.start_date),
    end_date: emptyToNull(input.end_date),
    rating,
  };
}

function validateBookInput(input = {}) {
  const book = normalizeBookPayload(input);
  const errors = [];

  if (!book.title) errors.push("Informe o título do livro.");
  if (!book.author) errors.push("Informe o autor do livro.");
  if (!VALID_STATUS.includes(book.status)) {
    errors.push("Escolha um status válido.");
  }

  if (book.rating !== null && (!Number.isInteger(book.rating) || book.rating < 1 || book.rating > 5)) {
    errors.push("A nota deve ser um número de 1 a 5.");
  }

  if (book.start_date && book.end_date && book.end_date < book.start_date) {
    errors.push("A data de fim não pode ser anterior à data de início.");
  }

  return {
    ok: errors.length === 0,
    errors,
    book,
  };
}

function formatStatus(status) {
  const labels = {
    quero_ler: "Quero ler",
    lendo: "Lendo",
    lido: "Lido",
  };
  return labels[status] || status;
}

module.exports = {
  VALID_STATUS,
  normalizeBookPayload,
  validateBookInput,
  formatStatus,
};
