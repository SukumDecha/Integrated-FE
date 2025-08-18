const parseNumber = (v) => {
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

export { parseNumber }
