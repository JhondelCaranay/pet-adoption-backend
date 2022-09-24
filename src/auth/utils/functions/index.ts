import * as bcrypt from 'bcrypt';

export const hashData = async (data: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(data, salt);
};
