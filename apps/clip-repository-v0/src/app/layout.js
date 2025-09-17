import './globals.css';
import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { AllContextProviders } from '@/contextapi/AllContextProviders';
const inter = Inter({ subsets: ['latin'] });
export const metadata = {
  title: 'R2R_LM App',
  description: 'R2R_LM app',
  keywords: 'R2R_LM app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white overflow-hidden`}>
        <AllContextProviders>
          <div>
            {/* <header>
              <div className="wrapper">
                <nav className="bg-gray-50 dark:bg-gray-700">
                  <div className="max-w-screen-xl px-4 py-3 mx-auto">
                    <div className="flex items-center">
                      <ul className="flex flex-row font-medium mt-0 mr-6 space-x-8 text-sm">
                        <li>
                          <Link
                            className="text-gray-900 dark:text-white hover:underline"
                            href="/"
                          >
                            Home
                          </Link>
                        </li>
                        <li>
                          <Link
                            className="text-gray-900 dark:text-white hover:underline"
                            href="/dashboard"
                          >
                            Dashboard
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </nav>
              </div>
            </header> */}
            {children}
          </div>
          <ToastContainer />
        </AllContextProviders>
      </body>
    </html>
  );
}
