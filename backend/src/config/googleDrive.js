const { google } = require('googleapis');

const apikeys = require('./googleapis_config.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];

// A Function that can provide access to google drive api
async function authorize() {
	const jwtClient = new google.auth.JWT(
		apikeys.client_email,
		null,
		apikeys.private_key,
		SCOPE,
		process.env.GOOGLE_DRIVE_OWNER_EMAIL
	);
	await jwtClient.authorize();
	return jwtClient;
}

// Function to upload a file to Google Drive
async function uploadFileToDrive(authClient, metaData, media) {
	const drive = google.drive({ version: 'v3', auth: authClient });

	try {
		const response = await drive.files.create({
			resource: metaData,
			media: media,
			fields: 'id',
			supportsAllDrives: true,
		});
		return response.data;
	} catch (error) {
		console.error('Error uploading file to Google Drive:', error);
		throw new Error('File upload failed.');
	}
}

module.exports = { authorize, uploadFileToDrive };
