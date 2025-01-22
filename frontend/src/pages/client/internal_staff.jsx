import Layout from '@/components/layout/DashboardLayout';
import { Loader } from '@/components/Loader';
import SearchBox from '@/components/SearchBox';
import http from '@/config/axios';
import { errorHandler } from '@/utils/errorHandler';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { RiAddFill, RiDeleteBin4Fill, RiEdit2Fill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { allInternalStaff } from '@/utils/mockData/allInternalStaff';
import { useAuth } from '@/context/AuthProvider';

const DataTableX = dynamic(() => import('@/components/DataTableX'), { ssr: false, loading: Loader });

const InternalStaff = () => {
	const [data, setData] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoading, setLoading] = useState(true);
	const { user } = useAuth();

	const fetchData = async () => {
		try {
			// const res = await http.get('/internal_staff');
			// if (res?.status == 200) {
			// 	// console.log('fetchData:', res.data);
			// 	setData(res.data.result);
			// }
			let clientId = 0;
			if (user && user.role === 'CLIENT') clientId = user.client.id;

            if (allInternalStaff && allInternalStaff.length > 0) {
				// console.log('fetchData:', res.data);
				const newData = allInternalStaff.filter((data) => data.clientId === clientId);
				setData(newData);
			}
		} catch (error) {
			setData([]);
			errorHandler(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (isLoading) {
		return (
			<div className='h-screen grid_center'>
				<Loader />
			</div>
		);
	}

	const columns = [
		{
			name: 'ID',
			selector: (row) => '#' + row.id,
			sortable: true,
			minWidth: '0px',
		},
		{
			name: 'Name',
			selector: (row) => row.name,
			sortable: true,
			minWidth: '120px',
		},
		{
			name: 'Email',
			selector: (row) => row.email,
			sortable: true,
			minWidth: '210px',
		},
		{
			name: 'Phone No',
			selector: (row) => row.phoneNumber,
			sortable: true,
			minWidth: '130px',
		},
		{
			name: 'Role',
			selector: (row) => row.role,
			sortable: true,
			minWidth: '200px',
		},
		{
			name: 'Passcode',
			sortable: true,
			minWidth: '115px',
			cell: (row) => {
				let passcode = row.passcode;
				const action = () => {
					navigator.clipboard.writeText(passcode);
					return alert(`Copied to clipboard! PASSCODE: ${passcode}`);
				};
				return (
					<div className='cursor-pointer' onClick={action}>
						<p>********</p>
					</div>
				);
			},
		},
		{
			name: 'Date Added',
			selector: (row) => new Date(row?.created_at).toLocaleDateString(),
			sortable: true,
			minWidth: '100px',
		}
	];

	const searchRecord = async (keyword) => {
		setSearchTerm(keyword);
        const newData = data.filter((curr) => {
            
            const status = curr.id == parseInt(keyword) || curr.name.includes(keyword) || curr.email.includes(keyword) || curr.role.includes(keyword)
            return status;
    });
        if (newData.length > 0) setData(newData);
        keyword.length == 0 && fetchData();
	// 	try {
	// 		// Limit the length of the search term to reduce api calls
	// 		if (keyword.length > 2) {
	// 			const res = await http.get(`/inspector?search=${keyword}&inspectorType=EXTERNAL`);
	// 			if (res?.status == 200) {
	// 				setData(res.data.result);
	// 			}
	// 		}
	// 		// Re-fetch table data if empty
	// 		keyword.length == 0 && fetchData();
	// 	} catch (error) {
	// 		setData([]);
	// 		errorHandler(error);
	// 	}
	};

	return (
		<Layout>
			<div className='content p-6'>
				<div className='mb-7 flex justify-between items-center'>
					<h1 className='font-bold text-lg text-[#222]'>View Staff Details</h1>
				</div>

				<div className='py-1 bg-white rounded-md border border-gray-200 shadow-sm shadow-black/5'>
					<div className='tableHeader py-2 px-4 flex justify-between items-center'>
						<p className='text-[13px] font-semibold'>Total ({data.length})</p>

						<SearchBox searchTerm={searchTerm} searchRecord={searchRecord} />
					</div>

					<DataTableX data={data} columns={columns} />
				</div>
			</div>
		</Layout>
	);
};

export default InternalStaff;