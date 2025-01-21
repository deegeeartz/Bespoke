const handlePrismaError = (error) => {
	console.error('An error occurred:', error);

	if (error?.name === 'PrismaClientValidationError') {
		switch (error.code) {
			case 'P2002':
				// Handling duplicate key errors
				return {
					status: 400,
					response: { error: `Duplicate field value: ${error.meta.target}`, errorObject: error },
				};
			case 'P2014':
				// Handling invalid id errors
				return { status: 400, response: { error: `Invalid ID: ${error.meta.target}`, errorObject: error } };
			case 'P2003':
				// Handling invalid data errors
				return {
					status: 400,
					response: { error: `Invalid input data: ${error.meta.target}`, errorObject: error },
				};
			default:
				// Handling other validation errors
				return { status: 400, response: { error: 'Validation error!', errorObject: error } };
		}
	}

	if (error?.name === 'PrismaClientKnownRequestError') {
		switch (error.code) {
			case 'P2003':
				// Handling foreign key constraint errors
				return {
					status: 400,
					response: {
						error: `Request failed due to conflict with related records. Remove records and try again.`,
						errorObject: error,
					},
				};
			default:
				// Handling other database errors
				return { status: 500, response: { error: 'Database error!', errorObject: error } };
		}
	}

	// Handling all other errors
	return { status: 500, response: { error: 'An error occurred!', errorObject: error } };
};

module.exports = handlePrismaError;
