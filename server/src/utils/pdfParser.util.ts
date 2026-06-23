import { PDFParse } from "pdf-parse";

export const parserPDF = async (url: string) => {
  const parser = new PDFParse({ url });
  const result = await parser.getText();
  return result.text;
};
