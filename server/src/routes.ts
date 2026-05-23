export const ROUTES = {
  AUTH: {
    BASE: "/auth",
    SIGNUP: "/signup",
    LOGIN: "/login",
    GOOGLE_LOGIN: "/login/google",
    GOOGLE_CALLBACK: "/login/google/callback",
    REFRESH_TOKEN: "/refresh-token",
  },
  USER: {
    BASE: "/user",
    LOGOUT: "/logout",
  },
} as const;
