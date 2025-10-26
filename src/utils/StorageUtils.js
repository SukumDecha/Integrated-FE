/**
 * Loads a value from sessionStorage, parsing JSON if possible.
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export function loadFromSessionStorage(key, defaultValue) {
  try {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    sessionStorage.removeItem(key)
    return defaultValue
  }
}

/**
 * Saves a value to sessionStorage, stringify it.
 * @param {string} key
 * @param {*} value
 */
export function saveToSessionStorage(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value))
}

/**
 * Loads a value from localStorage, parsing JSON if possible.
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export function loadFromLocalStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    localStorage.removeItem(key)
    return defaultValue
  }
}

/**
 * Saves a value to localStorage, stringify it.
 * @param {string} key
 * @param {*} value
 */
export function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
