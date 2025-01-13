import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';

const Page404 = () => {
	const [backLink, setbackLink] = useState('/');

	useEffect(() => {
		const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;
		const link = user?.role ? `/${user.role.toLowerCase()}` : '/';
		setbackLink(link);
	}, []);

	return (
		<main className='h-[100vh] fx_center'>
			<section className='bg-white dark:bg-gray-900'>
				<div className='py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6'>
					<div className='mx-auto max-w-screen-sm text-center'>
						<h1 className='mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600'>404</h1>
						<p className='mb-4 text-lg font-light text-gray-500 '>
							Sorry, we could not find the page you are looking for.
						</p>

						<Link
							href={backLink}
							className='inline-flex text-white bg-gray-900 hover:bg-primary-800 focus:ring-0 focus:outline-none focus:ring-gray-900 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-4'>
							Back to Home
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
};

export default Page404;
