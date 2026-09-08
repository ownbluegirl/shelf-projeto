const form = document.querySelector("#book-form");
const bookId = document.querySelector("#book-id");
const title = document.querySelector("#title");
const author = document.querySelector("#author");
const statusInput = document.querySelector("#status");
const genre = document.querySelector("#genre");
const startDate = document.querySelector("#start_date");
const endDate = document.querySelector("#end_date");
const rating = document.querySelector("#rating");
const message = document.querySelector("#form-message");
const cancelButton = document.querySelector("#cancel-button");
const booksBody = document.querySelector("#books-body");
const emptyState = document.querySelector("#empty-state");
const filterButtons = document.querySelectorAll(".filter");

let books = [];
let currentFilter = "";

const statusLabels = {
  quero_ler: "Quero ler",
  lendo: "Lendo",
  lido: "Lido",
};

function bookPayload() {
  return {
    title: title.value,
    author: author.value,
    status: statusInput.value,
    genre: genre.value,
    start_date: startDate.value,
    end_date: endDate.value,
    rating: rating.value,
  };
}

function resetForm() {
  form.reset();
  bookId.value = "";
  statusInput.value = "quero_ler";
  message.textContent = "";
}

function setMessage(text) {
  message.textContent = text || "";
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erro ao acessar o sistema.");
  }
  return data;
}

async function loadBooks() {
  const query = currentFilter ? `?status=${encodeURIComponent(currentFilter)}` : "";
  books = await api(`/api/books${query}`);
  renderBooks();
}

function renderBooks() {
  booksBody.innerHTML = "";
  emptyState.hidden = books.length > 0;

  for (const book of books) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="book-title"></div>
        <div class="book-meta"></div>
      </td>
      <td></td>
      <td></td>
      <td>
        <div class="table-actions">
          <button type="button" class="secondary edit">Editar</button>
          <button type="button" class="secondary delete">Excluir</button>
        </div>
      </td>
    `;

    row.querySelector(".book-title").textContent = book.title;
    row.querySelector(".book-meta").textContent = metaText(book);
    row.children[1].textContent = statusLabels[book.status] || book.status;
    row.children[2].textContent = book.rating ? `${book.rating}/5` : "-";
    row.querySelector(".edit").addEventListener("click", () => editBook(book));
    row.querySelector(".delete").addEventListener("click", () => deleteBook(book));
    booksBody.appendChild(row);
  }
}

function metaText(book) {
  const parts = [book.author];
  if (book.genre) parts.push(book.genre);
  if (book.start_date) parts.push(`início ${book.start_date}`);
  if (book.end_date) parts.push(`fim ${book.end_date}`);
  return parts.join(" · ");
}

function editBook(book) {
  bookId.value = book.id;
  title.value = book.title || "";
  author.value = book.author || "";
  statusInput.value = book.status || "quero_ler";
  genre.value = book.genre || "";
  startDate.value = book.start_date || "";
  endDate.value = book.end_date || "";
  rating.value = book.rating || "";
  setMessage("");
  title.focus();
}

async function deleteBook(book) {
  const confirmed = confirm(`Excluir "${book.title}"?`);
  if (!confirmed) return;
  await api(`/api/books?id=${encodeURIComponent(book.id)}`, { method: "DELETE" });
  if (bookId.value === book.id) resetForm();
  await loadBooks();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");

  try {
    const id = bookId.value;
    const options = {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(bookPayload()),
    };
    const path = id ? `/api/books?id=${encodeURIComponent(id)}` : "/api/books";
    await api(path, options);
    resetForm();
    await loadBooks();
  } catch (error) {
    setMessage(error.message);
  }
});

cancelButton.addEventListener("click", resetForm);

for (const button of filterButtons) {
  button.addEventListener("click", async () => {
    currentFilter = button.dataset.status || "";
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    await loadBooks();
  });
}

loadBooks().catch((error) => {
  setMessage(error.message);
});
