import axios from 'axios';
import { TextInput } from 'flowbite-react';
import { useState } from 'react';
import { FloatField } from '@/components/Fields';

const fetchSuggestions = async (text, setSuggestions) => {
	if (text.length > 3) {
		try {
			const query = encodeURIComponent(text);
			const APIkey = 'jyMX2KtYqmUlu3JR3plEt9cJMRdiTAP5';
			const url = `https://api.tomtom.com/search/2/search/${query}.json?key=${APIkey}&limit=6`;

			const res = await axios.get(url);
			if (res.data.results) {
				let results = res.data.results.map((item) => {
					const {
						streetName,
						municipalitySubdivision,
						municipality,
						freeformAddress,
						country,
						countrySubdivision,
					} = item?.address;
					// Retrieve address
					const street = streetName && `${streetName}, ${municipalitySubdivision}, ${countrySubdivision}`;
					let location = street || municipalitySubdivision || municipality || freeformAddress;
					location = location.replace('undefined,', '');
					location = location.replace('undefined', '');

					return {
						name: item.poi?.name || item?.address?.freeformAddress,
						address: country ? `${location}, ${country}` : location,
					};
				});
				setSuggestions(results);
			}
			// console.log(res.data.results);
		} catch (error) {
			console.log(error);
			setSuggestions([]);
		}
	} else setSuggestions([]);
};

export const LocationSuggestionInput1 = ({ id, value, register, setValue }) => {
	const [suggestions, setSuggestions] = useState([]);

	const selectLocation = (address) => {
		// console.log(address);
		setValue(id, address);
		setSuggestions([]);
	};

	const handleFocus = () => {
		setTimeout(() => {
			setSuggestions([]);
		}, 500);
	};

	return (
		<div className='relative'>
			<TextInput
				id={id}
				defaultValue={value}
				{...register(id, { onBlur: (e) => handleFocus(e) })}
				onChange={(el) => fetchSuggestions(el.target.value, setSuggestions)}
				required
			/>

			{suggestions.length > 0 && (
				<div className='suggestions'>
					{suggestions.map((item, index) => (
						<div key={index} className='item' onClick={() => selectLocation(item.address)}>
							{item.address}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export const LocationSuggestionInput2 = ({ label, value, handleInputValue }) => {
	const [suggestions, setSuggestions] = useState([]);

	const selectLocation = (address) => {
		console.log(address);
		handleInputValue(address);
		setSuggestions([]);
	};

	const handleFocus = () => {
		setTimeout(() => {
			setSuggestions([]);
		}, 500);
	};

	return (
		<div className='relative'>
			<FloatField
				label={label}
				value={value}
				onChange={(el) => {
					handleInputValue(el.target.value);
					fetchSuggestions(el.target.value, setSuggestions);
				}}
				onBlur={(e) => handleFocus()}
			/>

			{suggestions.length > 0 && (
				<div className='suggestions mt-2'>
					{suggestions.map((item, index) => (
						<div key={index} className='item' onClick={() => selectLocation(item.address)}>
							{item.address}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
