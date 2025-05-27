/**
 * Loads a value from localStorage, parsing JSON if possible.
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export function loadFromLocalStorage (key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e);
    localStorage.removeItem(key);
    return defaultValue;
  }
};

/**
 * Saves a value to localStorage, stringify it.
 * @param {string} key
 * @param {*} value
 */
export function saveToLocalStorage (key, value) {
  localStorage.setItem(key, JSON.stringify(value));
};


