import { CatSuggestionModal } from '@/components/CatSuggestionModal';
import DeleteModal from '@/components/DeleteModal';
import Layout from '@/components/layout/DashboardLayout';
import { Loader } from '@/components/Loader';
import http from '@/config/axios';
import { errorHandler } from '@/utils/errorHandler';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiAddFill, RiDeleteBin4Fill, RiEdit2Fill } from 'react-icons/ri';
import { toast } from 'react-toastify';

const DataTableX = dynamic(() => import('@/components/DataTableX'), { ssr: false, loading: Loader });

const Settings = () => {
	const [openModal, setOpenModal] = useState({ open: false, type: 'create', category: null });
	const [openDelModal, setOpenDelModal] = useState({ open: false, category: null });
	const [data, setData] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const { register, watch } = useForm();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await http.get('/category');
				if (res?.status == 200) {
					// console.log(res.data);
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

	const columns = [
		{
			name: 'ID',
			selector: (row) => '#' + row.id,
			sortable: true,
			minWidth: '20px',
			maxWidth: '160px',
		},
		{
			name: 'Title',
			selector: (row) => row.title,
			sortable: true,
			minWidth: '50%',
		},
		{
			name: 'Action',
			maxWidth: '160px',
			cell: (row) => <ActionButtons category={row} />,
		},
	];

	const ActionButtons = ({ category }) => {
		const style =
			'text-[17px] cursor-pointer rounded-sm p-1 text-[#252525] border border-gray-300 hover:bg-gray-200';
		return (
			<div className='flex gap-x-2'>
				<div className={`${style}`} onClick={() => setOpenModal({ open: true, type: 'edit', category })}>
					<RiEdit2Fill />
				</div>
				<div className={`${style}`} onClick={() => setOpenDelModal({ open: true, category })}>
					<RiDeleteBin4Fill />
				</div>
			</div>
		);
	};

	const searchRecord = async () => {
		const keyword = watch('search');
		try {
			const res = await http.get(`/category?search=${keyword}`);
			if (res?.status == 200) {
				setData(res.data.result);
			}
		} catch (error) {
			setData([]);
			errorHandler(error);
		}
	};

	const deleteRecord = async () => {
		try {
			const { id } = openDelModal.category;
			const res = await http.delete('/category/' + id);
			if (res?.status == 200) {
				setData(res.data.result);
				toast.success(res.data.message);
				toast.info('Any associated questions were also deleted!');
			}
		} catch (error) {
			errorHandler(error);
		}
	};

	const createOrUpdateRecord = async (category) => {
		try {
			let res;
			let { id, title } = category;
			title = title.trim();
			if (openModal.type == 'create') {
				res = await http.post('/category', { title });
			} else {
				res = await http.put('/category/' + id, { title });
			}

			if (res?.status == 200) {
				setOpenModal({ open: false });
				setData(res.data.result);
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
					<h1 className='font-bold text-lg text-[#222]'>Settings</h1>
					<button onClick={() => setOpenModal({ open: true, type: 'create' })} className='btn_primary _flex'>
						<RiAddFill className='mr-2 h-5 w-5' />
						Add Category
					</button>
				</div>

				<div className='py-1 bg-white rounded-md border border-gray-200 shadow-sm shadow-black/5'>
					<div className='tableHeader py-2 px-4 flex justify-between items-center'>
						<p className='text-[13px] font-semibold'>Category Suggestions ({data.length})</p>

						<div className='searchBox min-w-[40%]'>
							<div className='relative w-full'>
								<input
									type='search'
									className='block px-3 py-[6px] w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-md border-gray-200  border focus:ring-white focus:border-1 focus:border-[#252525]'
									placeholder='Search...'
									{...register('search')}
									required
								/>

								<button
									type='submit'
									onClick={searchRecord}
									className='absolute top-0 end-0 px-3 py-[6px] text-sm font-medium h-full text-white bg-[#252525] rounded-e-md border border-gray-900 hover:bg-opacity-85 '>
									<svg
										className='w-4 h-4'
										aria-hidden='true'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 20 20'>
										<path
											stroke='currentColor'
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
										/>
									</svg>
									<span className='sr-only'>Search</span>
								</button>
							</div>
						</div>
					</div>

					<DataTableX data={data} columns={columns} />
				</div>
			</div>

			{openModal.open && (
				<CatSuggestionModal
					openModal={openModal}
					setOpenModal={setOpenModal}
					createOrUpdateRecord={createOrUpdateRecord}
				/>
			)}

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

export default Settings;
