import { useEffect, useState } from 'react';
import Layout from '@/components/layout/DashboardLayout';
import { RiAddFill, RiArrowLeftLine } from 'react-icons/ri';
import { Accordion, Badge } from 'flowbite-react';
import { FloatField, SelectField } from '@/components/Fields';
import { CategoryPanel } from '@/components/QuestionUI';
import { toast } from 'react-toastify';
import { Loader } from '@/components/Loader';
import { errorHandler } from '@/utils/errorHandler';
import http from '@/config/axios';
import { useRouter } from 'next/router';
import AuditQuestionBox from '@/components/audit/AuditQuestionBox';
import SummaryTextField from '@/components/audit/SummaryTextField';
import { LoaderOverlay } from '../../../components/common/LoaderOverlay';
import { UploadsModal } from '@/components/UploadsModal';
import { UploadFileButton } from '@/components/common/UploadFileButton';
import { AuditUploadModal } from '@/components/audit/AuditUploadModal';

const StartAudit = () => {
	const router = useRouter();
	const { id: surveyId } = router.query;
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({});
	const [categories, setCategories] = useState([]);
	const [responses, setResponses] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [fileModal, setFileModal] = useState({ open: false, data: {} });
	const [loadingRequest, setLoadingRequest] = useState(false);
	const [uploads, setUploads] = useState({});
	const [uploadModal, setUploadModal] = useState({ open: false, data: {} });

	const fetchData = async () => {
		try {
			const survey = await http.get('/inspector_survey/' + surveyId);

			if (survey?.status == 200) {
				// console.log(survey.data.result);

				setFormData(survey.data.result);
				setCategories(survey.data.result.groupedQuestions);
				setResponses(
					survey.data.result.questions.map((ques) => ({
						questionId: ques.id,
						answer: '',
						optionAnswer: '',
						optionText: '',
						files: [],
						skip: false,
					}))
				);
			}
		} catch (error) {
			errorHandler(error);
			if (error?.response?.status == 404) router.push('/inspector');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (surveyId) {
			fetchData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [surveyId]);

	if (isLoading) {
		return (
			<div className='h-screen grid_center'>
				<Loader />
			</div>
		);
	}

	const nextStep = () => {
		// console.log(formData);
		window.scrollTo({ top: 0, behavior: 'smooth' });
		step == 1 ? setStep(2) : setStep(1);
	};

	const countFilledQuestions = (questions) => {
		return questions.filter((question) => {
			const response = responses.find((r) => r.questionId == question.id);
			return response && (response.answer.trim() || response.optionAnswer || response.skip);
		}).length;
	};

	const handleInputChange = (questionId, data) => {
		// console.log('questionId:', questionId, 'field:', 'data:', data, 'responses:', responses);
		setResponses(responses.map((res) => (res.questionId === questionId ? { ...res, ...data } : res)));
	};

	const onFormSubmit = async (el, showAlert = true) => {
		if (el && typeof el.preventDefault === 'function') el.preventDefault();
		setLoadingRequest(true);

		const payload = {
			expense: formData?.expense,
			brandStandard: formData?.brandStandard,
			executiveSummary: formData?.executiveSummary,
			detailedSummary: formData?.detailedSummary,
			scenario: formData?.scenario,
			status: formData?.status || 'in progress',
			surveyId,
			uploads,
			responses,
		};

		try {
			const { status, data } = await http.post('/audit', payload);
			if (status == 201) {
				const { id } = data.result;
				toast.success(data.message);
				router.push(`/audit/${id}/edit`); // http://localhost:3000/audit/1/edit
			}
		} catch (error) {
			errorHandler(error);
			setLoadingRequest(false);
		}
	};

	return (
		<>
			{loadingRequest && <LoaderOverlay />}
			<Layout>
				<div className='content p-6'>
					<div className='mb-7 flex justify-between items-center'>
						<h1 className='font-bold text-lg text-[#222]'>Survey #{surveyId}</h1>
					</div>

					<div className='py-7 px-5 mb-8 bg-white rounded-md border border-gray-200 shadow-sm shadow-black/5'>
						<form className='w-full readOnly' onSubmit={onFormSubmit}>
							{/* STEP 1 */}
							<div className={`step1 details ${step !== 1 && 'hidden'}`}>
								<h3 className='heading text-xl font-semibold mb-8 uppercase'>Survey Details</h3>

								<div className='mb-5'>
									<FloatField label={'Client'} value={formData.clientName || ''} readOnly />
								</div>

								<div className='mb-5'>
									<FloatField label={'Hotel Name'} value={formData.hotelName || ''} readOnly />
								</div>

								<div className='mb-5'>
									<FloatField label={'Campaign'} value={formData.campaign || ''} readOnly />
								</div>

								<div className='mb-5'>
									<FloatField label={'Location'} value={formData.location || ''} readOnly />
								</div>

								<div className='mb-5'>
									<FloatField
										label={'Start Date'}
										value={new Date(formData.startDate).toDateString() || ''}
										readOnly
									/>
								</div>

								<div className='mb-5'>
									<FloatField
										label={'End Date'}
										value={new Date(formData.endDate).toDateString() || ''}
										readOnly
									/>
								</div>
							</div>

							{/* STEP 2 */}
							<div className={`step2 questionnaire ${step !== 2 && 'hidden'}`}>
								<h3 className='heading text-xl font-semibold mb-8 uppercase flex items-center'>
									<span>Questionnaire</span>
									<Badge color='dark' className='px-3 ml-4'>
										{formData?.questions?.length}
									</Badge>
								</h3>

								{!formData?.questions?.length ? (
									<p className='text-gray-400 mb-4'>No questions found!</p>
								) : (
									<div className='mb-5'>
										<Accordion>
											{categories.map((category) => (
												<Accordion.Panel key={category.id} className='box'>
													<CategoryPanel
														title={category.title}
														filledCount={countFilledQuestions(category.questions)}
														count={category.questions.length}>
														{/* Display questions */}
														{category.questions.map((question, index) => (
															<AuditQuestionBox
																key={index}
																id={index + 1}
																question={question}
																handleInputChange={handleInputChange}
																responses={responses}
																setFileModal={setFileModal}
																categoryTitle={category.title}
															/>
														))}
													</CategoryPanel>
												</Accordion.Panel>
											))}
										</Accordion>
									</div>
								)}

								<h3 className='heading text-xl font-semibold pt-4 mb-8 uppercase'>Summary</h3>

								<Accordion>
									<Accordion.Panel className='box'>
										<CategoryPanel title={'Brand Standard'} summaryField={formData?.brandStandard || ''}>
											<div className='_flex mb-3'>
												<UploadFileButton
													files={uploads?.brandStandard}
													onClick={() => {
														setUploadModal({
															open: true,
															data: {
																id: 'brandStandard',
																title: 'Brand Standard',
																files: uploads?.brandStandard,
															},
														});
													}}
												/>
											</div>

											<SummaryTextField
												value={formData?.brandStandard || ''}
												onChange={(el) => setFormData({ ...formData, brandStandard: el.target.value })}
											/>
										</CategoryPanel>
									</Accordion.Panel>

									<Accordion.Panel className='box'>
										<CategoryPanel
											title={'Executive Summary'}
											summaryField={formData?.executiveSummary || ''}>
											<div className='_flex mb-3'>
												<UploadFileButton
													files={uploads?.executiveSummary}
													onClick={() => {
														setUploadModal({
															open: true,
															data: {
																id: 'executiveSummary',
																title: 'Executive Summary',
																files: uploads?.executiveSummary,
															},
														});
													}}
												/>
											</div>

											<SummaryTextField
												value={formData?.executiveSummary || ''}
												onChange={(el) => setFormData({ ...formData, executiveSummary: el.target.value })}
											/>
										</CategoryPanel>
									</Accordion.Panel>

									<Accordion.Panel className='box'>
										<CategoryPanel title={'Detailed Summary'} summaryField={formData?.detailedSummary || ''}>
											<div className='_flex mb-3'>
												<UploadFileButton
													files={uploads?.detailedSummary}
													onClick={() => {
														setUploadModal({
															open: true,
															data: {
																id: 'detailedSummary',
																title: 'Detailed Summary',
																files: uploads?.detailedSummary,
															},
														});
													}}
												/>
											</div>

											<SummaryTextField
												value={formData?.detailedSummary || ''}
												onChange={(el) => setFormData({ ...formData, detailedSummary: el.target.value })}
											/>
										</CategoryPanel>
									</Accordion.Panel>

									<Accordion.Panel className='box'>
										<CategoryPanel title={'Scenario'} summaryField={formData?.scenario || ''}>
											<div className='_flex mb-3'>
												<UploadFileButton
													files={uploads?.scenario}
													onClick={() => {
														setUploadModal({
															open: true,
															data: {
																id: 'scenario',
																title: 'Scenario',
																files: uploads?.scenario,
															},
														});
													}}
												/>
											</div>

											<SummaryTextField
												value={formData?.scenario || ''}
												onChange={(el) => setFormData({ ...formData, scenario: el.target.value })}
											/>
										</CategoryPanel>
									</Accordion.Panel>

									<Accordion.Panel className='box'>
										<CategoryPanel title={'Expense'} summaryField={formData?.expense || ''}>
											<div className='_flex mb-3'>
												<UploadFileButton
													files={uploads?.expense}
													onClick={() => {
														setUploadModal({
															open: true,
															data: {
																id: 'expense',
																title: 'Expense',
																files: uploads?.expense,
															},
														});
													}}
												/>
											</div>

											<SummaryTextField
												value={formData?.expense || ''}
												onChange={(el) => setFormData({ ...formData, expense: el.target.value })}
											/>
										</CategoryPanel>
									</Accordion.Panel>
								</Accordion>

								<div className='py-5 mt-4'>
									<p className='text-[15px] font-medium pb-2'>Audit Status</p>

									<select
										className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-white focus:border-[#252525] block w-full p-2.5 '
										value={formData.status || ''}
										onChange={(el) => setFormData({ ...formData, status: el.target.value })}
										//
									>
										<option value={'in progress'}>In progress</option>
										<option value={'completed'}>Completed</option>
										<option value={'abandoned'}>Abandoned</option>
									</select>
								</div>
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
										<span>Save Answers</span>
									</button>
								)}
							</div>
						</form>
					</div>
				</div>

				{fileModal.open && (
					<AuditUploadModal
						openModal={fileModal}
						setOpenModal={setFileModal}
						handleInputChange={handleInputChange}
						survey={formData}
						saveAudit={onFormSubmit}
					/>
				)}

				{uploadModal.open && (
					<UploadsModal
						openModal={uploadModal}
						setOpenModal={setUploadModal}
						setUploads={setUploads}
						survey={{ id: surveyId }}
						saveAudit={onFormSubmit}
					/>
				)}
			</Layout>
		</>
	);
};

export default StartAudit;
