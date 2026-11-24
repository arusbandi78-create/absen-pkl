import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { parseStudentImportFile } from "./student-import-file";

describe("parseStudentImportFile", () => {
  it("reads headers and rows from the first Excel worksheet", async () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["role", "pin", "nama_lengkap"],
      ["siswa", "001234", "Budi"],
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;

    const parsed = await parseStudentImportFile({
      name: "data-siswa.xlsx",
      text: async () => "",
      arrayBuffer: async () => buffer,
    });

    expect(parsed.headers).toEqual(["role", "pin", "nama_lengkap"]);
    expect(parsed.rows).toEqual([["siswa", "001234", "Budi"]]);
  });

  it("rejects unsupported file types", async () => {
    await expect(
      parseStudentImportFile({
        name: "data-siswa.doc",
        text: async () => "",
        arrayBuffer: async () => new ArrayBuffer(0),
      }),
    ).rejects.toThrow("Format file tidak didukung");
  });
});
