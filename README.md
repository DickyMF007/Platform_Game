## EVE Everlasting Alliance Hub (Whiteout Survival)

Platform informasi aliansi Whiteout Survival dengan fokus mobile-first, adaptif desktop, dan integrasi langsung ke Supabase tanpa backend custom.

### Stack
- Next.js (App Router)
- Tailwind CSS
- Supabase (Postgres + Storage + Auth/RLS)

### Fitur
- State Information + latest update
- Alliance Information
- Player Information
- Leaderboard
- Form pendaftaran (nama, game ID, note, foto power)
- Admin page untuk melihat daftar pendaftar
- Hero header lebar bertema Whiteout khusus `[EVE] Everlasting - State 3302`

### Setup Local
1. Install dependency:
   ```bash
   npm install
   ```
2. Copy env:
   ```bash
   cp .env.example .env.local
   ```
3. Isi:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Jalankan:
   ```bash
   npm run dev
   ```

### Struktur Route
- `/` Home dashboard
- `/state` State Information
- `/alliance` Alliance Information
- `/players` Player Information
- `/leaderboard` Leaderboard
- `/register` Form pendaftaran
- `/admin/registrations` List pendaftar (admin/recruiter)

### Ganti Gambar Hero Aliansi
- Gambar default ada di `public/images/eve-hero-placeholder.svg`
- Untuk pakai banner aliansi sendiri, ganti file tersebut atau ubah nilai `heroImage` di `src/lib/content.ts`

### Database & RLS
SQL awal tersedia di `supabase/schema.sql`:
- Membuat tabel inti (`states`, `state_updates`, `alliances`, `players`, `leaderboards`, `registrations`, `profiles`)
- Enable RLS
- Policy public read untuk konten umum
- Policy insert untuk pendaftaran publik
- Policy read/update pendaftar untuk role `admin`/`recruiter`

### Storage Bucket (Supabase)
Buat bucket berikut:
- `registration-proof` (private, untuk screenshot power pendaftar)
- opsional: `state-media` (public, untuk banner/update state)

### Catatan Penting
- Aplikasi ini memang dirancang tanpa backend custom.
- Semua keamanan akses wajib dikontrol lewat RLS policy Supabase.
- Untuk production, tambahkan validasi ukuran file dan format game ID yang lebih ketat.

[Next.js Documentation](https://nextjs.org/docs)  
[Supabase Documentation](https://supabase.com/docs)
