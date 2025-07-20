import React from 'react';
import { Facebook, Twitter, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Description */}
          <div className="space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              Perfect ecommerce platform to start your business from scratch
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* My Account */}
          <div className="space-y-4">
            <h3 className="text-gray-800 font-semibold text-lg">My Account</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Track Orders
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Shipping
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Wishlist
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  My Account
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Order History
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <h3 className="text-gray-800 font-semibold text-lg">Information</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Latest News
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Talk To Us */}
          <div className="space-y-4">
            <h3 className="text-gray-800 font-semibold text-lg">Talk To Us</h3>
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">Got Questions? Call us</p>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-gray-500" />
                <span className="text-gray-800 font-semibold">+670 413 90 762</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-gray-500" />
                <a href="mailto:support@eshop.com" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  support@eshop.com
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="text-gray-500 mt-1" />
                <div className="text-gray-600 text-sm">
                  <p>79 Sleepy Hollow St.</p>
                  <p>Jamaica, New York 11432</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            © 2024 eShop. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;