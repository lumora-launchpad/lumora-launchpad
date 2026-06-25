# Lumora Launchpad

Launchpad token di Base dengan bonding curve yang adil dan tampilan cerah.
Setiap token bisa langsung ditradingkan di kurva harga, lalu likuiditas pindah
otomatis ke Uniswap saat target tercapai. Fee trading 1 persen dibagi 65 persen
ke developer dan 35 persen ke creator.

## Struktur

```
lumora-launchpad/
  contracts/        Smart contract Foundry (Solidity)
    src/
      LaunchpadToken.sol      Token ERC20 plus bonding curve dan fee split
      LaunchpadFactory.sol    Pabrik token dan registry untuk frontend
      interfaces/IUniswapV2.sol
    test/Launchpad.t.sol
    script/Deploy.s.sol
  web/              Frontend Next.js (App Router, Tailwind, wagmi, RainbowKit)
    app/            Landing, buat token, halaman trading
    components/     Navbar, Footer, TokenCard
    lib/            Konfigurasi wagmi, ABI, alamat kontrak
```

## Cara kerja fee

Setiap buy dan sell di kurva membayar fee 1 persen. Fee itu dibagi langsung di
dalam smart contract:

- 65 persen masuk ke alamat developer treasury (kamu)
- 35 persen masuk ke alamat creator token

Bagian developer diatur lewat `devTreasury` di `LaunchpadFactory`. Ganti alamat
ini ke wallet kamu sebelum deploy.

## Menjalankan smart contract

Butuh Foundry. Pasang dengan `curl -L https://foundry.paradigm.xyz | bash` lalu
`foundryup`.

```
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
forge build
forge test
```

Deploy ke Base Sepolia untuk testing. Panduan lengkap end to end ada di
`contracts/DEPLOY.md`. Cara cepat untuk playground testnet:

```
cp .env.example .env        # isi PRIVATE_KEY dan DEV_TREASURY
make install
make test
make deploy-testnet         # mock router plus target graduate 0.05 ETH
```

Catat alamat `LaunchpadFactory` yang tercetak. Masukkan ke web nanti.

## Menjalankan web

```
cd web
cp .env.example .env.local   # isi NEXT_PUBLIC_FACTORY_ADDRESS dan WalletConnect id
npm install
npm run dev
```

Buka http://localhost:3000

Untuk publikasi ke internet lewat Vercel, lihat `web/DEPLOY_VERCEL.md`.

## Catatan penting

Kontrak ini adalah titik awal yang solid, bukan versi siap mainnet. Sebelum
dipakai dengan dana sungguhan, lakukan review dan audit, uji parameter kurva
(`virtualEthReserve` dan `graduationEth`), dan pertimbangkan proteksi tambahan
seperti batas anti bot di awal launch.

## Langkah berikutnya yang disarankan

- Sambungkan landing dan halaman token ke pembacaan on chain (registry factory)
- Simpan deskripsi dan gambar token di penyimpanan off chain
- Tambah grafik harga real time dari event Buy dan Sell
- Halaman portofolio per wallet
