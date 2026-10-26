
import './style.css'
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from './favorites.js'
import { fetchBooks } from './api.js'

const app = document.querySelector('#app')

let books = []
let currentQuery = ''
let isLoading = false
let errorMessage = ''

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[character]
  })
}

function renderBookCard(book, isFavorite = false) {
  const cover = book.coverId
    ? `https://covers.openlibrary.org/b/id/${Number(book.coverId)}-M.jpg`
    : ''

  return `
    <article class="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      ${
        cover
          ? `<img
              src="${cover}"
              alt="Cover of ${escapeHTML(book.title)}"
              class="mb-4 h-64 w-full rounded-xl bg-stone-100 object-contain"
              onerror="this.style.display='none'"
            />`
          : `<div class="mb-4 flex h-64 items-center justify-center rounded-xl bg-stone-100 text-6xl">📚</div>`
      }

      <h3 class="mb-2 text-lg font-bold">${escapeHTML(book.title)}</h3>
      <p class="mb-1 text-sm text-stone-600">
        Author: ${escapeHTML(book.author)}
      </p>
      <p class="mb-4 text-sm text-stone-600">
        Published: ${escapeHTML(String(book.year))}
      </p>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          data-details-id="${escapeHTML(book.id)}"
          class="rounded-lg bg-stone-200 px-3 py-2 text-sm font-semibold hover:bg-stone-300"
        >
          View Details
        </button>

        <button
          type="button"
          data-favorite-id="${escapeHTML(book.id)}"
          data-is-favorite="${isFavorite}"
          class="rounded-lg px-3 py-2 text-sm font-semibold text-white ${
            isFavorite
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-emerald-700 hover:bg-emerald-800'
          }"
        >
          ${isFavorite ? 'Remove Favorite' : 'Add Favorite'}
        </button>
      </div>
    </article>
  `
}

function render() {
  const favorites = getFavorites()
  const favoriteIds = new Set(favorites.map((book) => book.id))

  app.innerHTML = `
    <header class="bg-emerald-900 text-white">
      <nav class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <a href="#home" class="text-2xl font-bold">📚 Book Explorer</a>
        <div class="flex flex-wrap gap-5 text-sm font-semibold">
          <a href="#home" class="hover:text-emerald-200">Home</a>
          <a href="#favorites" class="hover:text-emerald-200">Favorites (${favorites.length})</a>
          <a href="#about" class="hover:text-emerald-200">About</a>
        </div>
      </nav>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section id="home" class="mb-12">
        <div class="mb-8 rounded-3xl bg-emerald-100 px-6 py-10 md:px-12">
          <p class="mb-3 font-semibold uppercase tracking-wider text-emerald-800">
            Discover your next read
          </p>
          <h1 class="mb-4 text-4xl font-extrabold md:text-5xl">
            Find books worth reading.
          </h1>
          <p class="mb-6 max-w-2xl text-stone-700">
            Search books, explore authors, and save your favorites.
          </p>

          <form id="search-form" class="flex max-w-2xl flex-col gap-3 sm:flex-row">
            <input
              id="book-search"
              type="search"
              value="${escapeHTML(currentQuery)}"
              placeholder="Search books or authors..."
              aria-label="Search books or authors"
              class="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="submit"
              class="rounded-xl bg-emerald-800 px-6 py-3 font-semibold text-white hover:bg-emerald-900"
            >
              Search Books
            </button>
          </form>
        </div>

        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-2xl font-bold">Explore Books</h2>
          <p class="text-sm text-stone-600">${books.length} books found</p>
        </div>

        <p id="status-message" role="status" aria-live="polite" class="mb-5 text-stone-600">
          ${isLoading ? 'Loading books...' : escapeHTML(errorMessage)}
        </p>

        ${
          errorMessage
            ? `<button id="retry-button" type="button" class="mb-5 rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white">Try Again</button>`
            : ''
        }

        <div id="book-grid" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          ${
            isLoading
              ? '<p class="col-span-full">Please wait while books are loading...</p>'
              : books.length
                ? books.map((book) => renderBookCard(book, favoriteIds.has(book.id))).join('')
                : errorMessage
                  ? ''
                  : '<p class="col-span-full text-stone-600">No books found. Try another search.</p>'
          }
        </div>

        <section
          id="book-details"
          class="mt-8 hidden rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm"
          aria-live="polite"
        ></section>
      </section>

      <section id="favorites" class="mb-12 border-t border-stone-200 pt-10">
        <h2 class="mb-2 text-2xl font-bold">Your Favorite Books</h2>
        <p class="mb-6 text-stone-600">
          Your saved books stay here when you refresh the page.
        </p>
        <div id="favorites-grid" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          ${
            favorites.length
              ? favorites.map((book) => renderBookCard(book, true)).join('')
              : '<p class="col-span-full text-stone-600">You have not saved any favorite books yet.</p>'
          }
        </div>
      </section>

      <section id="about" class="rounded-3xl bg-stone-100 p-6 md:p-10">
        <h2 class="mb-3 text-2xl font-bold">About Book Explorer</h2>
        <p class="max-w-3xl leading-7 text-stone-700">
          Book Explorer helps readers discover books using the Open Library API.
          Search for titles, view book details, and save favorite books in your browser.
        </p>
      </section>
    </main>

    <footer class="mt-12 bg-stone-900 px-6 py-8 text-center text-sm text-white">
      <p>Book Explorer · Powered by Open Library</p>
    </footer>
  `
}

function renderBookDetails(book) {
  const detailsSection = document.querySelector('#book-details')
  if (!detailsSection) return

  detailsSection.classList.remove('hidden')
  detailsSection.innerHTML = `
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <p class="mb-2 font-semibold uppercase tracking-wider text-emerald-800">
          Book Details
        </p>
        <h2 class="text-2xl font-bold">${escapeHTML(book.title)}</h2>
      </div>
      <button
        type="button"
        id="close-details"
        class="rounded-lg bg-stone-200 px-3 py-2 text-sm font-semibold hover:bg-stone-300"
      >
        Close
      </button>
    </div>

    <div class="grid gap-3 text-stone-700 sm:grid-cols-2">
      <p><strong>Author:</strong> ${escapeHTML(book.author)}</p>
      <p><strong>First published:</strong> ${escapeHTML(String(book.year))}</p>
      <p class="sm:col-span-2">
        <strong>Subjects:</strong>
        ${escapeHTML(book.subjects?.join(', ') || 'No subjects available')}
      </p>
      <p class="sm:col-span-2">
        <strong>Open Library ID:</strong> ${escapeHTML(book.id)}
      </p>
    </div>

    <a
      href="https://openlibrary.org${encodeURI(book.id)}"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-5 inline-block rounded-lg bg-emerald-800 px-4 py-3 font-semibold text-white hover:bg-emerald-900"
    >
      Open on Open Library
    </a>
  `

  detailsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

async function loadBooks(query = 'javascript') {
  currentQuery = query
  isLoading = true
  errorMessage = ''
  render()

  try {
    books = await fetchBooks(query)
  } catch (error) {
    books = []
    errorMessage = 'Could not load books. Check your internet connection and try again.'
    console.error('Failed to load books:', error)
  } finally {
    isLoading = false
    render()
  }
}

app.addEventListener('submit', (event) => {
  if (event.target.id !== 'search-form') return

  event.preventDefault()
  const searchInput = document.querySelector('#book-search')
  const query = searchInput.value.trim()

  if (query) {
    loadBooks(query)
  }
})

app.addEventListener('click', (event) => {
  const detailsButton = event.target.closest('[data-details-id]')

  if (detailsButton) {
    const bookId = detailsButton.dataset.detailsId
    const book =
      books.find((item) => item.id === bookId) ||
      getFavorites().find((item) => item.id === bookId)

    if (book) {
      renderBookDetails(book)
    }
    return
  }

  if (event.target.closest('#close-details')) {
    const detailsSection = document.querySelector('#book-details')
    if (detailsSection) {
      detailsSection.classList.add('hidden')
      detailsSection.innerHTML = ''
    }
    return
  }

  if (event.target.closest('#retry-button')) {
    loadBooks(currentQuery || 'javascript')
    return
  }

  const favoriteButton = event.target.closest('[data-favorite-id]')
  if (!favoriteButton) return

  const bookId = favoriteButton.dataset.favoriteId
  const isFavorite = favoriteButton.dataset.isFavorite === 'true'
  const book =
    books.find((item) => item.id === bookId) ||
    getFavorites().find((item) => item.id === bookId)

  if (!book) return

  if (isFavorite) {
    removeFavorite(bookId)
  } else {
    addFavorite(book)
  }

  render()
})

render()
loadBooks('javascript')
