# Deploy web ke Vercel

Web ini adalah app Next.js di folder `web/` dalam repo `lumora-launchpad`. Karena
repo berisi dua folder (`web` dan `contracts`), kuncinya adalah memberi tahu
Vercel bahwa root project ada di `web`.

Ada dua cara: lewat dashboard dengan Git, atau lewat CLI tanpa Git.

## Variabel lingkungan yang wajib diisi

Semua diawali `NEXT_PUBLIC_` sehingga dibaca saat build. Set semuanya di Vercel
sebelum build pertama.

| Nama | Nilai |
| --- | --- |
| `NEXT_PUBLIC_FACTORY_ADDRESS` | Alamat LaunchpadFactory hasil deploy |
| `NEXT_PUBLIC_CHAIN_ID` | 84532 untuk Base Sepolia, 8453 untuk mainnet |
| `NEXT_PUBLIC_START_BLOCK` | Block deploy factory, untuk grafik harga |
| `NEXT_PUBLIC_WALLETCONNECT_ID` | Project id dari WalletConnect Cloud |

WalletConnect id gratis di https://cloud.walletconnect.com

## Cara A. Lewat dashboard dengan Git

1. Push repo ke GitHub, GitLab, atau Bitbucket.

   ```
   cd /root/lumora-launchpad
   git init
   git add .
   git commit -m "Lumora launchpad"
   git branch -M main
   git remote add origin <url repo kamu>
   git push -u origin main
   ```

2. Buka https://vercel.com lalu New Project dan import repo tadi.

3. Penting: di bagian Root Directory pilih `web`. Vercel otomatis mengenali
   Next.js, jadi Build Command dan Output bisa dibiarkan default.

4. Buka Environment Variables, masukkan keempat variabel di tabel atas.

5. Klik Deploy. Setelah selesai kamu dapat URL produksi.

## Cara B. Lewat CLI tanpa Git

1. Pasang dan login.

   ```
   npm i -g vercel
   vercel login
   ```

2. Dari dalam folder web.

   ```
   cd /root/lumora-launchpad/web
   vercel
   ```

   Saat ditanya, jawab:
   - Set up and deploy: yes
   - Scope: pilih akun kamu
   - Link to existing project: no
   - Project name: lumora
   - In which directory is your code: tekan enter karena kamu sudah di folder web
   - Override settings: no

3. Set variabel lingkungan, lalu deploy produksi.

   ```
   vercel env add NEXT_PUBLIC_FACTORY_ADDRESS
   vercel env add NEXT_PUBLIC_CHAIN_ID
   vercel env add NEXT_PUBLIC_START_BLOCK
   vercel env add NEXT_PUBLIC_WALLETCONNECT_ID
   vercel --prod
   ```

## Setelah deploy kontrak baru

Kalau kamu deploy ulang factory, perbarui `NEXT_PUBLIC_FACTORY_ADDRESS` dan
`NEXT_PUBLIC_START_BLOCK` di Vercel, lalu jalankan redeploy. Lewat CLI cukup
`vercel --prod`. Lewat dashboard, ubah env lalu klik Redeploy.

## Catatan

- Variabel `NEXT_PUBLIC_` masuk ke bundel browser, jadi jangan taruh rahasia di
  sana. Alamat kontrak dan chain id memang publik, aman.
- Build menjalankan type check. Kalau gagal, jalankan `npm run build` lokal
  dulu untuk melihat pesannya.
- Untuk domain sendiri, tambahkan di menu Domains pada project Vercel.
