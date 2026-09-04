import type { AnchorHTMLAttributes } from "react";

// Full-page navigation avoids Vinext's failing production client router.
// Both prototype routes remain reachable before hydration as well.
export default function SiteLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  // eslint-disable-next-line @next/next/no-html-link-for-pages
  return <a {...props} />;
}
