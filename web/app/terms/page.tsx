import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Lumora",
  description: "Terms of Service for Lumora.",
};

const SECTIONS: { h: string; p: string }[] = [
  {
    h: "1. Acceptance of terms",
    p: "By accessing or using Lumora you agree to these Terms of Service. If you do not agree, do not use the platform. These terms apply to everyone who uses the interface, creates a token, runs a campaign, or trades.",
  },
  {
    h: "2. Nature of the service",
    p: "Lumora is a non custodial interface to smart contracts on Base. You interact with the contracts directly from your own wallet. Lumora does not hold your funds, does not act as a broker or exchange, and cannot reverse, refund, or recover transactions once they are confirmed on chain.",
  },
  {
    h: "3. Eligibility and platform usage",
    p: "You must be legally able to enter into these terms and to use the platform where you live. You agree to use Lumora only for lawful purposes and in line with these terms. Access may change or be discontinued at any time without notice.",
  },
  {
    h: "4. User responsibilities",
    p: "You are responsible for your wallet, your keys, the transactions you sign, and the accuracy of anything you submit. You are responsible for verifying contract addresses and for any tax or reporting obligations that result from your activity. Keep your seed phrase and private keys secret. Lumora staff will never ask for them.",
  },
  {
    h: "5. Token launch responsibilities",
    p: "If you create a token or run a campaign, you are solely responsible for it, including its name, ticker, description, images, links, and any claims or promises you make about it. You must not misrepresent a token, impersonate others, or infringe anyone's rights. You are responsible for compliance with the laws that apply to your launch.",
  },
  {
    h: "6. Prohibited activities",
    p: "You must not use Lumora for fraud, market manipulation, money laundering, financing of illegal activity, infringement of intellectual property, or any unlawful purpose. You must not attempt to attack, exploit, or disrupt the platform or its contracts, or use it to harm others.",
  },
  {
    h: "7. Intellectual property",
    p: "The Lumora name, branding, and interface are the property of their owners. The smart contracts are open source under their stated license. Content you submit remains your responsibility, and by submitting it you confirm you have the right to use it and grant Lumora the right to display it in the interface.",
  },
  {
    h: "8. Risk disclosure",
    p: "Tokens launched on Lumora are highly speculative and can lose all of their value. Smart contracts may contain bugs. The platform is provided as is and as available, without warranties of any kind. The contracts are not audited and are currently running on a testnet. Nothing here is investment, financial, legal, or tax advice. Use at your own risk.",
  },
  {
    h: "9. Limitation of liability",
    p: "To the maximum extent permitted by law, Lumora and its contributors are not liable for any loss or damage arising from your use of the platform, including lost funds, lost tokens, failed or reverted transactions, smart contract bugs, network issues, or the actions of token creators or other users.",
  },
  {
    h: "10. Wallet usage",
    p: "Connecting a wallet shares your public address so the app can read balances and prepare transactions. It never lets the app move funds without your signature. You are responsible for keeping your wallet secure and for every transaction you approve.",
  },
  {
    h: "11. Dispute resolution",
    p: "Because Lumora is a non custodial interface, it cannot mediate trades or recover funds. Disputes about a specific token are between the people involved. To the extent these terms create any dispute, you agree to resolve it individually and not as part of a class action, where permitted by law.",
  },
  {
    h: "12. Changes to these terms",
    p: "These terms may be updated. Material changes will be reflected by the date below. Continued use after a change means you accept the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <h1 className="text-4xl font-black tracking-tight">Terms of Service</h1>
      <p className="mt-3 text-slate-500">Last updated 2026.</p>
      <div className="mt-10 space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-bold text-slate-800">{s.h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
