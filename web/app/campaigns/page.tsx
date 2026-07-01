import { redirect } from "next/navigation";

// The demand campaign form moved into the unified Launch page, and campaign
// discovery moved to Explore.
export default function CampaignsRedirect() {
  redirect("/launch");
}
