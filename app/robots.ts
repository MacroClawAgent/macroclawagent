import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/features", "/about", "/join", "/learn", "/faq", "/changelog", "/privacy", "/terms"],
        disallow: ["/dashboard", "/profile", "/onboarding", "/settings", "/nutrition", "/activities", "/meal-plans", "/agent", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://jonnoai.com/sitemap.xml",
  };
}
