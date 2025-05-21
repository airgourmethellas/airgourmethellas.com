import StatsCards from "@/components/admin/stats-cards";
import UpcomingOrders from "@/components/admin/upcoming-orders";
import KitchenPrep from "@/components/admin/kitchen-prep";
import RecentActivity from "@/components/admin/recent-activity";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Dashboard content */}
      <div className="space-y-8">
        {/* Stats cards */}
        <StatsCards />
        
        {/* Upcoming orders */}
        <UpcomingOrders />
        
        {/* Kitchen preparation */}
        <KitchenPrep />
        
        {/* Recent activity */}
        <RecentActivity />
      </div>
    </div>
  );
}
