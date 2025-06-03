import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Menu, Plane, Clock, Shield, Star } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div style={{
                backgroundColor: '#ffffff',
                display: 'inline-block',
                boxShadow: 'none',
                border: 'none',
                outline: 'none',
                padding: '8px',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <img 
                  src="/logo.png" 
                  alt="Air Gourmet Hellas Logo" 
                  style={{
                    width: '200px',
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    border: '0',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/menu">
                <Button variant="outline" className="flex items-center gap-2">
                  <Menu className="h-4 w-4" />
                  View Menu
                </Button>
              </Link>
              
              <a 
                href="https://www.airgourmet.gr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Visit Our Website
                <ExternalLink className="h-4 w-4" />
              </a>
              
              <Link href="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Sign In
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Plane className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Premium Flight
            <span className="text-blue-600"> Catering Services</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Excellence in aviation catering across Thessaloniki (SKG) and Mykonos (JMK). 
            Delivering exceptional culinary experiences for private aviation and commercial flights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/menu">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                <Menu className="mr-2 h-5 w-5" />
                Browse Our Menu
              </Button>
            </Link>
            
            <a 
              href="https://www.airgourmet.gr/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                <ExternalLink className="mr-2 h-5 w-5" />
                Visit airgourmet.gr
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Clock className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle>24/7 Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Round-the-clock availability to meet your flight catering needs, 
                ensuring timely service for all departure schedules.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle>Aviation Standards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Certified and compliant with international aviation catering standards, 
                ensuring safety and quality in every service.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Star className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle>Premium Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Using only the finest ingredients and expert culinary techniques 
                to deliver exceptional dining experiences at altitude.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Locations Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Locations</h2>
            <p className="text-xl text-gray-600">Serving premium aviation catering across Greece</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Thessaloniki (SKG)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Full-service catering facility serving Thessaloniki International Airport 
                  and surrounding aviation operations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Mykonos (JMK)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Specialized catering services for Mykonos Airport, supporting 
                  luxury private aviation and seasonal flight operations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-4 left-4 right-4">
        <div className="bg-white rounded-lg shadow-lg border p-4">
          <div className="flex justify-between items-center">
            <Link href="/menu">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                Menu
              </Button>
            </Link>
            
            <a 
              href="https://www.airgourmet.gr/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Website
              </Button>
            </a>
            
            <Link href="/auth">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 Air Gourmet Hellas. Premium aviation catering services.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <a 
              href="https://www.airgourmet.gr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
            >
              www.airgourmet.gr
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}