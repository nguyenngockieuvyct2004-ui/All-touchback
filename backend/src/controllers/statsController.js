import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

export async function basicStats(_req, res) {
  const [users, products, orders, sales] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $in: ["paid", "shipped", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);
  res.json({
    users,
    products,
    orders,
    revenue: sales?.[0]?.total || 0,
  });
}

export async function dashboardStats(_req, res) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1); // last 12 months
  const [
    users,
    products,
    ordersCount,
    revenueAgg,
    byMonth,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $in: ["paid", "shipped", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: { name: "$items.name" },
          quantity: { $sum: "$items.quantity" },
          amount: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]),
    Order.find({}, { items: 0 }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  res.json({
    summary: {
      users,
      products,
      orders: ordersCount,
      revenue: revenueAgg?.[0]?.total || 0,
    },
    byMonth: byMonth.map((d) => ({
      year: d._id.y,
      month: d._id.m,
      revenue: d.revenue,
      orders: d.orders,
    })),
    topProducts: topProducts.map((p) => ({
      name: p._id.name,
      quantity: p.quantity,
      amount: p.amount,
    })),
    recentOrders,
  });
}
