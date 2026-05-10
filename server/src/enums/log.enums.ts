export enum LOG_ACTION {
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
  Info  = 30,
  Warn  = 40,
  Error = 50,
  Fatal = 60,
}