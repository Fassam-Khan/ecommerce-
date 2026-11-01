import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollectionProducts } from "@/lib/product";
import CollectionProducts from "@/components/UI/CollectionsProducts";

const PAGE_SIZE = 12;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getCollectionProducts(slug, { limit: 1 });
  return { title: data?.category?.title || "Collection" };
}

export default async function CollectionPage({ params }) {
  const { slug } = await params;

  // Pehla page server par render hota hai (SEO + fast first load)
  const data = await getCollectionProducts(slug, {
    page: 1,
    limit: PAGE_SIZE,
    includeFacets: true,
  });

  if (!data) notFound();

  return (
    <section className="  px-4 py-6">
      <nav className="text-sm text-gray-500 mb-3" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{data.category.title}</span>
      </nav>

      <h1 className="text-2xl font-bold md:text-3xl">{data.category.title}</h1>

      {data.category.description && (
        <p className="mt-2  text-sm text-gray-600">
          {data.category.description}
        </p>
      )}

      <CollectionProducts slug={slug} initialData={data} pageSize={PAGE_SIZE} />
    </section>
  );
}