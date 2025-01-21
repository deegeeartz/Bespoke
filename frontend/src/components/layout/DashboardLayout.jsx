import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
	RiArrowDropRightLine,
	RiBook2Line,
	RiBookmark3Line,
	RiHome4Line,
	RiMenuLine,
	RiSettings3Line,
	RiUserSearchLine,
	RiUserStarLine,
} from 'react-icons/ri';
import { FaUserCircle } from 'react-icons/fa';
import { Dropdown } from 'flowbite-react';
import { useAuth } from '@/context/AuthProvider';
import Cookies from 'js-cookie';

const Layout = ({ children }) => {
	const router = useRouter();
	const { user, setUser, logout } = useAuth();
	const { pathname } = router;
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		const userData = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;

		// Role Authorization
		if (userData) {
			setUser(userData);
			if (userData.role === 'ADMIN') {
				return; // Admin has access to all routes
			}

			if (userData.role !== 'ADMIN' && pathname.includes('/admin')) {
				router.push(`/${userData.role.toLowerCase()}`);
			}
			if (userData.role !== 'INSPECTOR' && pathname.includes('/inspector')) {
				router.push(`/${userData.role.toLowerCase()}`);
			}
			if (userData.role !== 'CLIENT' && pathname.includes('/client')) {
				router.push(`/${userData.role.toLowerCase()}`);
			}
		} else {
			setUser(null);
			router.push('/');
		}
	}, [router]);

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	function toggleFullscreen() {
		if (document.fullscreenElement) {
			// If already in fullscreen, exit fullscreen
			document.exitFullscreen();
		} else {
			// If not in fullscreen, request fullscreen
			document.documentElement.requestFullscreen();
		}
	}

	const getHeaderText = () => {
		let breadcrumb = pathname.split('/').filter(Boolean); // Filter out empty strings
		if (breadcrumb[1] == '[id]') breadcrumb[1] = 'New';
		if (pathname.includes('edit')) breadcrumb[1] = 'Edit';
		// console.log(pathname, breadcrumb);
		return breadcrumb;
	};

	return (
		<>
			<Head>
				<title>Bespoke Audits</title>
			</Head>

			{/* SIDEBAR */}
			<div
				className={`fixed md:-translate-x-0 left-0 top-0 w-64 h-full bg-[#fff] p-4 z-50 transition-transform border-r border-gray-200 ${
					sidebarOpen ? '-translate-x-0' : '-translate-x-full'
				}`}>
				<Link href='/' className='flex items-center pb-5'>
					<img src='/logo.png' alt='Logo' className='w-[80px] mx-auto' />
				</Link>

				<ul className='mt-4'>
					{user?.role == 'ADMIN' && (
						<>
							<li className={`mb-1 group ${pathname === '/admin' ? 'active' : ''}`}>
								<Link
									href='/admin'
									className={`pl-2 flex font-semibold items-center py-3 text-gray-900 hover:bg-gray-800 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white`}>
									<RiHome4Line className='mr-3 text-lg' />
									<span className='text-sm'>Dashboard</span>
								</Link>
							</li>

							<li className={`mb-1 group ${pathname === '/admin/surveys' ? 'active' : ''}`}>
								<Link
									href='/admin/surveys'
									className={`pl-2 flex font-semibold items-center py-3 text-gray-900 hover:bg-gray-800 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white`}>
									<RiBook2Line className='mr-3 text-lg' />
									<span className='text-sm'>Manage Surveys</span>
								</Link>
							</li>

							<li className={`mb-1 group ${pathname === '/admin/clients' ? 'active' : ''}`}>
								<Link
									href='/admin/clients'
									className={`pl-2 flex font-semibold items-center py-3 text-gray-900 hover:bg-gray-800 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white`}>
									<RiUserStarLine className='mr-3 text-lg' />
									<span className='text-sm'>Manage Clients</span>
								</Link>
							</li>

							<li className={`mb-1 group ${pathname === '/admin/inspectors' ? 'active' : ''}`}>
								<Link
									href='/admin/inspectors'
									className={`pl-2 flex font-semibold items-center py-3 text-gray-900 hover:bg-gray-800 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white`}>
									<RiUserSearchLine className='mr-3 text-lg' />
									<span className='text-sm'>Manage Inspectors</span>
									<i className='ri-arrow-right-s-line ml-auto group-[.selected]:rotate-90' />
								</Link>
							</li>

							<li className={`mb-1 group ${pathname === '/admin/inspectors/internal' ? 'active' : ''}`}>
								<Link
									href='/admin/inspectors/internal'
									className={`pl-2 flex font-semibold items-center py-3 text-gray-900 hover:bg-gray-800 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white`}>
									<RiUserSearchLine className='mr-3 text-lg' />
									<span className='text-sm'>Manage Inspectors (Internal)</span>
									<i className='ri-arrow-right-s-line ml-auto group-[.selected]:rotate-90' />
								</Link>
							</li>

							<li className={`mb-1 group ${pathname === '/admin/settings' ? 'active' : ''}`}>
								<Link
									href='/admin/settings'
									className={`pl-2 flex font-semibold items-center py-3 text-gray-900 hover:bg-gray-800 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white`}>
									<RiSettings3Line className='mr-3 text-lg' />
									<span className='text-sm'>Settings</span>
									<i className='ri-arrow-right-s-line ml-auto group-[.selected]:rotate-90' />
								</Link>
							</li>
						</>
					)}

					{user?.role == 'INSPECTOR' && (
						<>
							<li className={`mb-1 group ${pathname === '/inspector' ? 'active' : ''}`}>
								<Link
									href='/inspector'
									className={`pl-2 flex font-semibold items-center py-3 text-gray-900 hover:bg-gray-800 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white`}>
									<RiHome4Line className='mr-3 text-lg' />
									<span className='text-sm'>Dashboard</span>
								</Link>
							</li>

							<li className={`mb-1 group ${pathname === '/inspector/surveys' ? 'active' : ''}`}>
								<Link
									href='/inspector/surveys'
									className={`pl-2 flex font-semibold items-center py-3 text-gray-900 hover:bg-gray-800 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white`}>
									<RiBook2Line className='mr-3 text-lg' />
									<span className='text-sm'>Surveys</span>
								</Link>
							</li>
						</>
					)}

					{user?.role == 'CLIENT' && (
						<>
							<li className={`mb-1 group ${pathname === '/client' ? 'active' : ''}`}>
								<Link
									href='/client'
									className={`pl-2 flex font-semibold items-center py-3 text-gray-900 hover:bg-gray-800 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white`}>
									<RiHome4Line className='mr-3 text-lg' />
									<span className='text-sm'>Dashboard</span>
								</Link>
							</li>

							<li className={`mb-1 group ${pathname === '/client/audits' ? 'active' : ''}`}>
								<Link
									href='/client/audits'
									className={`pl-2 flex font-semibold items-center py-3 text-gray-900 hover:bg-gray-800 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white`}>
									<RiBookmark3Line className='mr-3 text-lg' />
									<span className='text-sm'>Manage Audits</span>
								</Link>
							</li>

							<li className={`mb-1 group ${pathname === '/client/surveys' ? 'active' : ''}`}>
								<Link
									href='/client/surveys'
									className={`pl-2 flex font-semibold items-center py-3 text-gray-900 hover:bg-gray-800 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white`}>
									<RiBook2Line className='mr-3 text-lg' />
									<span className='text-sm'>Manage Surveys (Internal) </span>
								</Link>
							</li>
						</>
					)}
				</ul>
			</div>

			<div
				className={`fixed top-0 left-0 w-full h-full bg-black/50 z-40 md:hidden ${
					sidebarOpen ? '' : 'hidden'
				}`}
				onClick={toggleSidebar}
			/>

			<main
				className={`w-full md:w-[calc(100%-256px)] md:ml-64 bg-gray-100 min-h-screen transition-all main`}>
				{/* HEADER */}
				<div className='py-4 px-6 bg-[#fff] flex items-center shadow-md shadow-black/5 sticky top-0 left-0 z-30'>
					<button
						type='button'
						className='text-lg text-gray-900 font-semibold sidebar-toggle md:hidden'
						onClick={toggleSidebar}>
						<RiMenuLine />
					</button>

					<ol className='ms-4 md:ms-0 flex items-center whitespace-nowrap capitalize'>
						<li className='text-sm text-gray-600'>{getHeaderText()[0]}</li>
						<RiArrowDropRightLine className='text-sm text-gray-600' />
						<li className='text-sm font-semibold text-gray-600 truncate' id='breadcrumb' aria-current='page'>
							{getHeaderText()[1] ?? 'Dashboard'}
						</li>
					</ol>

					<ul className='ml-auto flex items-center'>
						<button
							id='fullscreen-button'
							className='hover:bg-gray-100 p-1 rounded-full'
							onClick={toggleFullscreen}>
							<svg xmlns='http://www.w3.org/2000/svg' width={24} height={24} viewBox='0 0 24 24'>
								<path d='M5 5h5V3H3v7h2zm5 14H5v-5H3v7h7zm11-5h-2v5h-5v2h7zm-2-4h2V3h-7v2h5z' />
							</svg>
						</button>

						<li className='dropdown ml-5'>
							<Dropdown
								dismissOnClick={false}
								renderTrigger={() => (
									<button type='button' className='dropdown-toggle flex items-center'>
										<FaUserCircle size={24} color='#252525' />
									</button>
								)}>
								{/* <Dropdown.Item>
									<Link href={'/admin/settings'} className='px-4 font-medium'>
										Settings
									</Link>
								</Dropdown.Item> */}

								<Dropdown.Item onClick={logout}>
									<div className='cursor-pointer px-4 font-medium text-red-700'>Sign out</div>
								</Dropdown.Item>
							</Dropdown>
						</li>
					</ul>
				</div>

				<div className='container mx-auto'>{children}</div>
			</main>
		</>
	);
};

export default Layout;
