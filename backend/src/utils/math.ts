export const generateRandomNumber = (
  min: number,
  max: number,
  integer: boolean = false,
) => {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);

  const random = Math.random() * (upper - lower + 1) + lower;

  return integer ? Math.floor(random) : random;
};
