export function getValidUsername(input) {
	// Remove non-alphanumeric characters and limit the result to 8 characters
	let validUsername = input.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
	return validUsername.toLowerCase();
}

export function sanitizeString(string, lowerCase = false) {
	if (!string) return 'null';

	// Remove or replace unwanted characters
	const result = string
		.trim()
		.replace(/[^a-zA-Z0-9_\-\. ]/g, '') // Remove special characters except letters, numbers, underscore, hyphen, period, and space
		.replace(/\s+/g, '_'); // Replace spaces with underscores
	return lowerCase ? result.toLowerCase() : result;
}
