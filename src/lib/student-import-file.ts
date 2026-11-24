import { parseCsvText, type ParsedCsv } from "./csv";

type ImportFile = Pick<File, "name" | "text" | "arrayBuffer">;

export async function parseStudentImportFile(file: ImportFile): Promise<ParsedCsv> {
  const extension = file.name.toLowerCase().split(".").pop();
  if (extension === "csv") return parseCsvText(await file.text());
  if (extension !== "xlsx") throw new Error("Format file tidak didukung. Pilih file .csv atau .xlsx.");

  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { headers: [], rows: [] };

  const csvText = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheetName], { blankrows: false });
  return parseCsvText(csvText);
}
