import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Car, 
  MapPin, 
  DollarSign, 
  Users, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Zap,
  ChevronRight,
  Play,
  Star,
  TrendingUp,
  Globe,
  Menu,
  X,
  LogOut
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const features = [
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: "Real-Time GPS Tracking",
      description: "Monitor your fleet 24/7 with precision GPS tracking and geofencing alerts"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-600" />,
      title: "Automated Payments",
      description: "Seamless weekly rental collection with PayFast, Ozow, and bank integrations"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Driver Marketplace",
      description: "Connect verified drivers with available vehicles through our matching system"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Performance Analytics",
      description: "Deep insights into earnings, vehicle utilization, and driver performance"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Insurance & Compliance",
      description: "Integrated insurance management and SA regulatory compliance tools"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Smart Automation",
      description: "Maintenance reminders, document management, and workflow automation"
    }
  ];

  const stats = [
    { number: "500+", label: "Active Fleet Owners", trend: "+25%" },
    { number: "2,800+", label: "Registered Drivers", trend: "+18%" },
    { number: "R12.5M", label: "Monthly Transactions", trend: "+32%" },
    { number: "98.7%", label: "Uptime Reliability", trend: "+0.3%" }
  ];

  const testimonials = [
    {
      name: "Thabo Mokoena",
      role: "Fleet Owner, Johannesburg",
      image: "https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      quote: "FleetLink transformed my business. I went from managing 3 cars manually to running a 15-vehicle fleet efficiently."
    },
    {
      name: "Sarah Nkomo",
      role: "Uber Driver, Cape Town",
      image: "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      quote: "Finding quality vehicles was always a struggle. Now I have access to well-maintained cars with transparent terms."
    },
    {
      name: "Ahmed Hassan",
      role: "Fleet Owner, Durban",
      image: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      quote: "The automated payments and real-time tracking saved me 20 hours per week. My ROI increased by 40%."
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg fixed w-full z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                FleetLink
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Pricing</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">About</a>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/dashboard" 
                    className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                    Sign In
                  </Link>
                  <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">Pricing</a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">About</a>
                {user ? (
                  <>
                    <Link to="/dashboard" className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-2 rounded-full mx-4 font-medium text-center">
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">
                      Sign In
                    </Link>
                    <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-2 rounded-full mx-4 font-medium text-center">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium">
                <Globe className="w-4 h-4 mr-2" />
                Built for South Africa's Ride-Hailing Market
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Scale Your 
                <span className="bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent block">
                  Fleet Business
                </span>
                with Confidence
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                The complete platform for fleet owners and drivers in South Africa. 
                Manage rentals, track vehicles, automate payments, and grow your business 
                with intelligent insights and local market expertise.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link to="/dashboard" className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-8 py-4 rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-lg flex items-center justify-center">
                    Go to Dashboard
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-8 py-4 rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-lg flex items-center justify-center">
                      Start Free Trial
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Link>
                    <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-200 font-semibold text-lg flex items-center justify-center">
                      <Play className="w-5 h-5 mr-2" />
                      Watch Demo
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 transform rotate-3 shadow-2xl">
                <div className="bg-white rounded-xl p-6 transform -rotate-3">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Fleet Dashboard</h3>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">24</div>
                        <div className="text-sm text-gray-600">Active Vehicles</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">R89,240</div>
                        <div className="text-sm text-gray-600">Monthly Revenue</div>
                      </div>
                    </div>
                    <div className="h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-end justify-around p-2">
                      <div className="w-4 bg-blue-500 rounded-t" style={{height: '60%'}}></div>
                      <div className="w-4 bg-purple-500 rounded-t" style={{height: '80%'}}></div>
                      <div className="w-4 bg-blue-500 rounded-t" style={{height: '45%'}}></div>
                      <div className="w-4 bg-purple-500 rounded-t" style={{height: '90%'}}></div>
                      <div className="w-4 bg-blue-500 rounded-t" style={{height: '70%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 mb-2">{stat.label}</div>
                <div className="flex items-center justify-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to 
              <span className="bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From real-time tracking to automated payments, FleetLink provides all the tools 
              you need to manage and grow your fleet business efficiently.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:scale-105">
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Fleet Owners Across 
              <span className="bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent"> South Africa</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl shadow-lg">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Fleet Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join hundreds of successful fleet owners who've scaled their operations with FleetLink. 
            Start your free trial today and see the difference intelligent fleet management makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard" className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-bold text-lg">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-bold text-lg">
                  Start Free Trial
                </Link>
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 font-bold text-lg">
                  Schedule Demo
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">FleetLink</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                South Africa's leading fleet management platform, connecting vehicle owners 
                with drivers in the ride-hailing economy.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Mobile App</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">© 2025 FleetLink. All rights reserved. Made with ❤️ in South Africa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;