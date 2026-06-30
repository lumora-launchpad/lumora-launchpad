import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Lumora",
  description: "Privacy Policy for Lumora.",
};

const SECTIONS: { h: string; p: string }[] = [
  {
    h: "Overview",
    p: "Lumora is a non custodial app. We do not require an account, an email, or a personal identity to use it. This policy explains what limited information is involved when you use the interface and how it is handled.",
  },
  {
    h: "Information we collect",
    p: "We do not collect names, emails, or government identifiers. Your wallet address and your on chain activity are public on the Base blockchain by nature, not because Lumora collects them. Optional token descriptions, images, and comments you choose to submit are stored so they can be shown in the interface.",
  },
  {
    h: "Wallet connections",
    p: "Connecting a wallet shares your public address with the app so it can read balances and prepare transactions. It never gives the app the ability to move funds without your signature, and we never receive your seed phrase or private keys.",
  },
  {
    h: "Analytics",
    p: "If analytics are used, they are limited to aggregate, privacy respecting usage metrics that help improve the interface. They are not used to identify individuals.",
  },
  {
    h: "Cookies",
    p: "The app uses only the storage it needs to function, such as remembering your wallet connection and interface preferences in your browser. It does not use advertising or cross site tracking cookies.",
  },
  {
    h: "Third party services",
    p: "To function, the app talks to public RPC endpoints, a WalletConnect relay, the block explorer, and image or content delivery services. These third parties may see network level information such as IP addresses as part of normal operation, under their own privacy policies.",
  },
  {
    h: "Data retention",
    p: "Off chain content you submit, such as descriptions, images, and comments, is retained so it can keep displaying in the interface and is associated with the relevant token and wallet address. On chain data is permanent and cannot be deleted by anyone, including us.",
  },
  {
    h: "Your rights and control",
    p: "You can stop using the app at any time and disconnect your wallet. Because the blockchain is permanent, on chain data and content already published cannot be removed. Do not submit anything off chain that you consider private.",
  },
  {
    h: "Contact",
    p: "For privacy related requests or questions, open an issue on the GitHub repository linked in the footer, or use the contact option on the support page.",
  },
  {
    h: "Changes to this policy",
    p: "This policy may be updated. Material changes will be reflected by the date below.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
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
