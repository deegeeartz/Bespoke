import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Loader } from '@/components/Loader';
import { errorHandler } from '@/utils/errorHandler';
import http from '@/config/axios';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthProvider';
import {
	getYesNoQuestions,
	calculateQuestionStatistics,
	getPieData,
	getRatingStars,
	getBarData,
} from '@/utils/reportUtils';
import { Bar, Pie } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from 'chart.js';
import { Modal } from 'flowbite-react';
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
);

const ViewAudit = () => {
	const router = useRouter();
	const { user } = useAuth();
	const { id: auditId } = router.query;
	const [report, setReport] = useState(null);
	const [responses, setResponses] = useState([]);
	const [survey, setSurvey] = useState({});
	const [questions, setQuestions] = useState([]);
	const [categories, setCategories] = useState([]);
	const [groupedQuestions, setGroupedQuestions] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [uploads, setUploads] = useState({});

	const [yesQuestions, setYesQuestions] = useState(null);
	const [noQuestions, setNoQuestions] = useState(null);
	const [stats, setStats] = useState(null);
	const [chartData, chartPieData] = useState(null);
	const [categoryStats, setCategoryStats] = useState(null);
	const [openModal, setOpenModal] = useState({ open: false, content: null });

	const fetchData = async () => {
		try {
			const { status, data } = await http.get('/audit/' + auditId);

			if (status == 200) {
				setReport(data.result);
				setResponses(data.result.responses);
				setSurvey(data.result.survey);
				setQuestions(data.result.survey.questions);
				setCategories(data.result.survey.categories);
				setUploads(data.result.uploads);

				const { yesQuestions, noQuestions } = getYesNoQuestions(
					data.result.responses,
					data.result.survey.questions,
					data.result.survey.categories
				);
				setYesQuestions(yesQuestions);
				setNoQuestions(noQuestions);
				const { totalCount, yesCount, noCount, yesPercentage, noPercentage } = calculateQuestionStatistics(
					yesQuestions,
					noQuestions
				);
				setStats({ totalCount, yesCount, noCount, yesPercentage, noPercentage });

				// Add response to questions in groupedQuestions
				const _groupedQuestions = data.result.groupedQuestions.map((group) => {
					let questions = group.questions.map((question) => {
						const response = data.result.responses.find((response) => response.questionId === question.id);
						let yesOrNo = '';
						if (response?.optionText?.toUpperCase() == 'YES') {
							yesOrNo = 'YES';
						} else if (response?.optionText?.toUpperCase() == 'NO') {
							yesOrNo = 'NO';
						}
						return { ...question, response, yesOrNo };
					});

					questions = questions.filter((question) =>
						['NO', 'YES'].includes(question?.response?.optionText?.toUpperCase())
					);

					return { ...group, questions };
				});
				setGroupedQuestions(_groupedQuestions);
				console.log('groupedQuestions', _groupedQuestions);

				// Get best and worst performing categories
				let _categoryStats = [];
				_groupedQuestions.forEach((group) => {
					const yesCount = group.questions.filter((question) => question.yesOrNo == 'YES').length;
					const noCount = group.questions.filter((question) => question.yesOrNo == 'NO').length;

					const yesPercentage = yesCount ? ((yesCount / totalCount) * 100).toFixed(2) : 0;
					const noPercentage = noCount ? ((noCount / totalCount) * 100).toFixed(2) : 0;
					_categoryStats.push({
						id: group.id,
						title: group.title,
						yesCount,
						noCount,
						yesPercentage,
						noPercentage,
						totalCount: yesCount + noCount || 0,
					});
				});
				// Sort by yesPercentage or NoPercentage
				_categoryStats.sort((a, b) => b.noPercentage - a.noPercentage);
				_categoryStats.sort((a, b) => b.yesPercentage - a.yesPercentage);

				setCategoryStats(_categoryStats);

				const pieData = getPieData(yesCount, noCount);
				// const barData = getBarData(yesPercentage, noPercentage, averageStats);
				chartPieData({ pieData });

				console.log('yesQuestions', yesQuestions, 'noQuestions', noQuestions);
				console.log(
					data.result.responses.filter((response) => response.optionText),
					stats,
					pieData
				);

				// Print the report
				setTimeout(() => {
					const confirm = window.confirm('Do you want to download the report?');
					if (confirm) {
						window.print();
					}
				}, 2800);
			}
		} catch (error) {
			errorHandler(error);
			if (error?.response?.status == 404) router.push(`/${user?.role?.toLowerCase()}`);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (auditId) {
			fetchData();
			// Set the title of the page
			document.title = 'Bespoke - Audit Report #' + auditId;
		}
	}, [auditId]);

	if (isLoading) {
		return (
			<div className='h-screen grid_center'>
				<Loader />
			</div>
		);
	}

	const QuestionRow = ({ question, response, category }) => {
		// console.log('QuestionRow', question, response, category);

		return (
			<tr>
				{category && <th>{category?.title}</th>}
				<td>{question.text || '---'}</td>
				<td>{response?.optionText ? response.optionText : '---'}</td>
				<td>{response?.answer || '---'}</td>
				<td>
					{response?.files?.length
						? response.files.map((file, index) => <MediaLink key={file?.id} file={file} index={index} />)
						: 'None'}
				</td>
				<td>
					{response?.files?.length
						? response.files.map((file, index) => <PreviewMedia key={index} file={file} index={index} />)
						: ''}
				</td>
			</tr>
		);
	};

	const PreviewMedia = ({ file, index }) => {
		const fileExtension = file.name.split('.').pop();
		const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
		const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension);

		const Content = (
			<>
				{isImage && <img src={`${process.env.NEXT_PUBLIC_FILE_URL}/${file.id}`} alt={`media-${index + 1}`} />}
				{isVideo && (
					<video controls muted>
						<source src={`${process.env.NEXT_PUBLIC_FILE_URL}/${file.id}`} type={`video/${fileExtension}`} />
					</video>
				)}
			</>
		);
		return (
			<div style={previewStyle} onClick={() => setOpenModal({ open: true, content: Content })}>
				{Content}
			</div>
		);
	};

	return (
		<div className='p-6'>
			<div className='pdf_report container mx-auto' id='pdf_report'>
				<section className='header py-5 border border-gray-300'>
					<h1 className='text-4xl mb-5 !font-bold'>Survey Report</h1>
					<h2 className='text-2xl'>{survey.clientName}</h2>
				</section>

				<section className='statistics'>
					<h3 className='!text-left text-xl underline my-5'>Statistics</h3>

					<div className='statistics-content'>
						<div className='pie-chart-container'>
							{chartData?.pieData && (
								<Pie data={chartData.pieData} options={{ maintainAspectRatio: false }} />
							)}
						</div>

						<div className='ratings'>
							<div className='flex w-fit mb-4 items-center border border-green-300 text-green-800 text-base font-medium px-2.5 py-0.5 rounded-full'>
								<span className='w-2 h-2 me-2 border-4 border-green-500 rounded-full'></span>
								<span>Yes: {Number(stats?.yesPercentage)}%</span>
							</div>

							<div className='flex w-fit items-center border border-red-300 text-red-800 text-base font-medium px-2.5 py-0.5 rounded-full'>
								<span className='w-2 h-2 me-2 border-4 border-red-500 rounded-full'></span>
								<span>No: {Number(stats?.noPercentage)}% </span>
							</div>

							<p className='my-5 font-semibold'>
								Rating:
								<span className='stars ml-2'>{getRatingStars(stats?.yesPercentage)}</span>
							</p>

							<div className='rating-explanation'>
								<p>
									<span className='stars'>★★★</span> - 80% and above
								</p>
								<p>
									<span className='stars'>★★</span> - 60% to 79%
								</p>
								<p>
									<span className='stars'>★</span> - Below 60%
								</p>
							</div>
						</div>
					</div>

					{/* <div className='bar-chart-container'>
						{chartData?.barData && <Bar data={chartData.barData} options={{ maintainAspectRatio: false }} />}
					</div> */}
				</section>

				<section className='no-responses mt-8'>
					<h3 className='text-xl'>NO Responses</h3>

					<table className='no-responses-table'>
						<thead>
							<tr>
								<th>Category</th>
								<th>Question</th>
								<th>Answer</th>
								<th>Comment</th>
								<th>Media</th>
								<th>Preview</th>
							</tr>
						</thead>
						<tbody>
							{noQuestions?.length ? (
								noQuestions.map((question) => (
									<QuestionRow
										key={question.id}
										question={question}
										response={question.response}
										category={categories.find((category) => category.id === question.categoryId)}
									/>
								))
							) : (
								<tr>
									<td colSpan='6' className='text-center'>
										No responses found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</section>

				<section id='report-content'>
					<h3 className='text-xl'>ALL Responses</h3>

					{groupedQuestions.map(({ id, title, questions }) => {
						const validQuestions = questions.filter(
							(question) => question.response.optionText || question.response.answer
						);
						const stats = categoryStats?.find((category) => category.id === id);
						// console.log(title, validQuestions);

						if (validQuestions?.length) {
							return (
								<div key={id}>
									<h4 className='!text-left mt-10 mb-4'>
										{title}{' '}
										<span className='text-gray-600 font-normal'>
											( {stats?.yesPercentage}% Yes - {stats?.noPercentage}% No )
										</span>
									</h4>

									<div id='report-container'>
										<table>
											<thead>
												<tr>
													<th>Question</th>
													<th>Answer</th>
													<th>Comment</th>
													<th>Media</th>
													<th>Preview</th>
												</tr>
											</thead>

											<tbody>
												{validQuestions.map((question) => (
													<QuestionRow
														key={question.id}
														question={question}
														response={responses.find((response) => response.questionId === question.id)}
													/>
												))}
											</tbody>
										</table>
									</div>
								</div>
							);
						} else {
							return null;
						}
					})}
				</section>

				{categoryStats?.[0] && (
					<section className='category-performance'>
						<h3 className='text-xl'>Category Performance</h3>

						<table>
							<thead>
								<tr>
									<th>Category</th>
									<th>Yes Percentage</th>
									<th>No Percentage</th>
								</tr>
							</thead>

							<tbody>
								{categoryStats?.map((category) =>
									category.title ? (
										<tr key={category.id}>
											<td>{category.title}</td>
											<td>{category.yesPercentage}%</td>
											<td>{category.noPercentage}%</td>
										</tr>
									) : null
								)}
							</tbody>
						</table>

						<h3 className='text-xl mt-8 mb-4'>Best Performing Category</h3>
						<p className='text-center'>
							{categoryStats[0]?.title}: {categoryStats[0]?.yesPercentage}% Yes
						</p>

						<h3 className='text-xl mt-5 mb-4'>Underperforming Category</h3>
						<p className='text-center'>
							{categoryStats[categoryStats.length - 1]?.title}:{' '}
							{categoryStats[categoryStats.length - 1]?.yesPercentage}% Yes
						</p>
					</section>
				)}

				<section className='category-performance'>
					<h3 className='text-xl'>Summary</h3>

					<table>
						<thead>
							<tr>
								<th style={{ minWidth: '184px' }}>Summary</th>
								<th>Comment</th>
								<th>Media</th>
								<th>Preview</th>
							</tr>
						</thead>

						<tbody>
							<tr>
								<td>Brand Standard</td>
								<td>{report.brandStandard || '---'}</td>
								<td>
									{uploads?.brandStandard?.length
										? uploads.brandStandard.map((file, index) => (
												<MediaLink key={index} index={index} file={file} />
										  ))
										: 'None'}
								</td>
								<td>
									{uploads?.brandStandard?.length
										? uploads.brandStandard.map((file, index) => (
												<PreviewMedia key={index} index={index} file={file} />
										  ))
										: ''}
								</td>
							</tr>

							<tr>
								<td>Executive Summary</td>
								<td>{report.executiveSummary || '---'}</td>
								<td>
									{uploads?.executiveSummary?.length
										? uploads.executiveSummary.map((file, index) => (
												<MediaLink key={index} index={index} file={file} />
										  ))
										: 'None'}
								</td>
								<td>
									{uploads?.executiveSummary?.length
										? uploads.executiveSummary.map((file, index) => (
												<PreviewMedia key={index} index={index} file={file} />
										  ))
										: ''}
								</td>
							</tr>

							<tr>
								<td>Detailed Summary</td>
								<td>{report.detailedSummary || '---'}</td>

								<td>
									{uploads?.detailedSummary?.length
										? uploads.detailedSummary.map((file, index) => (
												<MediaLink key={index} index={index} file={file} />
										  ))
										: 'None'}
								</td>
								<td>
									{uploads?.detailedSummary?.length
										? uploads.detailedSummary.map((file, index) => (
												<PreviewMedia key={index} index={index} file={file} />
										  ))
										: ''}
								</td>
							</tr>

							<tr>
								<td>Scenario</td>
								<td>{report.scenario || '---'}</td>

								<td>
									{uploads?.scenario?.length
										? uploads.scenario.map((file, index) => (
												<MediaLink key={index} index={index} file={file} />
										  ))
										: 'None'}
								</td>
								<td>
									{uploads?.scenario?.length
										? uploads.scenario.map((file, index) => (
												<PreviewMedia key={index} index={index} file={file} />
										  ))
										: ''}
								</td>
							</tr>

							<tr>
								<td>Expense</td>
								<td>{report.expense || '---'}</td>

								<td>
									{uploads?.expense?.length
										? uploads.expense.map((file, index) => (
												<MediaLink key={index} index={index} file={file} />
										  ))
										: 'None'}
								</td>
								<td>
									{uploads?.expense?.length
										? uploads.expense.map((file, index) => (
												<PreviewMedia key={index} index={index} file={file} />
										  ))
										: ''}
								</td>
							</tr>
						</tbody>
					</table>
				</section>
			</div>

			<button
				color={'dark'}
				onClick={() => window.print()}
				className='mx-auto mb-3 px-2 text-[17px] font-bold block border border-gray-500
				'>
				Download Report
			</button>

			{openModal.open && <PreviewModal openModal={openModal} setOpenModal={setOpenModal} />}
		</div>
	);
};

const MediaLink = ({ file, index }) => {
	const linkStyle = {
		display: 'block',
		marginBottom: '12px',
		fontSize: '12px',
		color: '#20207a',
		wordBreak: 'break-all',
		minWidth: '135px',
	};

	const fileExtension = file.name.split('.').pop();
	const name = `uploaded-file-${index + 1}.${fileExtension}`;
	return (
		<a href={`${process.env.NEXT_PUBLIC_FILE_URL}/${file.id}` || '#'} target='_blank' style={linkStyle}>
			{name}
		</a>
	);
};

const PreviewModal = ({ openModal, setOpenModal }) => {
	return (
		<>
			<Modal
				dismissible={true}
				size={'7xl'}
				show={openModal.open}
				onClose={() => setOpenModal({ open: false })}>
				{/* <Modal.Header></Modal.Header> */}
				<Modal.Body>
					<div className='flex justify-center'>{openModal.content}</div>
				</Modal.Body>
			</Modal>
		</>
	);
};

const previewStyle = {
	display: 'block',
	marginBottom: '10px',
	maxWidth: '100px',
	maxHeight: '80px',
	minHeight: '40px',
	backgroundColor: '#919191',
	border: '1px solid #878787',
	overflow: 'hidden',
};

export default ViewAudit;
