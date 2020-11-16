import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';

import User from '../models/User';
import uploadConfig from '../config/upload';

interface Request {
  user_id: string;
  avatarFilename: string;
}

export default class UpdateUserAvatarService {
  async execute({
    user_id,
    avatarFilename,
  }: Request): Promise<Omit<User, 'password'>> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({
      where: { id: user_id },
    });

    if (!user) {
      throw new Error('Only authenticated users can change avatar.');
    }

    if (user.avatar) {
      // Deletar avatar anterior

      const userAvatarFilePath = path.join(uploadConfig.directory, user.avatar);

      const userAvatarFileExists = await fs.promises.stat(userAvatarFilePath);

      if (userAvatarFileExists) {
        await fs.promises.unlink(userAvatarFilePath);
      }
    }

    user.avatar = avatarFilename;

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      avatar: user.avatar,
    };

    await userRepository.save(user);

    return userWithoutPassword;
  }
}
