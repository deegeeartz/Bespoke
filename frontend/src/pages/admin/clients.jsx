import { useEffect, useState } from 'react';
import Layout from '@/components/layout/DashboardLayout';
import DeleteModal from '@/components/DeleteModal';
import { Loader } from '@/components/Loader';
import SearchBox from '@/components/SearchBox';
import http from '@/config/axios';
import { errorHandler } from '@/utils/errorHandler';
import { Label, Modal, TextInput } from 'flowbite-react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { RiAddFill, RiDeleteBin4Fill, RiEdit2Fill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { LocationSuggestionInput1 } from '@/components/form/LocationSuggestionField';

const DataTableX = dynamic(() => import('@/components/DataTableX'), { ssr: false, loading: Loader });

const Clients = () => {
	const [openModal, setOpenModal] = useState({ open: false, type: 'create', data: null });
	const [openDelModal, setOpenDelModal] = useState({ open: false, data: null });
	const [data, setData] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoading, setLoading] = useState(true);

	const fetchData = async () => {
		try {
			const res = await http.get('/client');
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
			name: 'Name',
			selector: (row) => row.user.name,
			sortable: true,
			minWidth: '120px',
		},
		{
			name: 'Email',
			selector: (row) => row.user.email,
			sortable: true,
			minWidth: '210px',
		},
		{
			name: 'Hotel Name',
			selector: (row) => row.hotelName,
			sortable: true,
			minWidth: '130px',
		},
		{
			name: 'Location',
			selector: (row) => row.location,
			sortable: true,
			minWidth: '180px',
		},
		{
			name: 'Additional Notes',
			selector: (row) => row.additionalNotes || '---',
			sortable: true,
			minWidth: '130px',
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
			selector: (row) => new Date(row?.user?.created_at).toLocaleDateString(),
			sortable: true,
			minWidth: '100px',
		},
		{
			name: 'Action',
			minWidth: '100px',
			cell: (row) => <ActionButtons data={row} />,
		},
	];

	const ActionButtons = ({ data }) => {
		const style =
			'text-[17px] cursor-pointer rounded-sm p-1 text-[#252525] border border-gray-300 hover:bg-gray-200';
		return (
			<div className='flex gap-x-2'>
				<div className={`${style}`} onClick={() => setOpenModal({ open: true, type: 'edit', data })}>
					<RiEdit2Fill />
				</div>
				<div className={`${style}`} onClick={() => setOpenDelModal({ open: true, data })}>
					<RiDeleteBin4Fill />
				</div>
			</div>
		);
	};

	const searchRecord = async (keyword) => {
		setSearchTerm(keyword);
		try {
			// Limit the length of the search term to reduce api calls
			if (keyword.length > 2) {
				const res = await http.get(`/client?search=${keyword}`);
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

	const createOrUpdateRecord = async (data) => {
		const payload = {
			hotelName: data?.hotelName,
			location: data?.location,
			additionalNotes: data?.additionalNotes,
			name: data?.name,
			email: data?.email,
			password: data?.passcode,
		};

		try {
			let res;
			if (openModal.type == 'create') {
				res = await http.post('/client', payload);
			} else {
				const id = openModal.data.id;
				res = await http.put('/client/' + id, payload);
			}

			if ([200, 201].includes(res?.status)) {
				fetchData();
				setOpenModal({ open: false });
				toast.success(res.data.message);
			}
		} catch (error) {
			errorHandler(error);
		}
	};

	const deleteRecord = async () => {
		try {
			const id = openDelModal.data.id;
			const res = await http.delete('/client/' + id);
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
					<h1 className='font-bold text-lg text-[#222]'>Manage Clients</h1>

					<button onClick={() => setOpenModal({ open: true, type: 'create' })} className='btn_primary _flex'>
						<RiAddFill className='mr-2 h-5 w-5' />
						Create New
					</button>
				</div>

				<div className='py-1 bg-white rounded-md border border-gray-200 shadow-sm shadow-black/5'>
					<div className='tableHeader flex justify-between items-center'>
						<p className='text-[13px] font-semibold'>Total ({data.length})</p>

						<SearchBox searchTerm={searchTerm} searchRecord={searchRecord} />
					</div>

					<DataTableX data={data} columns={columns} />
				</div>
			</div>

			{openModal.open && (
				<CustomModal
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

function CustomModal({ openModal, setOpenModal, createOrUpdateRecord }) {
	const { register, handleSubmit, setValue } = useForm();
	const isEdit = openModal.type === 'edit';
	const data = openModal.data;

	const action = (data) => {
		createOrUpdateRecord(data);
	};

	return (
		<>
			<Modal dismissible show={openModal.open} onClose={() => setOpenModal({ open: false })}>
				<Modal.Header>{isEdit ? 'Edit Client' : 'Create New Client'}</Modal.Header>

				<Modal.Body>
					<form onSubmit={handleSubmit(action)} className='space-y-4'>
						<div>
							<div className='mb-1 block'>
								<Label htmlFor='name' value='Name' />
							</div>
							<TextInput id='name' defaultValue={data?.user.name || ''} {...register('name')} required />
						</div>

						<div>
							<div className='mb-1 block'>
								<Label htmlFor='email' value='Email Address' />
							</div>
							<TextInput
								id='email'
								placeholder='name@example.com'
								defaultValue={data?.user.email || ''}
								{...register('email')}
								required
							/>
						</div>

						<div>
							<div className='mb-1 block'>
								<Label htmlFor='hotelName' value='Hotel Name' />
							</div>
							<TextInput
								id='hotelName'
								defaultValue={data?.hotelName || ''}
								{...register('hotelName')}
								required
							/>
						</div>

						<div>
							<div className='mb-1 block'>
								<Label htmlFor='location' value='Location' />
							</div>
							<LocationSuggestionInput1
								id='location'
								value={data?.location || ''}
								register={register}
								setValue={setValue}
							/>
						</div>

						<div>
							<div className='mb-1 block'>
								<Label htmlFor='additionalNotes' value='Additional Notes' />
							</div>
							<TextInput
								id='additionalNotes'
								defaultValue={data?.additionalNotes || ''}
								{...register('additionalNotes')}
							/>
						</div>

						<div>
							<div className='mb-1 block'>
								<Label htmlFor='passcode' value='Passcode' />
							</div>
							<TextInput
								id='passcode'
								type={isEdit ? 'text' : 'password'}
								defaultValue={data?.passcode || ''}
								{...register('passcode')}
								required
							/>
						</div>

						<div className='w-full py-2'>
							<button className='btn_primary px-8 w-36'>{isEdit ? 'Update' : 'Create'}</button>
						</div>
					</form>
				</Modal.Body>
			</Modal>
		</>
	);
}

export default Clients;
