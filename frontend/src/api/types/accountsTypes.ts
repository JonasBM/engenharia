export interface UserSerializer {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface UserProfileSerializer {
  id?: number;
  groups?: any[];
  full_name?: string;
  password: string;
  last_login?: string | null;
  is_superuser?: boolean;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_staff?: boolean;
  is_active?: boolean;
  date_joined?: string;
  user_permissions?: any[];
}

export interface PasswordSerializer {
  old_password: string;
  new_password: string;
}

export interface LoginResponseSerializer {
  expiry: string;
  token: string;
  user: UserProfileSerializer;
}
