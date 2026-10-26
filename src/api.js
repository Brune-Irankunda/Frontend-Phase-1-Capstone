
const BASE_URL = 'https://openlibrary.org'

export async function fetchBooks(query = 'javascript') {
  const url = new URL('/search.json', BASE_URL)

  url.searchParams.set('q', query)
  url.searchParams.set('limit', '24')
  url.searchParams.set(
    'fields',
    'key,title,author_name,first_publish_year,cover_i,subject'
  )

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  const data = await response.json()

return data.docs.map((book) => ({
  id: book.key,
  title: book.title || 'Untitled book',
  author: book.author_name?.join(', ') || 'Unknown author',
  year: book.first_publish_year || 'Year unknown',
  coverId: book.cover_i || null,
  subjects: book.subject?.slice(0, 3) || [],
}))
}
