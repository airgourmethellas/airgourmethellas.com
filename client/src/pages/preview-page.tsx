import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PreviewPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white shadow-md rounded-lg max-w-4xl mx-auto p-6">
        <div className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Air Gourmet Hellas - Price Preview</h1>
          <p className="text-gray-500">View our menu items with correct price formatting</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Menu Items</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Assorted bread rolls</p>
                <p className="text-sm text-gray-500">1 x €3.00</p>
              </div>
              <p className="font-medium">€3.00</p>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Bagels</p>
                <p className="text-sm text-gray-500">1 x €5.00</p>
              </div>
              <p className="font-medium">€5.00</p>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Greek sesame bagel (Koulouri)</p>
                <p className="text-sm text-gray-500">1 x €3.50</p>
              </div>
              <p className="font-medium">€3.50</p>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Premium Greek salad</p>
                <p className="text-sm text-gray-500">1 x €12.00</p>
              </div>
              <p className="font-medium">€12.00</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>€23.50</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Delivery Fee:</span>
            <span>€150.00</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>€173.50</span>
          </div>
        </div>

        <div className="mt-6 text-sm bg-blue-50 p-4 rounded-md">
          <p className="font-semibold text-blue-800 mb-2">Notice about price formatting:</p>
          <p className="text-blue-700">This page shows the correct price formatting with euros (€) and proper decimal placement (€3.00 instead of €300.00).</p>
        </div>

        <div className="mt-6 flex justify-center">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}