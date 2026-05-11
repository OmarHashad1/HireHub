import { Response } from "express";

export interface emailDTO {
  to: string;
  subject: string;
  html: string;
}

export interface successResponseDTO<T> {
  res: Response;
  message: string;
  status: number;
  data?: T;
}

export interface errorResponseDTO {
  res: Response;
  message: string;
  status: number;
}
