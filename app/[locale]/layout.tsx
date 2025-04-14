import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import ClientProviders from '@/components/shared/client-providers'
import { getDirection } from '@/i18n-config'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { getSetting } from '@/lib/actions/setting.actions'
import { cookies } from 'next/headers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export async function generateMetadata() {
  const {
    site: { slogan, name, description, url },
  } = await getSetting()
  return {
    title: {
      template: `%s | ${name}`,
      default: `${name}. ${slogan}`,
    },
    description: description,
    metadataBase: new URL(url),
    icons: {
      icon: '/icons/logo.svg',
      apple: '/icons/logo.svg',
    },
  }
}

export default async function AppLayout({
  params,
  children,
}: {
  params: { locale: string }
  children: React.ReactNode
}) {
  let setting;
  let currency = 'INR';
  
  try {
    setting = await getSetting();
    const currencyCookie = (await cookies()).get('currency');
    currency = currencyCookie ? currencyCookie.value : setting?.defaultCurrency || 'INR';
  } catch (error) {
    console.error('Error loading settings:', error);
    // Use default settings if there's an error
    setting = {
      common: {
        pageSize: 10,
        isMaintenanceMode: false,
        freeShippingMinPrice: 0,
        defaultTheme: 'light',
        defaultColor: 'gold',
      },
      site: {
        name: 'Next.js Store',
        slogan: 'Your one-stop shop',
        description: 'An e-commerce store built with Next.js',
        url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://store.spacesautomation.com',
        logo: '/icons/logo.svg',
        email: 'support@store.spacesautomation.com',
        phone: '+1234567890',
        address: '123 Main St, City, Country',
        author: 'Next.js Store Team',
        copyright: `© ${new Date().getFullYear()} Next.js Store`,
        keywords: 'ecommerce, nextjs, shop, online store',
      },
      carousels: [
        {
          title: 'Welcome to our store',
          url: '/',
          image: '/images/carousel-1.jpg',
          buttonCaption: 'Shop Now',
        }
      ],
      availableDeliveryDates: [
        { 
          name: 'Standard Delivery',
          daysToDeliver: 2,
          shippingPrice: 5,
          freeShippingMinPrice: 50
        }
      ],
      availableLanguages: [{ name: 'English', code: 'en' }],
      defaultLanguage: 'en',
      availableCurrencies: [
        { 
          name: 'Indian Rupee', 
          code: 'INR', 
          symbol: '₹', 
          convertRate: 1 
        }
      ],
      defaultCurrency: 'INR',
      availablePaymentMethods: [
        { name: 'PayPal', commission: 0 },
        { name: 'Stripe', commission: 0 },
        { name: 'Cash On Delivery', commission: 0 },
      ],
      defaultPaymentMethod: 'PayPal',
      defaultDeliveryDate: new Date().toISOString(),
    };
  }

  const locale = params.locale;
  // Ensure that the incoming `locale` is valid
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  
  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error('Error loading messages:', error);
    messages = {};
  }

  return (
    <html
      lang={locale}
      dir={getDirection(locale) === 'rtl' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/icons/logo.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/logo.svg" />
      </head>
      <body
        className={`min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders setting={{ ...setting, currency }}>
            {children}
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
