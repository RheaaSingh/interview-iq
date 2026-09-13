import db from '../config/database';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  bio?: string;
  profile_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithoutPassword extends Omit<User, 'password_hash'> {}

const UserModel = {
  async findById(id: string): Promise<User | undefined> {
    return db('users').where({ id }).first();
  },

  async findByEmail(email: string): Promise<User | undefined> {
    return db('users').where({ email: email.toLowerCase() }).first();
  },

  async create(data: { name: string; email: string; password_hash: string; bio?: string }): Promise<User> {
    const [user] = await db('users')
      .insert({ ...data, email: data.email.toLowerCase() })
      .returning('*');
    return user;
  },

  async update(id: string, data: Partial<Pick<User, 'name' | 'bio' | 'profile_image_url'>>): Promise<User | undefined> {
    const [user] = await db('users')
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    return user;
  },

  toPublic(user: User): UserWithoutPassword {
    const { password_hash, ...publicUser } = user;
    return publicUser;
  },
};

export default UserModel;
