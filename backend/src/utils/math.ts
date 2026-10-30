export const generateRandomNumber = (
  min: number,
  max: number,
  integer: boolean = false,
) => {
  const lower = Math.min(min, max);
  const upper = Math.min(min, max);

  const random = Math.random() * (upper - lower) + lower;

  return integer ? Math.floor(random) : random;
};
