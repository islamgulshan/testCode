export const generateOTP = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};
