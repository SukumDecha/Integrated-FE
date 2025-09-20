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

export function maskNumber (number) {
  if (!number) return '';
  const str = number.toString();
  if (str.length < 4) return str; // If less than 4 digits, show as is

  const last4 = str.slice(-4);
  const masked = 'x'.repeat(str.length - 4) + last4.slice(0, 3) + 'x';
  return masked;
};
