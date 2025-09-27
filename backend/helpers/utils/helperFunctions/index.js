export const isValidNonNegativeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
};