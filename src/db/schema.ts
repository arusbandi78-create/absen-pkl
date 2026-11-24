import { pgTable, text, timestamp, boolean, uuid, varchar } from "drizzle-orm/pg-core";

// ==========================================
// TABEL SISWA
// ==========================================
export const siswa = pgTable("siswa", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  nisn: varchar("nisn", { length: 20 }).notNull().unique(),
  nama: text("nama").notNull(),
  namaLengkap: text("nama_lengkap"),
  kelas: text("kelas").notNull(),
  jurusan: text("jurusan").notNull(),
  pin: varchar("pin", { length: 6 }).notNull(),
  statusAkun: text("status_akun").default("aktif"), // <-- Kolom baru yang dicari aplikasi
  isAktif: boolean("is_aktif").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// TABEL ABSENSI
// ==========================================
export const absensi = pgTable("absensi", {
  id: uuid("id").primaryKey().defaultRandom(),
  siswaId: uuid("siswa_id").references(() => siswa.id, { onDelete: "cascade" }).notNull(),
  tanggal: timestamp("tanggal").defaultNow().notNull(),
  status: text("status", { enum: ["hadir", "izin", "sakit", "alpha"] }).notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});