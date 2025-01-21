import { useEffect, useState } from 'react';
import Layout from '@/components/layout/DashboardLayout';
import { RiAddFill, RiArrowLeftLine, RiCheckboxBlankCircleLine, RiCloseLine } from 'react-icons/ri';

import Link from 'next/link';
import { Accordion } from 'flowbite-react';
import { FloatField, InputFieldStatic, SelectField } from '@/components/Fields';
import { CategoryPanel, QuestionBox } from '@/components/QuestionUI';
import { toast } from 'react-toastify';
import { Loader } from '@/components/Loader';
import { errorHandler } from '@/utils/errorHandler';
import http from '@/config/axios';
import { useRouter } from 'next/router';
import AddQuestion from '@/components/survey/AddQuestion';
import { LocationSuggestionInput2 } from '@/components/form/LocationSuggestionField';
import { LoaderOverlay } from '../../../components/common/LoaderOverlay';
import { EditQuestionModal } from '@/components/survey/EditQuestionModal';
import { CategoryModal } from '@/components/survey/CategoryModal';
import Cookies from 'js-cookie';

const CreateSurvey = () => {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [openCatModal, setOpenCatModal] = useState({ open: false });
	const [catSuggestions, setCatSuggestions] = useState([]);
	const [INSPECTORS, setInspectors] = useState([]);
	const [formData, setFormData] = useState({});
	const [questions, setQuestions] = useState([]);
	const [surveyCategories, setSurveyCategories] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [loadingRequest, setLoadingRequest] = useState(false);
	const [openQuestionModal, setOpenQuestionModal] = useState({ open: false });
	const [importFromExcel, setImportFromExcel] = useState(false);
	const [excelFile, setExcelFile] = useState(null);
	const [user, setUser] = useState(null);

	const fetchData = async () => {
		try {
			const user = JSON.parse(Cookies.get('user'));
			setUser(user);
			setFormData({ ...formData, hotelName: user?.client?.hotelName });
			// console.log('user', user);

			const inspectors = await http.get('/inspector/list?clientId=' + user?.client?.id);
			const categories = await http.get('/category/list');

			if (inspectors?.status == 200 || categories?.status == 200) {
				setInspectors(inspectors?.data?.result || []);
				setCatSuggestions(categories?.data?.result || []);
			}
		} catch (error) {
			errorHandler(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		setImportFromExcel(searchParams.get('importFromExcel'));

		fetchData();
	}, []);

	const nextStep = () => {
		// console.log(formData);

		const fieldValidation = () => {
			if (!formData?.hotelName) {
				toast.error('Hotel Name is required');
				return false;
			}

			return true;
		};

		window.scrollTo({ top: 0, behavior: 'smooth' });
		if (step == 1 && fieldValidation()) setStep(2);
		// Go to previous step
		step == 2 && setStep(1);
	};

	const removeQuestion = (id) => {
		setQuestions(questions.filter((item) => item.id !== id));
	};

	const onFormSubmit = async (el) => {
		el.preventDefault();
		setLoadingRequest(true);

		const inspectors = formData?.inspectors ? [formData?.inspectors.toString()] : [];

		const payload = {
			hotelName: formData?.hotelName,
			campaign: formData?.campaign,
			location: formData?.location,
			startDate: formData?.start_date,
			endDate: formData?.end_date,
			inspectors: inspectors,
			clientId: user?.client?.id,
			clientName: user?.name,
			surveyType: 'INTERNAL',
			categories: surveyCategories.map((category) => ({ ...category, id: category.id.toString() })),
			questions: questions.map((question) => ({ ...question, categoryId: question.categoryId.toString() })),
		};

		// return console.log('payload', payload);

		if (importFromExcel && !excelFile) {
			setLoadingRequest(false);
			return toast.error('Please upload an Excel file.');
		}

		try {
			let res;
			if (importFromExcel && excelFile) {
				const formData = new FormData();
				formData.append('excelFile', excelFile);
				formData.append('payload', JSON.stringify(payload));
				res = await http.post('/survey', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
			} else {
				res = await http.post('/survey', payload);
			}

			if (res.status == 201) {
				const { id } = res.data.result;
				toast.success(res.data.message);
				router.push(`/client/surveys/${id}/edit`);
			}
		} catch (error) {
			errorHandler(error);
			setLoadingRequest(false);
		}
	};

	const onFileInputChange = (e) => {
		const file = e.target.files[0];

		if (file) {
			// Check if file extension is valid (xlsx, xls)
			const validExtensions = ['xlsx', 'xls'];
			const fileExtension = file?.name?.split('.')?.pop();
			if (!validExtensions.includes(fileExtension)) {
				setExcelFile(null);
				return toast.error('Invalid file format. Please upload an Excel file.');
			}

			// Check if file exceeds 20MB
			const maxSize = 20 * 1024 * 1024;
			if (file.size > maxSize) {
				setExcelFile(null);
				return toast.error('File is too large (20MB max). Please upload a smaller file.');
			}

			setExcelFile(file);
		}
	};

	if (isLoading) {
		return (
			<div className='h-screen grid_center'>
				<Loader />
			</div>
		);
	}

	return (
		<>
			{loadingRequest && <LoaderOverlay />}
			<Layout>
				<div className='content p-6'>
					<div className='mb-7 flex justify-between items-center'>
						<h1 className='font-bold text-lg text-[#222]'>Create Survey</h1>
						<Link href='/client/surveys' className='btn_primary _flex'>
							<RiArrowLeftLine className='mr-2 h-5 w-5' />
							<span className='hidden md:block'>All Surveys</span>
						</Link>
					</div>

					{/* MAIN */}
					<div className='py-7 px-5 mb-8 bg-white rounded-md border border-gray-200 shadow-sm shadow-black/5'>
						<form className='w-full' onSubmit={onFormSubmit}>
							{/* STEP 1 */}
							<div className={`step1 details ${step !== 1 && 'hidden'}`}>
								<h3 className='heading text-xl font-semibold mb-8 uppercase'>Survey Details</h3>

								<div className='mb-5'>
									<FloatField
										label={'Hotel Name'}
										value={formData.hotelName || ''}
										onChange={(el) => setFormData({ ...formData, hotelName: el.target.value })}
									/>
								</div>

								<div className='mb-5'>
									<FloatField
										label={'Campaign'}
										value={formData.campaign ?? ''}
										onChange={(el) => setFormData({ ...formData, campaign: el.target.value })}
									/>
								</div>

								<div className='mb-5'>
									<LocationSuggestionInput2
										label={'Location'}
										value={formData.location || ''}
										handleInputValue={(text) => setFormData({ ...formData, location: text })}
									/>
								</div>

								<div className='mb-5'>
									<FloatField
										label={'Start Date'}
										value={formData.start_date ?? ''}
										onChange={(el) => setFormData({ ...formData, start_date: el.target.value })}
										type='date'
										onClick={(el) => el.target.showPicker()}
									/>
								</div>

								<div className='mb-5'>
									<FloatField
										label={'End Date'}
										value={formData.end_date ?? ''}
										onChange={(el) => setFormData({ ...formData, end_date: el.target.value })}
										type='date'
										onClick={(el) => el.target.showPicker()}
									/>
								</div>

								<div className='mb-5'>
									<SelectField
										label={'Inspector'}
										value={formData.inspectors ?? ''}
										onChange={(el) => setFormData({ ...formData, inspectors: el.target.value })}>
										<option value=''>select inspector</option>

										{/* Display INSPECTORS */}
										{INSPECTORS.map((item, index) => (
											<option key={index} value={item?.user?.id}>
												{item?.user?.name}
											</option>
										))}
									</SelectField>
								</div>

								{/* END */}
							</div>

							{/* STEP 2 */}
							<div className={`step2 questionnaire ${step !== 2 && 'hidden'}`}>
								<h3 className='heading text-xl font-semibold mb-8 uppercase'>Questionnaire</h3>

								{importFromExcel ? (
									<div className='pt-1 pb-4'>
										<label className='block mb-2 text-base font-medium text-gray-900' htmlFor='excelInput'>
											Import From Excel File
										</label>
										<input
											className='block w-full mb-5 text-xs text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50'
											id='excelInput'
											type='file'
											accept='.xlsx, .xls'
											onChange={onFileInputChange}
										/>

										<p className='my-2 text-sm text-gray-500'>
											<b>Note:</b> Ensure the Excel file includes three columns: Category, Question, and
											Options (separated by commas for multiple-choice questions or left blank for text-based
											questions)
										</p>
									</div>
								) : (
									<>
										<div className='fx_between mb-7'>
											<p className='heading text-base font-medium'>Add Questions</p>
											<div
												className='btn_outline'
												onClick={() => setOpenCatModal({ open: true, type: 'create' })}>
												New category
											</div>
										</div>

										<AddQuestion category={surveyCategories} setQuestions={setQuestions} />

										<div className='mt-8 mb-6 border border-gray-300' />
										<p className='heading text-base font-medium mb-7'>Questions ({questions.length})</p>

										{!questions.length ? (
											<p className='text-gray-400 mb-4'>No questions added!</p>
										) : (
											<div className='mb-5'>
												<Accordion>
													{surveyCategories
														.filter((item) => questions.some((question) => question.categoryId == item.id))
														.map((item) => {
															const categoryQuestions = questions.filter(
																(question) => question.categoryId == item.id
															);

															return (
																<Accordion.Panel key={item.id} className='box'>
																	<CategoryPanel title={item.title} count={categoryQuestions.length}>
																		{categoryQuestions.map((question, index) => (
																			<QuestionBox
																				key={index}
																				id={index + 1}
																				question={question}
																				removeQuestion={removeQuestion}
																				setOpenQuestionModal={setOpenQuestionModal}
																			/>
																		))}
																	</CategoryPanel>
																</Accordion.Panel>
															);
														})}
												</Accordion>
											</div>
										)}
									</>
								)}
							</div>

							<div className='py-5 _flex'>
								<button
									type='button'
									onClick={nextStep}
									className='btn_primary !py-[10px] md:!px-[30px] mr-4'>
									{step == 1 ? 'Next' : 'Previous'}
								</button>

								{step == 2 && (
									<button type='submit' className='btn_primary _flex !px-[10px] !py-[10px] md:!px-[30px]'>
										<RiAddFill size={22} className='mr-1.5' />
										<span>Create Survey</span>
									</button>
								)}
							</div>
						</form>
					</div>
				</div>

				{openCatModal.open && (
					<CategoryModal
						openModal={openCatModal}
						setOpenModal={setOpenCatModal}
						setCategories={setSurveyCategories}
						catSuggestions={catSuggestions}
					/>
				)}

				{openQuestionModal.open && (
					<EditQuestionModal
						openModal={openQuestionModal}
						setOpenModal={setOpenQuestionModal}
						setQuestions={setQuestions}
						CATEGORIES={surveyCategories}
					/>
				)}
			</Layout>
		</>
	);
};

export default CreateSurvey;
