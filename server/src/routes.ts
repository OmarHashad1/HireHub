export const ROUTES = {
  AUTH: {
    BASE: "/auth",
    SIGNUP: "/signup",
    LOGIN: "/login",
    GOOGLE_LOGIN: "/login/google",
    GOOGLE_CALLBACK: "/login/google/callback",
    REFRESH_TOKEN: "/refresh-token",
    SEND_VERIFY_EMAIL: "/send-verify-email",
    VERIFY_EMAIL: "/verify-email",
    SEND_FORGOT_PASSWORD_OTP: "/forgot-password",
    VERIFY_FORGOT_PASSWORD_OTP: "/forgot-password/verify-otp",
    RESET_PASSWORD: "/reset-password",
    CHANGE_PASSWORD: "/change-password",
  },
  USER: {
    BASE: "/user",
    LOGOUT: "/logout",
    CHANGE_AVATAR: "/change-avatar",
    DELETE_AVATAR: "/delete-avatar",
  },
  company: {
    BASE: "/company",
    COMPANY_APLLICATION: "/company-application",
  },
} as const;
