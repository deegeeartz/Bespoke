import { FloatingLabel, Textarea } from 'flowbite-react';

export const SelectField = ({ label, style, children, ...props }) => (
	<div className={`relative w-full ${style}`}>
		<select
			className='block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:!border-[#252525] peer'
			{...props}>
			{children}
		</select>
		<label
			htmlFor='floating_outlined'
			className='absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#252525] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1'>
			{label}
		</label>
	</div>
);

export const FloatField = ({ label, className, ...props }) => (
	<FloatingLabel
		variant='outlined'
		className={'focus:!border-[#252525] peer-focus:!text-[#252525] ' + (className ?? '')}
		width={100}
		label={label}
		{...props}
	/>
);

export const TextAreaField = ({ label, className, ...props }) => (
	<Textarea
		variant='outlined'
		className={
			'focus:!border-[#252525] peer-focus:!text-[#252525] !ring-transparent disabled:!opacity-80 ' +
			(className ?? '')
		}
		width={100}
		label={label}
		{...props}
	/>
);

export const InputFieldStatic = ({ label, style, ...props }) => (
	<div className='relative h-11 w-full min-w-[200px]'>
		<input
			placeholder={label}
			className={
				'peer h-full w-full border-b border-gray-200 bg-transparent pt-2 pb-1.5 font-sans text-sm font-normal text-gray-700 outline outline-0 transition-all placeholder-shown:border-gray-200 focus:border-[#252525] focus:outline-0 ' +
				style
			}
			{...props}
		/>
	</div>
);
