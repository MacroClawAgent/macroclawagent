import { redirect } from "next/navigation";

export default function BlogSlugPage({ params }: { params: { slug: string } }) {
  redirect(`/learn/${params.slug}`);
}
