import React from 'react';
import { Link } from 'wouter';
import { Twitter, Facebook, Instagram, Linkedin, Github, Mail, Map, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#131313] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Inmobi</h3>
            <p className="text-gray-300 mb-4">
              Your trusted partner in finding your perfect property.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-gray-300 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://facebook.com" className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" className="text-gray-300 hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://linkedin.com" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-300 hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/spatial-search" className="text-gray-300 hover:text-white transition-colors">
                  Map Search
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-gray-300 hover:text-white transition-colors">
                  Premium
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-gray-300 hover:text-white transition-colors">
                  Sign Up / Login
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Premium Features</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">
                Bulk Property Upload
              </li>
              <li className="text-gray-300">
                Advanced Analytics
              </li>
              <li className="text-gray-300">
                Featured Listings
              </li>
              <li className="text-gray-300">
                AI Property Recommendations
              </li>
              <li className="text-gray-300">
                Priority Support
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Map size={16} className="text-gray-300 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  1234 Real Estate Ave, Property City, PC 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="text-gray-300 mr-2 flex-shrink-0" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="text-gray-300 mr-2 flex-shrink-0" />
                <span className="text-gray-300">contact@inmobi.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Inmobi. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <a 
              href="https://github.com/yourgithub/inmobi" 
              className="flex items-center hover:text-white transition-colors"
            >
              <Github size={14} className="mr-1" />
              <span>Source Code</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}