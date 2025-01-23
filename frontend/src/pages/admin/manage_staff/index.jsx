import DeleteModal from '@/components/DeleteModal';
import Layout from '@/components/layout/DashboardLayout';
import { Loader } from '@/components/Loader';
import SearchBox from '@/components/SearchBox';
import http from '@/config/axios';
import { errorHandler } from '@/utils/errorHandler';
import { Label, Modal, Select, TextInput } from 'flowbite-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiAddFill, RiDeleteBin4Fill, RiEdit2Fill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { allInternalStaff } from '@/utils/mockData/allInternalStaff';

const DataTableX = dynamic(() => import('@/components/DataTableX'), { ssr: false, loading: Loader });

const InternalStaff = () => {
	const [openModal, setOpenModal] = useState({ open: false, type: 'create', data: null });
	const [openDelModal, setOpenDelModal] = useState({ open: false, data: null });
	const [data, setData] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoading, setLoading] = useState(true);

	const fetchData = async () => {
		try {
			// const res = await http.get('/internal_staff');
			// if (res?.status == 200) {
			// 	// console.log('fetchData:', res.data);
			// 	setData(res.data.result);
			// }
            if (allInternalStaff && allInternalStaff.length > 0) {
				// console.log('fetchData:', res.data);
				setData(allInternalStaff);
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
			name: 'Company',
			selector: (row) => row.client.hotelName,
			sortable: true,
			minWidth: '115px',
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
        const newData = data.filter((curr) => {
            
            const status = curr.id == parseInt(keyword) || curr.name.includes(keyword) || curr.email.includes(keyword) || curr.client.hotelName.includes(keyword)
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

	const createOrUpdateRecord = async (newData) => {
	const payload = {
      id: data.length + 1,
      role: newData.role,
      hotelName: newData.company,
      phoneNumber: parseInt(newData.phoneNumber),
      passcode: newData.passcode,
      email: newData.email,
      name: newData.name,
      clientId: parseInt(newData.clientId),
      client : {hotelName : newData.company},
      created_at : new Date()
    }

	// 	try {
	// 		let res;
			if (openModal.type == 'create') {
                // allInternalStaff.push(payload);
                console.log(payload);
                // fetchData();
                setData([...data, payload]);
				setOpenModal({ open: false });
				toast.success('done');
				// res = await http.post('/inspector', payload);
			} else {
				const id = openModal.data.id;
                console.log(id);
                setOpenModal({ open: false });
				toast.success('done');
				// res = await http.put('/inspector/' + id, payload);
			}

	// 		if ([200, 201].includes(res?.status)) {
	// 			fetchData();
	// 			setOpenModal({ open: false });
	// 			toast.success(res.data.message);
	// 		}
	// 	} catch (error) {
	// 		errorHandler(error);
	// 	}
	};

	const deleteRecord = async () => {
		try {
			const id = openDelModal.data.id;
            const newData = data.filter((curr) => curr.id !== id);
            setData(newData);
			// const res = await http.delete('/inspector/' + id);
			// if (res?.status == 200) {
			// 	fetchData();
			// 	toast.success(res.data.message);
			// }
		} catch (error) {
			errorHandler(error);
		}
	};

	return (
		<Layout>
			<div className='content p-6'>
				<div className='mb-7 flex justify-between items-center'>
					<h1 className='font-bold text-lg text-[#222]'>Manage Internal Staff</h1>
					<button onClick={() => setOpenModal({ open: true, type: 'create' })} className='btn_primary _flex'>
						<RiAddFill className='mr-2 h-5 w-5' />
						Create New
					</button>
				</div>

				<div className='py-1 bg-white rounded-md border border-gray-200 shadow-sm shadow-black/5'>
					<div className='tableHeader py-2 px-4 flex justify-between items-center'>
						<p className='text-[13px] font-semibold'>Total ({data.length})</p>

						<SearchBox searchTerm={searchTerm} searchRecord={searchRecord} />
					</div>

					<DataTableX data={data} columns={columns} />
				</div>
			</div>

			{openModal.open && (
				<InternalStaffModal
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

function InternalStaffModal({ openModal, setOpenModal, createOrUpdateRecord }) {
    const { register, handleSubmit, setValue } = useForm();
    const isEdit = openModal.type === 'edit';
    const data = openModal.data;

    const action = (data) => {
        createOrUpdateRecord(data);
    };

    return (
        <>
            <Modal dismissible show={openModal.open} onClose={() => setOpenModal({ open: false })}>
                <Modal.Header>{isEdit ? 'Edit Staff' : 'Create New Staff'}</Modal.Header>

                <Modal.Body>
                    <form onSubmit={handleSubmit(action)} className='space-y-4'>
                        <div>
                            <div className='mb-1 block'>
                                <Label htmlFor='name' value='Name' />
                            </div>
                            <TextInput id='name' defaultValue={data?.name || ''} {...register('name')} required />
                        </div>

                        <div>
                            <div className='mb-1 block'>
                                <Label htmlFor='email' value='Email Address' />
                            </div>
                            <TextInput
                                id='email'
                                placeholder='name@example.com'
                                defaultValue={data?.email || ''}
                                {...register('email')}
                                required
                            />
                        </div>

                        <div>
                            <div className='mb-1 block'>
                                <Label htmlFor='phoneNumber' value='Phone number' />
                            </div>
                            <TextInput
                                id='phoneNumber'
                                defaultValue={data?.phoneNumber || ''}
                                {...register('phoneNumber')}
                            />
                        </div>

                        <div>
                            <div className='mb-1 block'>
                                <Label htmlFor='role' value='Role' />
                            </div>
                            <TextInput
                                id='role'
                                defaultValue={data?.role || ''}
                                {...register('role')}
                                required
                            />
                        </div>

                        {
                            !isEdit &&
                            <div>
                            <div className='mb-1 block'>
                                <Label htmlFor='clientId' value='ClientId' />
                            </div>
                            <TextInput
                                id='clientId'
                                defaultValue=''
                                {...register('clientId')}
                                required
                            />
                        </div>
                        }
                            <div>
                            <div className='mb-1 block'>
                                <Label htmlFor='company-name' value='Company Name' />
                            </div>
                            <TextInput
                                id='company-name'
                                defaultValue={data?.client.hotelName || ''}
                                {...register('company')}
                                required
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
};

export default InternalStaff;