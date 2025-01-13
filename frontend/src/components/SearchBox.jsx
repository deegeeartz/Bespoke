import React from 'react';
import { RiSearch2Line } from 'react-icons/ri';

const SearchBox = ({ searchTerm, searchRecord }) => {
	return (
		<div className='searchBox min-w-[40%]'>
			<div className='relative w-full'>
				<div className='absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none'>
					<RiSearch2Line color='#b2b6bc' />
				</div>
				<input
					type='text'
					className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full ps-10 px-3 py-[8px] focus:border-1 focus:border-[#252525] focus:ring-white'
					placeholder='Search...'
					value={searchTerm}
					onChange={(e) => searchRecord(e.target.value)}
				/>
			</div>
		</div>
	);
};

export default SearchBox;
