import { UserRole } from 'src/users/entities/user.entity';

declare global {
  namespace Express {
    interface User {
      sub: string;
      email: string;
      role: UserRole;
    }

    interface Request {
      user: User;
    }
  }
}
