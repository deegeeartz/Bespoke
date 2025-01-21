import { useEffect, useState } from 'react';
import Layout from '@/components/layout/DashboardLayout';
import DeleteModal from '@/components/DeleteModal';
import { Loader } from '@/components/Loader';
import { Badge } from 'flowbite-react';
import dynamic from 'next/dynamic';
import { RiCheckboxCircleLine, RiEdit2Fill, RiEyeFill } from 'react-icons/ri';
import Link from 'next/link';
import SearchBox from '@/components/SearchBox';
import http from '@/config/axios';
import { errorHandler } from '@/utils/errorHandler';

const DataTableX = dynamic(() => import('@/components/DataTableX'), { ssr: false, loading: Loader });

const InspectorAudits = () => {
	const [openDelModal, setOpenDelModal] = useState({ open: false, data: null });
	const [data, setData] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoading, setLoading] = useState(true);

	const fetchData = async () => {
		try {
			const res = await http.get('/audit/inspector');
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
			name: 'Client',
			selector: (row) => row.survey.clientName,
			sortable: true,
			minWidth: '120px',
		},
		{
			name: 'Hotel',
			selector: (row) => row.survey.hotelName,
			sortable: true,
			minWidth: true,
			minWidth: '120px',
		},
		{
			name: 'Campaign',
			selector: (row) => row.survey.campaign,
			sortable: true,
			minWidth: '120px',
			hide: 'md',
		},
		{
			name: 'Detailed Summary',
			selector: (row) => (
				<Badge color={row.detailedSummary ? 'success' : 'gray'} className='cursor-pointer'>
					{row.detailedSummary ? 'Filled' : 'N/A '}
				</Badge>
			),
			sortable: true,
			minWidth: '120px',
		},
		{
			name: 'Status',
			minWidth: '120px',
			cell: (row) => {
				return (
					<Badge
						color={row.status == 'completed' ? 'success' : row.status == 'abandoned' ? 'failure' : 'warning'}
						className='cursor-pointer capitalize'>
						{row.status || 'in progress'}
					</Badge>
				);
			},
		},
		{
			name: 'Feedback',
			minWidth: '100px',
			cell: (row) => {
				return (
					<Badge color={row.feedback ? 'success' : 'gray'} className='cursor-pointer'>
						{row.feedback ? <RiCheckboxCircleLine size={18} className='mx-2' /> : 'N/A '}
					</Badge>
				);
			},
		},
		{
			name: 'Action',
			minWidth: '120px',
			cell: (row) => <ActionButtons id={row.id} />,
		},
	];

	const ActionButtons = ({ id }) => {
		const style =
			'text-[17px] cursor-pointer rounded-sm p-1 px-2 text-[#252525] border border-gray-300 hover:bg-gray-200 fx_center';
		return (
			<div className='flex gap-x-4'>
				<Link href={`audit/${id}/view`} className={`${style}`}>
					<RiEyeFill />
				</Link>

				<Link href={`audit/${id}/edit`} className={`${style}`}>
					<RiEdit2Fill />
				</Link>

				{/* <div className={`${style}`} onClick={() => setOpenDelModal({ open: true, id })}>
					<RiDeleteBin4Fill />
				</div> */}
			</div>
		);
	};

	const searchRecord = async (keyword) => {
		setSearchTerm(keyword);
		try {
			// Limit the length of the search term to reduce api calls
			if (keyword.length > 2) {
				const res = await http.get(`/audit/inspector?search=${keyword}`);
				if (res?.status == 200) {
					setData(res.data.result);
				}
			}
			// Re-fetch table data if empty
			keyword.length == 0 && fetchData();
		} catch (error) {
			setData([]);
			errorHandler(error);
		}
	};

	const deleteRecord = async () => {
		try {
			const id = openDelModal?.id;
			const res = await http.delete('/survey/' + id);
			if (res?.status == 200) {
				fetchData();
				toast.success(res.data.message);
			}
		} catch (error) {
			errorHandler(error);
		}
	};

	return (
		<Layout>
			<div className='content p-6'>
				<div className='mb-7 flex justify-between items-center'>
					<h1 className='font-bold text-lg text-[#222]'>My Audits</h1>
				</div>

				<div className='py-1 bg-white rounded-md border border-gray-200 shadow-sm shadow-black/5'>
					<div className='tableHeader flex justify-between items-center'>
						<p className='text-[13px] font-semibold'>Total ({data.length})</p>

						<SearchBox searchTerm={searchTerm} searchRecord={searchRecord} />
					</div>

					<DataTableX data={data} columns={columns} />
				</div>
			</div>

			{openDelModal.open && (
				<DeleteModal
					openModal={openDelModal.open}
					setOpenModal={setOpenDelModal}
					deleteRecord={deleteRecord}
				/>
			)}
		</Layout>
	);
};

export default InspectorAudits;
