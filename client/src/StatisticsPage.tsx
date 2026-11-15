import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Product } from "./types";

interface StatisticsPageProps {
  products: Product[];
  pharmacies: number;
}

export default function StatisticsPage({
  products,
  pharmacies,
}: StatisticsPageProps) {
  const categoryCounts = Object.entries(
    products.reduce<Record<string, number>>((counts, product) => {
      const category = product.category || "Other";
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {}),
  )
    .map(([category, count]) => ({ category, products: count }))
    .sort((a, b) => b.products - a.products);

  return (
    <div className="page-container statistics-page">
      <h1 className="page-title">Medicine statistics</h1>
      <p className="statistics-intro">
        A summary of medicines available in the catalog.
      </p>
      <div className="statistics-summary">
        <article>
          <span>Medicines</span>
          <strong>{products.length}</strong>
        </article>
        <article>
          <span>Categories</span>
          <strong>{categoryCounts.length}</strong>
        </article>
        <article>
          <span>Pharmacies</span>
          <strong>{pharmacies}</strong>
        </article>
      </div>
      <section
        className="statistics-chart"
        aria-labelledby="category-chart-title"
      >
        <h2 id="category-chart-title">Medicines by category</h2>
        <div className="statistics-chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryCounts}
              margin={{ top: 12, right: 20, bottom: 8, left: 0 }}
            >
              <CartesianGrid stroke="#e6eee9" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fill: "#5b6a61", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#5b6a61", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "#f3f8f5" }} />
              <Bar
                dataKey="products"
                name="Medicines"
                fill="#59b17a"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
