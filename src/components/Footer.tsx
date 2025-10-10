import Link from 'next/link';
import { useConfig } from '@/adapters/external/Provider';
import { Send, Instagram, MessageSquare, Twitter, Mail } from 'lucide-react';
import { FaDiscord, FaWhatsapp, FaTiktok } from 'react-icons/fa';

export function Footer() {
  const { common } = useConfig();
  const appName = common.app.name;
  const year = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'WhatsApp',
      url: 'https://wa.me/message/BXGMZ4HV5M32K1',
      icon: FaWhatsapp,
    },
    {
      name: 'Telegram',
      url: 'https://t.me/lazytax',
      icon: Send,
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/lazytax.club/',
      icon: Instagram,
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@lazytaxclub',
      icon: FaTiktok,
    },
    {
      name: 'Reddit',
      url: 'https://www.reddit.com/user/ContactSensitive5524/',
      icon: MessageSquare,
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/lazytaxclub',
      icon: Twitter,
    },
    {
      name: 'Discord',
      url: 'https://discord.gg/T7AtTQXr',
      icon: FaDiscord,
    },
    {
      name: 'Email',
      url: 'mailto:support@lazytax.club',
      icon: Mail,
    },
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90">
      <div className="container mx-auto px-4 py-10">
        <div className="space-y-8">
          {/* Company Info */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{appName}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">60 PAYA LEBAR ROAD, #07-54, PAYA LEBAR SQUARE</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">SINGAPORE 409051</p>
          </div>

          {/* Social Media & Contact */}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Connect with us</p>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{social.name}</span>
                </a>
              ))}
            </div>
            <div className="flex justify-center items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <a
                href="mailto:support@lazytax.club"
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                support@lazytax.club
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <nav aria-label="Legal" className="text-center">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
              <li>
                <Link
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                  href="/blog"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                  href="/#faq"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                  href="/legal"
                >
                  Legal Documents
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                  href="/legal/privacy"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                  href="/legal/terms"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                  href="/legal/refund"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </nav>

          {/* Copyright */}
          <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              © {year} {appName}. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Registered business in Singapore</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
