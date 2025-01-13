import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';

const GuestLayout = ({ children }) => {
	const router = useRouter();
	const { user } = useAuth();

	useEffect(() => {
		if (user && user?.role) {
			router.push(`/${user.role.toLowerCase()}`);
		}
	}, [user, router]);

	return (
		<>
			<Head>
				<title>Bespoke Audits</title>
			</Head>

			<main>{children}</main>
		</>
	);
};

export default GuestLayout;
