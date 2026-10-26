
const STORAGE_KEY = 'book-explorer-favorites'

export function getFavorites() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

export function addFavorite(book) {
  const favorites = getFavorites()

  const alreadySaved = favorites.some(
    (favorite) => favorite.id === book.id
  )

  if (alreadySaved) return favorites

  const updatedFavorites = [...favorites, book]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites))

  return updatedFavorites
}

export function removeFavorite(bookId) {
  const updatedFavorites = getFavorites().filter(
    (book) => book.id !== bookId
  )

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites))

  return updatedFavorites
}
