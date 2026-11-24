import { pgTable, text, timestamp, boolean, uuid, varchar } from "drizzle-orm/pg-core";

// ==========================================
// 1. TABEL USER & AUTH (Admin / Guru / Pembimbing)
// ==========================================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "guru_pembimbing", "pembimbing_lapangan"] }).default("guru_pembimbing").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 2. TABEL DU/DI (Dunia Usaha / Dunia Industri / Tempat PKL)
// ==========================================
export const dudi = pgTable("dudi", {
  id: uuid("id").primaryKey().defaultRandom(),
  namaPerusahaan: text("nama_perusahaan").notNull(),
  alamat: text("alamat").notNull(),
  pembimbingId: uuid("pembimbing_id").references(() => users.id), // Guru Pembimbing
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 3. TABEL SISWA (Tabel utama yang dipanggil di aplikasi)
// ==========================================
export const siswa = pgTable("siswa", {
  id: uuid("id").primaryKey().defaultRandom(),
  nisn: varchar("nisn", { length: 20 }).notNull().unique(),
  nama: text("nama").notNull(),
  kelas: text("kelas").notNull(), // Contoh: XII RPL 1, XII TKJ 2
  jurusan: text("jurusan").notNull(), // Contoh: Rekayasa Perangkat Lunak
  pin: varchar("pin", { length: 6 }).notNull(), // PIN untuk absensi / login siswa
  dudiId: uuid("dudi_id").references(() => dudi.id), // Tempat lokasi PKL
  isAktif: boolean("is_aktif").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 4. TABEL ABSENSI SISWA
// ==========================================
export const absensi = pgTable("absensi", {
  id: uuid("id").primaryKey().defaultRandom(),
  siswaId: uuid("siswa_id").references(() => siswa.id, { onDelete: "cascade" }).notNull(),
  tanggal: timestamp("tanggal").defaultNow().notNull(),
  status: text("status", { enum: ["hadir", "izin", "sakit", "alpha"] }).notNull(),
  keterangan: text("keterangan"), // Keterangan jika izin/sakit
  fotoBukti: text("foto_bukti"), // URL foto selfie/bukti absensi
  lokasiLat: text("lokasi_lat"), // Koordinat GPS jika diperlukan
  lokasiLong: text("lokasi_long"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 5. TABEL JURNAL KEGIATAN HARIAN PKL
// ==========================================
export const jurnal = pgTable("jurnal", {
  id: uuid("id").primaryKey().defaultRandom(),
  siswaId: uuid("siswa_id").references(() => siswa.id, { onDelete: "cascade" }).notNull(),
  tanggal: timestamp("tanggal").defaultNow().notNull(),
  kegiatan: text("kegiatan").notNull(), // Deskripsi jurnal harian
  statusValidasi: boolean("status_validasi").default(false).notNull(), // Disetujui pembimbing
  createdAt: timestamp("created_at").defaultNow().notNull(),
});