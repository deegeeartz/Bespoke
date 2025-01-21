import { useState } from 'react';
import { FloatField, InputFieldStatic, SelectField } from '@/components/Fields';
import { RiCheckboxBlankCircleLine, RiCloseLine, RiUpload2Line } from 'react-icons/ri';
import { toast } from 'react-toastify';

const EditQuestion = ({ question, category, setQuestions, closeModal }) => {
	// Initialize state with the current question data
	const [data, setData] = useState({ ...question });
	const [options, setOptions] = useState(
		Object.keys(question.options).length ? question.options : { 1: 'YES', 2: 'NO', 3: 'N/A' }
	);
	const [optionFields, setOptionFields] = useState(Object.keys(options || {}));

	const addOptionField = () => {
		const lastID = optionFields[optionFields.length - 1] ?? 0;
		const id = lastID + 1;
		setOptionFields([...optionFields, id]);
		// console.log(id, data, options);
	};

	const onChangeInput = (el, id) => {
		setOptions({ ...options, [id]: el.target.value });
	};

	const removeOptionField = (id) => {
		setOptionFields(optionFields.filter((idx) => idx !== id));
		const newOptions = { ...options, [id]: '' };
		setOptions(newOptions);
	};

	const submitForm = (el) => {
		el.preventDefault();

		// Get valid options
		const filteredOptions =
			data.type == 'multi_choice'
				? Object.fromEntries(Object.entries(options).filter(([key, value]) => value.trim() !== ''))
				: {};

		// Validation
		if (!data.categoryId) {
			toast.error('Category is required!', {});
			return;
		}
		if (!data.type) {
			toast.error('Field Type is required!', {});
			return;
		}
		if (!data.text) {
			toast.error('Question field is required!', {});
			return;
		}
		if (data.type == 'multi_choice' && Object.keys(filteredOptions).length === 0) {
			toast.error('Option field is required!', {});
			return;
		}

		// Update the question data in state
		const updatedQuestionData = { ...data, options: filteredOptions };
		setQuestions((prev) => prev.map((q) => (q.id === question.id ? updatedQuestionData : q)));

		toast.success('Question updated successfully!', {});
		closeModal();
	};

	return (
		<>
			<div className='mb-5 w-full md:flex'>
				<SelectField
					label='Category'
					value={data?.categoryId ?? ''}
					onChange={(el) => setData({ ...data, categoryId: el.target.value })}>
					<option value=''>select category</option>
					{category.map((item, index) => (
						<option key={index} value={item.id}>
							{item.title}
						</option>
					))}
				</SelectField>

				<SelectField
					label='Type'
					style='md:w-1/3 md:ml-4 mt-4 md:m-0'
					value={data.type ?? ''}
					onChange={(el) => setData({ ...data, type: el.target.value })}>
					<option value=''>select field type</option>
					<option value='text'>Text</option>
					<option value='multi_choice'>Multi Choice</option>
				</SelectField>
			</div>

			<div className='mb-6 md:mb-3 md:flex items-center'>
				<div className='w-full mb-4 md:mb-0'>
					<FloatField
						label={'Enter Question'}
						value={data.text ?? ''}
						onChange={(el) => setData({ ...data, text: el.target.value })}
					/>
				</div>

				<button className='btn_primary _flex md:ml-2 !py-[11px] mb-[8px]' onClick={submitForm}>
					<RiUpload2Line size={24} />
					<span className='ml-3 md:hidden'>Update</span>
				</button>
			</div>

			{data.type == 'multi_choice' && (
				<div className='multi_choice pb-2'>
					{optionFields.map((id, index) => (
						<OptionField
							label={'Option ' + id}
							key={id}
							value={options[id]}
							onChange={(el) => onChangeInput(el, id)}
							removeOptionField={() => removeOptionField(id)}
						/>
					))}

					<div className='w-full mb-2 _flex'>
						<RiCheckboxBlankCircleLine size={24} className='text-gray-400 mt-1 mr-3' />
						<InputFieldStatic
							label={'Add option'}
							style='focus:!border-gray-200 placeholder:text-[#252525]'
							onClick={addOptionField}
							readOnly={true}
						/>
						<RiCloseLine size={26} className='mx-4 opacity-0' />
					</div>
				</div>
			)}
		</>
	);
};

const OptionField = ({ label, value, removeOptionField, ...props }) => (
	<div className='w-full mb-2 _flex'>
		<RiCheckboxBlankCircleLine size={24} className='text-gray-400 mt-1 mr-3' />
		<InputFieldStatic label={label} style='' value={value} {...props} />
		<RiCloseLine size={26} className='mx-4 cursor-pointer' onClick={removeOptionField} />
	</div>
);

export default EditQuestion;
