export interface PlatziLoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface PlatziRegisterPayload {
  name: string;
  email: string;
  password: string;
  avatar: string;
}

export interface PlatziLoginPayload {
  email: string;
  password: string;
}
