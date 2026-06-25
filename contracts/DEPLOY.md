# Deploy ke Base Sepolia

Panduan menjalankan launchpad end to end di testnet Base Sepolia.

## 1. Prasyarat

1. Pasang Foundry.

   ```
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. Siapkan satu wallet khusus testing. Jangan pakai wallet utama.

3. Ambil ETH Base Sepolia dari faucet, misalnya faucet Coinbase Developer
   Platform atau Alchemy. Cukup sekitar 0.2 ETH untuk testing.

4. Siapkan Basescan API key dari basescan.org kalau ingin verifikasi kontrak.

## 2. Konfigurasi

```
cd contracts
cp .env.example .env
```

Isi `.env`:

- `PRIVATE_KEY` private key wallet testing kamu, diawali 0x.
- `DEV_TREASURY` alamat penerima fee 65 persen. Boleh sama dengan wallet kamu.
- `BASESCAN_API_KEY` opsional, untuk verifikasi.
- `UNISWAP_V2_ROUTER` hanya dipakai oleh script Deploy biasa. Untuk testnet
  pakai script DeployTestnet yang sudah membawa mock router sendiri.

## 3. Install dependency dan tes

```
make install
make test
```

Semua tes harus hijau sebelum lanjut.

## 4. Deploy

Ada dua pilihan.

### Pilihan A. Playground testnet dengan graduate yang mudah diuji

Direkomendasikan untuk uji coba pertama. Script ini deploy mock router dan
menyetel target graduate ke 0.05 ETH supaya alur lengkap dari beli sampai
graduate bisa dicoba dengan ETH faucet.

```
make deploy-testnet
```

Catat alamat yang tercetak: `LaunchpadFactory` dan `MockRouter`.

### Pilihan B. Deploy gaya produksi

Memakai `UNISWAP_V2_ROUTER` dari `.env` dan target graduate default 3 ETH.
Pakai ini kalau kamu sudah punya alamat router Uniswap v2 yang valid di Sepolia.

```
make deploy-sepolia
```

## 5. Catat block deploy untuk grafik

Grafik harga di web membaca event mulai dari block tertentu. Ambil nomor block
deploy factory dari output forge, atau dari berkas broadcast:

```
contracts/broadcast/DeployTestnet.s.sol/84532/run-latest.json
```

Cari field `receipt.blockNumber` untuk transaksi pembuatan factory.

## 6. Sambungkan ke web

Di `web/.env.local`:

```
NEXT_PUBLIC_FACTORY_ADDRESS=<alamat LaunchpadFactory>
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_START_BLOCK=<block deploy factory>
NEXT_PUBLIC_WALLETCONNECT_ID=<id dari WalletConnect Cloud>
```

Lalu:

```
cd ../web
npm install
npm run dev
```

## 7. Uji end to end

1. Buka http://localhost:3000 dan hubungkan wallet ke jaringan Base Sepolia.
2. Masuk ke halaman Buat Token, isi nama dan simbol, lalu luncurkan.
3. Token muncul di landing. Klik untuk masuk halaman trading.
4. Beli sejumlah kecil ETH, cek saldo dan grafik ikut bergerak.
5. Jual sebagian, pastikan ETH kembali dikurangi fee.
6. Kalau pakai Pilihan A, beli hingga total 0.05 ETH untuk memicu graduate.
   Panel trading akan berubah menjadi status sudah listing.

Cara cepat lewat command line untuk membuat token:

```
make create-token FACTORY=0xYourFactory NAME=Aurora SYMBOL=AUR
```

## Memeriksa fee masuk

Cek saldo dev treasury naik setelah beberapa transaksi:

```
cast balance <DEV_TREASURY> --rpc-url base_sepolia
```

## Sebelum mainnet

- Lakukan review dan audit kontrak.
- Ganti router ke Uniswap v2 yang benar di Base mainnet dan kembalikan target
  graduate ke nilai produksi.
- Uji ulang parameter kurva `virtualEthReserve` dan `graduationEth`.
