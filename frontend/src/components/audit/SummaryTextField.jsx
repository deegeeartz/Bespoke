const SummaryTextField = ({ value, onChange, ...props }) => {
	return (
		<div>
			<textarea
				id='message'
				rows='7'
				value={value}
				onChange={onChange}
				className='block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 focus:ring-[#fff] focus:border-[#252525] '
				placeholder={!props.readOnly ? 'Write comment...' : ''}
				{...props}></textarea>
		</div>
	);
};

export default SummaryTextField;
