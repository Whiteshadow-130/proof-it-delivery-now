
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Package, Shield, QrCode, Truck, BarChart } from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-brand-blue text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Proof-It</h1>
          <div className="space-x-2">
            <Link to="/login">
              <Button variant="outline" className="text-white border-white hover:bg-white/10">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-brand-accent hover:bg-blue-600">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-blue to-blue-900 text-white py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Secure Delivery Verification</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            Protect your business with video proof of delivery. Generate QR codes for your packages and receive video evidence when customers receive them.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-brand-orange hover:bg-orange-600 text-white px-8 py-6 text-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-brand-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate QR Codes</h3>
              <p className="text-gray-600">Create unique QR codes for each shipment directly from your dashboard.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-brand-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Capture Video Proof</h3>
              <p className="text-gray-600">Customers scan the QR and record a video of their unboxing experience.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-brand-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
              <p className="text-gray-600">Videos are securely stored and linked to your orders for future reference.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits for Your Business</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <Package className="h-6 w-6 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Reduce Returns and Disputes</h3>
                <p className="text-gray-600">
                  With video proof of delivery, reduce false claims and easily resolve disputes with evidence.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <Truck className="h-6 w-6 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Streamline Your Logistics</h3>
                <p className="text-gray-600">
                  Integrate with your current shipping process with minimal changes to your workflow.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <Shield className="h-6 w-6 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Build Customer Trust</h3>
                <p className="text-gray-600">
                  Show your commitment to transparency and quality service with verifiable deliveries.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <BarChart className="h-6 w-6 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
                <p className="text-gray-600">
                  Get insights on delivery performance and customer satisfaction with detailed reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose the plan that works best for your business needs. All plans include secure video storage and access to the dashboard.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-4xl font-bold mb-6">₹499<span className="text-sm text-gray-500">/month</span></p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> 100 video uploads
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> 30-day video storage
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Basic reporting
                </li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-brand-accent relative">
              <div className="absolute top-0 right-0 bg-brand-accent text-white px-4 py-1 text-sm font-bold rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Professional</h3>
              <p className="text-4xl font-bold mb-6">₹999<span className="text-sm text-gray-500">/month</span></p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> 250 video uploads
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> 90-day video storage
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Advanced reporting
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Email notifications
                </li>
              </ul>
              <Button className="w-full bg-brand-accent hover:bg-blue-600">Get Started</Button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <p className="text-4xl font-bold mb-6">₹1999<span className="text-sm text-gray-500">/month</span></p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> 600 video uploads
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> 1-year video storage
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Custom reporting
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> API access
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> White labeling
                </li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-brand-blue text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to secure your deliveries?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust Proof-It for their delivery verification needs.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-brand-blue hover:bg-gray-100 px-8">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Proof-It</h3>
              <p className="text-gray-400">Secure delivery verification for e-commerce and logistics businesses.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>QR Code Generation</li>
                <li>Video Proofs</li>
                <li>Secure Storage</li>
                <li>Analytics</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>support@proof-it.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Proof-It. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
