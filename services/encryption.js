import bcrypt from 'bcryptjs';

export const EncryptionService = {
  hashPassword: (password) => bcrypt.hashSync(password, 10),
  verifyPassword: (candidatePassword, hashedPassword) => 
    bcrypt.compareSync(candidatePassword, hashedPassword)
};