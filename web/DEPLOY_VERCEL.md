# Deploy the web app to Vercel

This web app is a Next.js app in the `web/` folder of the `lumora-launchpad`
repo. Because the repo holds two folders (`web` and `contracts`), the key is to
tell Vercel the project root is `web`.

There are two ways: through the dashboard with Git, or through the CLI without
Git.

## Required environment variables

All start with `NEXT_PUBLIC_` so they are read at build time. Set them all in
Vercel before the first build.

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_FACTORY_ADDRESS` | The deployed LaunchpadFactory address |
| `NEXT_PUBLIC_CHAIN_ID` | 84532 for Base Sepolia, 8453 for mainnet |
| `NEXT_PUBLIC_START_BLOCK` | Factory deploy block, for the price chart |
| `NEXT_PUBLIC_WALLETCONNECT_ID` | Project id from WalletConnect Cloud |

A WalletConnect id is free at https://cloud.walletconnect.com

## Option A. Through the dashboard with Git

1. Push the repo to GitHub, GitLab, or Bitbucket.

   ```
   cd /root/lumora-launchpad
   git init
   git add .
   git commit -m "Lumora launchpad"
   git branch -M main
   git remote add origin <your repo url>
   git push -u origin main
   ```

2. Open https://vercel.com then New Project and import that repo.

3. Important: under Root Directory choose `web`. Vercel detects Next.js
   automatically, so Build Command and Output can stay default.

4. Open Environment Variables and add the four variables from the table above.

5. Click Deploy. Once done you get a production URL.

## Option B. Through the CLI without Git

1. Install and log in.

   ```
   npm i -g vercel
   vercel login
   ```

2. From inside the web folder.

   ```
   cd /root/lumora-launchpad/web
   vercel
   ```

   When asked, answer:
   - Set up and deploy: yes
   - Scope: choose your account
   - Link to existing project: no
   - Project name: lumora
   - In which directory is your code: press enter since you are already in the web folder
   - Override settings: no

3. Set the environment variables, then deploy to production.

   ```
   vercel env add NEXT_PUBLIC_FACTORY_ADDRESS
   vercel env add NEXT_PUBLIC_CHAIN_ID
   vercel env add NEXT_PUBLIC_START_BLOCK
   vercel env add NEXT_PUBLIC_WALLETCONNECT_ID
   vercel --prod
   ```

## After deploying a new contract

If you redeploy the factory, update `NEXT_PUBLIC_FACTORY_ADDRESS` and
`NEXT_PUBLIC_START_BLOCK` in Vercel, then run a redeploy. Through the CLI just
run `vercel --prod`. Through the dashboard, change the env then click Redeploy.

## Notes

- `NEXT_PUBLIC_` variables go into the browser bundle, so do not put secrets
  there. Contract addresses and chain id are public, which is fine.
- The build runs a type check. If it fails, run `npm run build` locally first to
  see the message.
- For a custom domain, add it in the Domains menu of the Vercel project.
