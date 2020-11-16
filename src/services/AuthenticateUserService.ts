import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import User from '../models/User';
import authConfig from '../config/auth';

interface Request {
  email: string;
  password: string;
}

interface Response {
  user: Omit<User, 'password'>;
  token: string;
}

export default class AuthenticateUserService {
  async execute({ email, password }: Request): Promise<Response> {
    const usersRepository = getRepository(User);

    const user = await usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw Error('Email or password is incorrect.');
    }

    const passwordMatched = await compare(password, user.password ?? '');
    if (!passwordMatched) {
      throw Error('Email or password is incorrect.');
    }

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      avatar: user.avatar,
    };

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    return { user: userWithoutPassword, token };
  }
}
