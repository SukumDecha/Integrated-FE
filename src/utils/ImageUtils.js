// const baseURL = import.meta.env.VITE_API_BASE_URL

/**
 * Get the URL for an image file.
 * @param fileName - The name of the image file.
 * @returns The full URL of the image.
 */
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null

  return `${imageUrl}`
}

export { getImageUrl }
