import Providers from './Providers';
import Header from '../shared/widgets';
import './global.css';
import { Poppins, Roboto } from 'next/font/google';
import Footer from '../shared/components/footer/Footer';

export const metadata = {
  title: 'Bazario',
  description: 'A Plateform for sales and purchace goods',
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '900'],
  variable: '--font-poppins'
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '900'],
  variable: '--font-roboto'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${roboto.variable}`}>
        <Providers>
          <Header />
          {children}
          <Footer/>
        </Providers>
      </body>
    </html>
  )
}
