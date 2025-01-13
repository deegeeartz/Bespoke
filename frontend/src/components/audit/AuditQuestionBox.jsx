const { Button } = require('flowbite-react');
const { TextAreaField } = require('../Fields');
const { FaPlus } = require('react-icons/fa');

const AuditQuestionBox = ({
	id,
	question,
	handleInputChange,
	responses,
	setFileModal,
	categoryTitle,
	view,
}) => {
	const response = responses.find((res) => res.questionId === question.id);
	const fileData = typeof response?.files === 'string' ? JSON.parse(response?.files) : response?.files;
	const optionsData = typeof question?.options === 'string' ? JSON.parse(question.options) : question.options;

	const showFileModal = () => {
		setFileModal({ open: true, data: { ...response, index: id, category: categoryTitle } });
	};

	return (
		<div className='box py-8 border-b-2 border-gray-300 last-of-type:border-none'>
			<div
				className={`title mb-5 _flex px-1 ${
					response?.answer?.trim() || response?.optionAnswer || response?.skip ? '' : 'bg-red-600 text-white'
				}`}>
				<i className='text-[12px] font-semibold pr-3'>#{id}</i>
				<span className='text-[15px] font-medium'>{question.text}</span>
			</div>

			{question.type === 'multi_choice' && (
				<div className='mb-6'>
					{Object.entries(optionsData).map(([key, value], index) => {
						const uniqueKey = `option_${question.id}_${key}`;
						return (
							<div key={index} className='flex items-center mb-4'>
								<input
									type='radio'
									id={uniqueKey}
									name={'options_' + question.id}
									className='w-4 h-4 border-gray-300 focus:ring-0 !ring-white'
									checked={response?.optionAnswer === key}
									onChange={() => handleInputChange(question.id, { optionAnswer: key, optionText: value })}
									disabled={view}
								/>
								<label htmlFor={uniqueKey} className='block ms-2 text-sm font-normal'>
									{value}
								</label>
							</div>
						);
					})}
				</div>
			)}

			<div className='responses grid md:flex md:fx_between gap-3 md:gap-5'>
				<div className='w-full mb-[-5px]'>
					<TextAreaField
						label='Enter Comment'
						value={response?.answer || ''}
						onChange={(e) => handleInputChange(question.id, { answer: e.target.value })}
						disabled={view}
						placeholder={view ? '' : 'Enter your comment here...'}
					/>
				</div>

				<div className='flex items-center'>
					<input
						id={'skip_' + question.id}
						type='checkbox'
						className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:!ring-white'
						checked={response?.skip}
						onChange={(e) => handleInputChange(question.id, { skip: e.target.checked })}
						disabled={view}
					/>
					<label
						htmlFor={'skip_' + question.id}
						className='ms-2 text-sm font-medium text-gray-900 lg:whitespace-nowrap'>
						In Progress
					</label>
				</div>

				<div className='_flex'>
					<Button
						color='success'
						size='sm'
						className='text-nowrap [&>span]:items-center !ring-gray-200'
						onClick={showFileModal}>
						<FaPlus className='mr-2 text-[16px]' />
						File <span className='pl-2 ml-2 border-l'>{fileData?.length || 0}</span>
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AuditQuestionBox;
