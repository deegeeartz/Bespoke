import { useEffect, useRef, useState } from 'react';
import Layout from '@/components/layout/DashboardLayout';
import { RiArrowLeftLine, RiUpload2Line } from 'react-icons/ri';
import Link from 'next/link';
import { Accordion } from 'flowbite-react';
import { FloatField, SelectField } from '@/components/Fields';
import { CategoryPanel, QuestionBox } from '@/components/QuestionUI';
import { toast } from 'react-toastify';
import { Loader } from '@/components/Loader';
import { errorHandler } from '@/utils/errorHandler';
import http from '@/config/axios';
import { useRouter } from 'next/router';
import AddQuestion from '@/components/survey/AddQuestion';
import { LocationSuggestionInput2 } from '@/components/form/LocationSuggestionField';
import { AutoSaveButton } from '@/components/common/AutoSaveButton';
import { EditQuestionModal } from '@/components/survey/EditQuestionModal';
import Sortable from 'sortablejs';
import { CategoryModal } from '@/components/survey/CategoryModal';

const EditSurvey = () => {
	const router = useRouter();
	const { id: surveyId } = router.query;
	const [step, setStep] = useState(1);
	const [openCatModal, setOpenCatModal] = useState({ open: false });
	const [openQuestionModal, setOpenQuestionModal] = useState({ open: false });
	const [CLIENTS, setClients] = useState([]);
	const [INSPECTORS, setInspectors] = useState([]);
	const [formData, setFormData] = useState({});
	const [questions, setQuestions] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [loadingAPI, setLoadingAPI] = useState(false);
	const [sortedCategories, setSortedCategories] = useState([]);

	const [catSuggestions, setCatSuggestions] = useState([]);
	const [surveyCategories, setSurveyCategories] = useState([]);
	// const [groupedQuestions, setGroupedQuestions] = useState([]);

	const fetchData = async () => {
		try {
			const survey = await http.get('/survey/' + surveyId);
			const clients = await http.get('/client/list');
			const inspectors = await http.get('/inspector/list');
			const categories = await http.get('/category/list');

			if (survey?.status == 200 || categories?.status == 200 || clients?.status == 200) {
				setClients(clients?.data?.result || []);
				setFormData(survey?.data?.result || {});
				setQuestions(survey?.data?.result?.questions || []);
				setSurveyCategories(survey?.data?.result?.categories || []);
				setSortedCategories(survey?.data?.result?.sortedCategories || []);

				setCatSuggestions(categories?.data?.result || []);
			}

			if (inspectors?.status == 200) {
				inspectors.data.result?.sort((a, b) => (a.clientId > b.clientId ? 1 : -1));
				setInspectors(inspectors.data.result);
			}
		} catch (error) {
			errorHandler(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (surveyId) {
			fetchData();
		}
	}, [surveyId]);

	useEffect(() => {
		if (!questions || questions.length === 0) return;

		const categories = {};
		// Group questions by category
		questions.forEach((question) => {
			const categoryId = question.categoryId;
			const category = surveyCategories.find((item) => item.id == categoryId);

			if (!categories[category.id]) {
				categories[category.id] = {
					id: category.id,
					title: category.title,
					questions: [],
				};
			}
			categories[category.id].questions.push(question);
		});

		const newCategories = Object.values(categories);
		let sortedCategoryIds = [];

		// Sort categories
		const newCategoryIds = newCategories.map((category) => category.id);
		const existingCategoryIds = sortedCategories.filter((id) => newCategoryIds.includes(id));
		const newCategoryIdsNotInExisting = newCategoryIds.filter((id) => !existingCategoryIds.includes(id));
		sortedCategoryIds = [...newCategoryIdsNotInExisting, ...existingCategoryIds];

		setSortedCategories(sortedCategoryIds);
	}, [questions]);

	const initialSortable = () => {
		// Initialize SortableJS
		const sortableElement = document.querySelector('#sortableElement > div');
		if (sortableElement) {
			const sortable = new Sortable(sortableElement, {
				group: 'sorting',
				sort: true,
				draggable: '.categoryPanel',
				dataIdAttr: 'data-id',

				onSort: function (evt) {
					let sortableCategories = sortable.toArray();
					// sortableCategories = sortableCategories.map((id) => parseInt(id));

					console.log('sortableCategories', sortableCategories);
					setSortedCategories(sortableCategories);
				},
			});
		} else {
			console.log('sortableElement element not found! (SortableJS)');
		}
	};

	const nextStep = () => {
		if (step == 1) {
			initialSortable();
		}

		const fieldValidation = () => {
			if (!formData?.clientId) {
				toast.error('Client field is required');
				return false;
			}

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

	const onFormSubmit = async (el, showAlert = true) => {
		if (typeof el?.preventDefault === 'function') el.preventDefault();
		setLoadingAPI(true);

		if (!formData?.hotelName) {
			toast.error('Hotel Name is required');
			setLoadingAPI(false);
			return;
		}

		const inspectors = formData?.inspectors ? [formData?.inspectors.toString()] : [];
		const { name: clientName } = CLIENTS.filter((item) => item.id == formData?.clientId)[0].user;

		const payload = {
			hotelName: formData?.hotelName || '',
			campaign: formData?.campaign || '',
			location: formData?.location || '',
			startDate: formData?.startDate || '',
			endDate: formData?.endDate || '',
			inspectors: inspectors,
			clientId: formData?.clientId,
			clientName: clientName || '',
			categories: surveyCategories.map((category) => ({ title: category.title, id: category.id.toString() })),
			questions: questions.map((question) => ({ ...question, categoryId: question.categoryId.toString() })),
			sortedCategories: sortedCategories,
		};

		console.log('payload', payload);

		try {
			const res = await http.put(`/survey/${surveyId}`, payload);
			if (res?.status == 200) {
				if (showAlert) toast.success(res.data.message);
			}
		} catch (error) {
			errorHandler(error);
		} finally {
			setLoadingAPI(false);
		}
	};

	const formatDateForInput = (dateString) => {
		return dateString ? new Date(dateString).toISOString().split('T')[0] : '';
	};

	const formSubmitRef = useRef(onFormSubmit);
	useEffect(() => {
		formSubmitRef.current = onFormSubmit;
	}, [onFormSubmit]);

	useEffect(() => {
		const intervalId = setInterval(() => {
			console.log('Auto saving...', new Date().toLocaleTimeString());
			formSubmitRef.current(null, false);
		}, 2 * 60 * 1000);

		return () => clearInterval(intervalId);
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
				<div className='mb-7 flex justify-between items-center'>
					<h1 className='font-bold text-lg text-[#222]'>Edit Survey</h1>
					<Link href='/admin/surveys' className='btn_primary _flex'>
						<RiArrowLeftLine className='mr-2 h-5 w-5' />
						<span className='hidden md:block'>All Surveys</span>
					</Link>
				</div>

				<div className='py-7 px-5 mb-8 bg-white rounded-md border border-gray-200 shadow-sm shadow-black/5'>
					<form className='w-full' onSubmit={onFormSubmit}>
						{/* STEP 1 */}
						<div className={`step1 details ${step !== 1 && 'hidden'}`}>
							<h3 className='heading text-xl font-semibold mb-8 uppercase'>Survey Details</h3>

							<div className='mb-5'>
								<SelectField
									label={'Client'}
									value={formData.clientId || ''}
									onChange={(el) => setFormData({ ...formData, clientId: el.target.value })}>
									<option value=''>select client</option>

									{/* Display clients */}
									{CLIENTS.map((item) => (
										<option value={item.id} key={item.id}>
											{item.user.name}
										</option>
									))}
								</SelectField>
							</div>

							<div className='mb-5'>
								<FloatField
									label={'Hotel Name'}
									value={formData.hotelName ?? ''}
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
									value={formData.location ?? ''}
									handleInputValue={(text) => setFormData({ ...formData, location: text })}
								/>
							</div>

							<div className='mb-5'>
								<FloatField
									label={'Start Date'}
									value={formatDateForInput(formData.startDate)}
									onChange={(el) => setFormData({ ...formData, startDate: el.target.value })}
									type='date'
									onClick={(el) => el.target.showPicker()}
								/>
							</div>

							<div className='mb-5'>
								<FloatField
									label={'End Date'}
									value={formatDateForInput(formData.endDate)}
									onChange={(el) => setFormData({ ...formData, endDate: el.target.value })}
									type='date'
									onClick={(el) => el.target.showPicker()}
								/>
							</div>

							<div className='mb-5'>
								<SelectField
									label={'Inspector'}
									value={formData.inspectors || ''}
									onChange={(el) => setFormData({ ...formData, inspectors: el.target.value })}>
									<option value=''>select inspector</option>

									{/* Display INSPECTORS */}
									{INSPECTORS.filter((item) => item.clientId == formData.clientId || !item.clientId).map(
										(item, index) => {
											const clientName = CLIENTS.find((client) => client.id == item.clientId)?.user.name;
											return (
												<option key={index} value={item.user.id}>
													{item.user.name} {clientName ? `(${clientName})` : `(External)`}
												</option>
											);
										}
									)}
								</SelectField>
							</div>
						</div>

						{/* STEP 2 */}
						<div className={`step2 questionnaire ${step !== 2 && 'hidden'}`}>
							<h3 className='heading text-xl font-semibold mb-8 uppercase'>Questionnaire</h3>

							<div className='fx_between mb-7'>
								<p className='heading text-base font-medium'>Add Questions</p>
								<div className='btn_outline' onClick={() => setOpenCatModal({ open: true, type: 'create' })}>
									New category
								</div>
							</div>

							<AddQuestion category={surveyCategories} setQuestions={setQuestions} />

							<div className='mt-8 mb-6 border border-gray-300' />
							<p className='heading text-base font-medium mb-7'>Questions ({questions.length})</p>

							{!questions.length ? (
								<p className='text-gray-400 mb-4'>No questions added!</p>
							) : (
								<div className='mb-5' id='sortableElement'>
									<Accordion>
										{sortedCategories.map((categoryId) => {
											const category = surveyCategories.find((item) => item.id == categoryId);
											const categoryQuestions = questions.filter(
												(question) => question.categoryId == categoryId
											);

											return (
												<Accordion.Panel key={category.id} className='PanelBox'>
													<CategoryPanel
														title={category.title}
														count={categoryQuestions?.length}
														id={category.id}>
														{categoryQuestions?.map((question, index) => (
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
						</div>

						<div className='py-5 _flex'>
							<button type='button' onClick={nextStep} className='btn_primary !py-[10px] md:!px-[30px] mr-4'>
								{step == 1 ? 'Next' : 'Previous'}
							</button>
							{step == 2 && (
								<button type='submit' className='btn_primary _flex !px-[10px] !py-[10px] md:!px-[30px]'>
									<RiUpload2Line size={22} className='mr-1.5' />
									<span>Update Survey</span>
								</button>
							)}
						</div>
					</form>
				</div>
			</div>

			<AutoSaveButton action={onFormSubmit} loading={loadingAPI} />

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
	);
};

export default EditSurvey;
