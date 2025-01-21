import Layout from '@/components/layout/DashboardLayout';
import { Loader } from '@/components/Loader';
import http from '@/config/axios';
import { errorHandler } from '@/utils/errorHandler';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const ClientDashboard = () => {
	const [data, setData] = useState({});
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await http.get('/inspector_stats');
				if (res?.status == 200) {
					// console.log('fetchData:', res.data);
					setData(res.data.result);
				}
			} catch (error) {
				setData([]);
				errorHandler(error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (isLoading) {
		return (
			<div className='h-screen grid_center'>
				<Loader />
			</div>
		);
	}

	return (
		<Layout>
			<div className='content p-6'>
				<h1 className='font-bold mb-6 text-lg text-[#222]'>Client Dashboard</h1>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
					{/*  */}

					<div className='bg-white rounded-md border border-gray-100 p-6 shadow-md shadow-black/5'>
						<div className='flex justify-between mb-6'>
							<div>
								<div className='flex items-center mb-1'>
									<div className='text-2xl font-semibold'>{data.auditCount || 0}</div>
								</div>
								<div className='text-sm font-medium text-gray-400'>Audits</div>
							</div>
						</div>
					</div>

					<div className='bg-white rounded-md border border-gray-100 p-6 shadow-md shadow-black/5'>
						<div className='flex justify-between mb-6'>
							<div>
								<div className='flex items-center mb-1'>
									<div className='text-2xl font-semibold'>{data.surveyCount || 0}</div>
								</div>
								<div className='text-sm font-medium text-gray-400'>Internal Surveys</div>
							</div>
						</div>
					</div>

					<div className='bg-white rounded-md border border-gray-100 p-6 shadow-md shadow-black/5'>
						<div className='flex justify-between mb-6'>
							<div>
								<div className='text-2xl font-semibold mb-1'>{data.inspectorCount || 0}</div>
								<div className='text-sm font-medium text-gray-400'>Internal Inspectors</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default ClientDashboard;
