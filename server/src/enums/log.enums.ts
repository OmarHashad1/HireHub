export enum LOG_ACTION {
  CREATE_USER = "create_user",
  BLOCK_LOGIN = "block_login",
  LOGIN_GOOGLE = "login_google",
  SEND_VERIFY_EMAIL_OTP = "send_verify_email_otp",
  VERIFY_EMAIL = "verify_email",
  SEND_FORGOT_PASSWORD_OTP = "send_forgot_password_otp",
  VERIFY_FORGOT_PASSWORD_OTP = "verify_forgot_password_otp",
  RESET_PASSWORD = "reset_password",
  CHANGE_PASSWORD = "change_password",

  LOGOUT = "logout",
  UPDATE_PROFILE = "update_profile",
  CHANGE_AVATAR = "change_avatar",
  DELETE_AVATAR = "delete_avatar",
  CHANGE_CV = "change_cv",
  DELETE_CV = "delete_cv",
  ADD_EXPERIENCE = "add_experience",
  REMOVE_EXPERIENCE = "remove_experience",
  ADD_EDUCATION = "add_education",
  REMOVE_EDUCATION = "remove_education",
  SEND_CHANGE_EMAIL_OTP = "send_change_email_otp",
  CHANGE_EMAIL = "change_email",
  SEND_DELETE_ACCOUNT_OTP = "send_delete_account_otp",
  DELETE_ACCOUNT = "delete_account",

  BAN_USER = "ban_user",
  UNBAN_USER = "unban_user",
  DELETE_USER = "delete_user",

  APPROVE_COMPANY_APPLICATION = "approve_company_application",
  REJECT_COMPANY_APPLICATION = "reject_company_application",

  APPROVE_ACTIVATION = "approve_activation",
  REJECT_ACTIVATION = "reject_activation",

  BAN_COMPANY = "ban_company",
  UNBAN_COMPANY = "unban_company",

  FORCE_CLOSE_JOB = "force_close_job",
  DELETE_JOB = "delete_job",

  RESOLVE_REPORT = "resolve_report",
  DISMISS_REPORT = "dismiss_report",
}

export enum LOG_TARGET_TYPE {
  USER = "USER",
  COMPANY = "COMPANY",
  COMPANY_APPLICATION = "COMPANY_APPLICATION",
  JOB = "JOB",
  REPORT = "REPORT",
}

export enum LOG_LEVEL {
  Trace = 10,
  Debug = 20,
  Info = 30,
  Warn = 40,
  Error = 50,
  Fatal = 60,
}
