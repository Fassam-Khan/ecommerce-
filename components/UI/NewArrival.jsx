import NewArrivalSlider from "./NewArrivalSlider";
import { getNewArrivals } from "@/lib/product";

export default async function NewArrival() {
  const products = await getNewArrivals();

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold md:text-3xl">New In Store</h2>
      </div>

      <NewArrivalSlider products={products} />
    </section>
  );
}