import Link from 'next/link';
import { Factory, Linkedin, Youtube, Facebook, Twitter, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">Industrial Solutions</div>
                <div className="text-xs text-gray-400">Packaging & Automation</div>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Global leader in industrial packaging automation. We engineer reliable, efficient, and custom solutions for your production line.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Products Catalog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-6">Products & Services</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/products?category=Coil%20Packing%20Machine" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Coil Packing Machines
                </Link>
              </li>
              <li>
                <Link href="/products?category=Stretch%20Wrapping%20Machine" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Stretch Wrappers
                </Link>
              </li>
              <li>
                <Link href="/products?category=Automatic%20Packing%20Line" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Automation Lines
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Custom Engineering
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-6">Support</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Technical Support
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Spare Parts
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-gray-400 hover:bg-red-600 hover:text-white transition-all">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-gray-400 hover:bg-blue-500 hover:text-white transition-all">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-gray-400 hover:bg-sky-500 hover:text-white transition-all">
              <Twitter className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright & Language */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors">
              <Globe className="w-4 h-4" />
              Change language
            </button>
            <p className="text-gray-500 text-sm">
              © 2024 Industrial Packaging Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}




