import Link from "next/link";
import { ArrowUpRight, Box, Image as ImageIcon, Users, Activity, Clock } from "lucide-react";
import { prisma } from "@/src/server/db/prisma"; // Adjust based on your actual db connection

async function getStats() {
  try {
    const productsCount = await prisma.product.count();
    const categoriesCount = await prisma.category.count();
    const colorsCount = await prisma.color.count();
    const galleryCount = await prisma.galleryImage.count();

    return {
      products: productsCount,
      categories: categoriesCount,
      colors: colorsCount,
      gallery: galleryCount,
    };
  } catch (error) {
    return {
      products: 0,
      categories: 0,
      colors: 0,
      gallery: 0,
    };
  }
}

async function getRecentActivity() {
  try {
    const recentProducts = await prisma.product.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        nameEn: true,
        updatedAt: true,
      },
    });
    return recentProducts;
  } catch (error) {
    return [];
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const recentActivity = await getRecentActivity();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground">
          Welcome to the Al-Tayyar Admin Dashboard. Monitor your business activity here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Products", value: stats.products, icon: Box, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Total Categories", value: stats.categories, icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
          { title: "Leather Colors", value: stats.colors, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Gallery Images", value: stats.gallery, icon: ImageIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-card border border-border rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h2 className="text-3xl font-bold text-foreground mt-1">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <div className="col-span-4 p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Activity</h3>
            <Link href="/admin/products" className="text-sm text-primary flex items-center hover:underline">
              View all <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              <ul className="divide-y divide-border/50">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="py-3 flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Product Updated</p>
                      <p className="text-xs text-muted-foreground">{activity.nameEn}</p>
                    </div>
                    <div className="ms-auto text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(activity.updatedAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 border border-border/50 rounded-lg text-sm text-muted-foreground bg-muted/20">
                No recent activity found. Start managing your products!
              </div>
            )}
          </div>
        </div>

        <div className="col-span-3 p-6 bg-card border border-border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-3">
            {[
              { label: "Add New Product", href: "/admin/products/new" },
              { label: "Manage Categories", href: "/admin/categories" },
              { label: "Upload Gallery Image", href: "/admin/gallery" },
              { label: "Contact Settings", href: "/admin/settings" },
            ].map((link, i) => (
              <li key={i}>
                <a href={link.href} className="group flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted transition-colors">
                  <span className="font-medium text-foreground">{link.label}</span>
                  <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
