export const isValidNonNegativeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
};

export const isValidQrCount = (qrCount) => {
  const count = parseInt(qrCount, 10); // ensures string -> number safely
  if (isNaN(count)) return false; // not a number
  if (count <= 0) return false; // must be positive
  // if (count > 50) return false; // upper limit check
  return true;
};
