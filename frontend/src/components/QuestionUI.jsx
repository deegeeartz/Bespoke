import { Accordion, Badge } from 'flowbite-react';
import { RiCheckboxBlankCircleLine, RiDeleteBin2Fill, RiEditBoxFill } from 'react-icons/ri';

export const CategoryPanel = ({ title, count, filledCount, summaryField, id, children }) => {
	const CountBadge = () => {
		if (filledCount !== undefined) {
			const badgeColor = filledCount == count ? 'success' : filledCount == 0 ? 'failure' : 'warning';
			return (
				<Badge color={badgeColor} className='px-3 mr-2 [&.bg-green-100]:bg-green-200'>
					{filledCount} / {count}
				</Badge>
			);
		}

		if (summaryField !== undefined) {
			return (
				<Badge color={summaryField.trim() ? 'success' : 'failure'} className='px-3 mr-2'>
					{summaryField.trim() ? 'Filled' : 'Incomplete'}
				</Badge>
			);
		}

		if (count !== undefined) {
			return (
				<Badge color='dark' className='px-3 mr-2'>
					{count}
				</Badge>
			);
		}
	};

	return (
		<>
			<Accordion.Title
				data-id={id}
				className='categoryPanel !ring-opacity-0 py-4 hover:!bg-gray-50 focus:!bg-gray-50 accordionTitle'>
				<div className='w-full capitalize fx_between'>
					<h5 className='text-sm'>{title}</h5>
					<CountBadge />
				</div>
			</Accordion.Title>

			<Accordion.Content>{children}</Accordion.Content>
		</>
	);
};

export const QuestionBox = ({ id, question, removeQuestion, setOpenQuestionModal }) => {
	const optionsData = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;

	return (
		<div className='questionBox flex-col md:flex-row fx_between py-3 px-3 mb-4 border border-gray-200 shadow-sm rounded-md'>
			<div className='md:_flex'>
				<i className='text-[12px] font-semibold pr-3'>#{id}</i>
				<span className='text-[13px] font-medium'>{question.text}</span>

				{question.type === 'multi_choice' && (
					<div className=' mt-3'>
						{Object.entries(optionsData).map(([key, value]) => (
							<div key={key} className='_flex mb-2'>
								<RiCheckboxBlankCircleLine size={14} className='text-gray-400 mr-2' />
								<span className='text-[13px]'>{value}</span>
							</div>
						))}
					</div>
				)}
			</div>

			<div className='flex'>
				{setOpenQuestionModal && (
					<RiEditBoxFill
						size={22}
						onClick={() => setOpenQuestionModal({ open: true, id, question })}
						className='ml-3 md:mt-0 cursor-pointer'
					/>
				)}

				{removeQuestion && (
					<RiDeleteBin2Fill
						size={22}
						onClick={() => {
							const confirmDelete = confirm('Are you sure you want to delete this question?');
							if (!confirmDelete) return;

							removeQuestion(question.id);
						}}
						className='ml-4 mr-1 md:mt-0 text-red-600 cursor-pointer'
					/>
				)}
			</div>
		</div>
	);
};
