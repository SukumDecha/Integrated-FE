export function formatPrice(value) {
  const number = Number(value);

  if (isNaN(number)) {
    return '-'; 
  }

  return number.toLocaleString();
}

export function displayOrDash(value) {
  return value ? value : '-';
}