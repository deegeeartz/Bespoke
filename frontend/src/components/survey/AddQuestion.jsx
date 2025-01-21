import { useState } from 'react';
import { FloatField, InputFieldStatic, SelectField } from '@/components/Fields';
import { RiAddFill, RiCheckboxBlankCircleLine, RiCloseLine } from 'react-icons/ri';
import { toast } from 'react-toastify';

const AddQuestion = ({ category, setQuestions }) => {
	const [data, setData] = useState({ id: '', type: 'multi_choice', text: '', categoryId: '' });
	const [options, setOptions] = useState({ 1: 'YES', 2: 'NO', 3: 'N/A' });
	const [optionFields, setOptionFields] = useState([1, 2, 3]);

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

		// Add question to state
		const questionData = { ...data, id: Date.now(), options: filteredOptions };
		setQuestions((prev) => [...prev, questionData]);

		// Reset Data
		setData({ ...data, text: '', type: 'multi_choice' });
		// console.log(questionData);
		toast.success('Question added successfully!', {});
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
					<RiAddFill size={24} />
					<span className='ml-3 md:hidden'>Add</span>
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

export default AddQuestion;
