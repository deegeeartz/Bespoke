import { useEffect, useState } from 'react';
import DeleteModal from '@/components/DeleteModal';
import Layout from '@/components/layout/DashboardLayout';
import { Loader } from '@/components/Loader';
import dynamic from 'next/dynamic';
import { RiAddFill } from 'react-icons/ri';
import Link from 'next/link';
import { Dropdown, Modal } from 'flowbite-react';
import http from '@/config/axios';
import { errorHandler } from '@/utils/errorHandler';
import SearchBox from '@/components/SearchBox';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthProvider';

const SurveyTable = dynamic(() => import('@/components/survey/SurveyTable'), { ssr: false, loading: Loader });

const Surveys = () => {
	const { user } = useAuth();
	const [openDelModal, setOpenDelModal] = useState({ open: false, data: null });
	const [entryModal, setEntryModal] = useState({ open: false, data: null });
	const [data, setData] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');

	const fetchData = async () => {
		try {
			const res = await http.get('/survey');
			if (res?.status == 200) {
				// console.log(res.data);
				setData(res.data.result);
			}
		} catch (error) {
			errorHandler(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (!user || isLoading) {
		return (
			<div className='h-screen grid items-center'>
				<Loader />
			</div>
		);
	}

	const searchRecord = async (keyword) => {
		setSearchTerm(keyword);
		try {
			// Limit the length of the search term to reduce api calls
			if (keyword.length > 2) {
				const res = await http.get(`/survey?search=${keyword}`);
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
					<h1 className='font-bold text-lg text-[#222]'>Manage Surveys</h1>

					<Dropdown
						renderTrigger={() => (
							<div className='btn_primary _flex cursor-pointer'>
								<RiAddFill className='mr-2 h-5 w-5' />
								<span className='hidden md:block'>Create New</span>
							</div>
						)}>
						<Dropdown.Item>
							<Link href='/admin/surveys/create'>Manual</Link>
						</Dropdown.Item>
						<Dropdown.Item>
							<Link href='/admin/surveys/create?importFromExcel=true'>Import from Excel</Link>
						</Dropdown.Item>
					</Dropdown>
				</div>

				<div className='py-1 bg-white rounded-md border border-gray-200 shadow-sm shadow-black/5'>
					<div className='tableHeader py-3 px-4 flex justify-between items-center'>
						<p className='text-[13px] font-semibold'>Total ({data.length})</p>

						<SearchBox searchTerm={searchTerm} searchRecord={searchRecord} />
					</div>

					<SurveyTable data={data} setOpenDelModal={setOpenDelModal} setEntryModal={setEntryModal} />
				</div>
			</div>

			{openDelModal.open && (
				<DeleteModal
					openModal={openDelModal.open}
					setOpenModal={setOpenDelModal}
					deleteRecord={deleteRecord}
				/>
			)}

			{entryModal.open && <EntriesModal openModal={entryModal} setOpenModal={setEntryModal} survey={data} />}
		</Layout>
	);
};

const EntriesModal = ({ openModal, setOpenModal }) => {
	const [isLoading, setLoading] = useState(true);
	const survey = openModal.data;
	const surveyId = survey.id;
	const [audits, setAudits] = useState([]);

	const fetchData = async () => {
		try {
			const res = await http.get('/audit/survey/' + surveyId);
			if (res?.status == 200) {
				// console.log('audit', res.data);
				setAudits(res.data.result);
			}
		} catch (error) {
			errorHandler(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<>
			<Modal dismissible position={'center'} show={openModal} onClose={() => setOpenModal(false)}>
				<Modal.Header>List Of Entries</Modal.Header>

				<Modal.Body>
					<div className='space-y-6'>
						{isLoading ? (
							<div className='h-full grid items-center'>
								<Loader />
							</div>
						) : (
							<div>
								{!audits.length && <p className='text-gray-700'>No audit found!</p>}

								{audits.map((audit, index) => (
									<div key={index} className='card mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg '>
										<span className='pr-2'>
											<b className='text-[14px]'>#{index + 1}</b>
										</span>

										<div className='pt-2 pb-4 grid gap-1 md:flex flex-wrap justify-between items-center '>
											<span className='pr-2'>
												<b className='text-[14px]'>Inspector: </b> {audit.inspectorName || 'N/A'}
											</span>

											<span className='pr-2 capitalize'>
												<b className='text-[14px]'>Status: </b> {audit.status}
											</span>

											<span className='pr-2'>
												<b className='text-[14px]'>Date Added: </b>
												{audit.createdAt}
											</span>
										</div>

										<Link href={`/audit/${audit.id}/view`} className='btn_primary px-4'>
											View
										</Link>

										<Link
											href={`/audit/${audit.id}/report`}
											target='_blank'
											className='btn_primary px-4 ml-2'>
											Print
										</Link>
									</div>
								))}
							</div>
						)}
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
};

export default Surveys;
