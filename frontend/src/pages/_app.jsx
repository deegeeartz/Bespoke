import '@/styles/index.css';
import 'react-toastify/dist/ReactToastify.min.css';
import { Poppins } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import { AuthProvider } from '@/context/AuthProvider';

const font = Poppins({ weight: ['300', '400', '500', '600', '700'], subsets: ['latin'] });

export default function App({ Component, pageProps }) {
	return (
		<div className={font.className}>
			<Head>
				<title>Bespoke Audits</title>
				<link rel='icon' href='/icon.png' type='image/PNG' />
			</Head>

			<AuthProvider>
				<Component {...pageProps} />
			</AuthProvider>

			<ToastContainer closeOnClick pauseOnFocusLoss={false} />
		</div>
	);
}
