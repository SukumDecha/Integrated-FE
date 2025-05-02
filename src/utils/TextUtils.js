export function formatPrice(value) {
  const number = Number(value);

  if (isNaN(number)) {
    return '-'; // or throw an error, depending on your use case
  }

  return number.toLocaleString();
}

export function displayOrDash(value) {
  return value ? value : '-';
}