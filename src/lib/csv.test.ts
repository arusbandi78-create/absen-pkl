import { describe, expect, it } from "vitest";
import { parseCsvText } from "./csv";

describe("parseCsvText", () => {
  it("parses semicolon-delimited CSV with a UTF-8 BOM", () => {
    const parsed = parseCsvText(
      "\uFEFFrole;pin;nama_lengkap;tempat_pkl\r\nsiswa;1234;Budi;\"CV; Abadi\"\r\n",
    );

    expect(parsed.headers).toEqual(["role", "pin", "nama_lengkap", "tempat_pkl"]);
    expect(parsed.rows).toEqual([["siswa", "1234", "Budi", "CV; Abadi"]]);
  });

  it("keeps quoted commas and escaped quotes in comma-delimited CSV", () => {
    const parsed = parseCsvText('pin,nama_lengkap,tempat_pkl\n1234,Budi,"CV ""Sinar, Abadi"""');

    expect(parsed.rows).toEqual([["1234", "Budi", 'CV "Sinar, Abadi"']]);
  });
});
