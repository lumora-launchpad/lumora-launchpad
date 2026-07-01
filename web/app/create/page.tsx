import { redirect } from "next/navigation";

// The instant launch form moved into the unified Launch page.
export default function CreateRedirect() {
  redirect("/launch");
}
