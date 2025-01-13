const express = require('express');
const router = express.Router();

const { google } = require('googleapis');
const { Readable } = require('stream');
const { authorize, uploadFileToDrive } = require('../config/googleDrive');
const { auth } = require('../middleware/auth.middleware');

const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

// Convert buffer to a readable stream
function bufferToStream(buffer) {
	const stream = Readable.from(buffer);
	return stream;
}

// Route to upload a file to Google Drive
router.post('/', auth, async (req, res) => {
	const { fileName, mimeType } = req.body;
	const uploadedFile = req.files.file;

	try {
		if (!uploadedFile) {
			return res.status(400).json({ message: 'No file uploaded.' });
		}

		const fileMetaData = {
			name: fileName,
			parents: [folderId], // A folder ID to which file will get uploaded
		};
		const media = { body: bufferToStream(uploadedFile.data), mimeType: mimeType };

		// Google Drive API
		const authClient = await authorize();
		const response = await uploadFileToDrive(authClient, fileMetaData, media);

		return res.status(200).json({
			message: 'Upload successful!',
			result: {
				id: response.id,
				url: `https://drive.google.com/file/d/${response.id}/view`,
			},
		});
	} catch (error) {
		console.error('Error in file upload process:', error);
		return res.status(500).json({ message: error?.message || 'Error uploading file!' });
	}
});

// Route to display a file from Google Drive
router.get('/view/:fileId', async (req, res) => {
	const { fileId } = req.params;

	try {
		const authClient = await authorize();
		const drive = google.drive({ version: 'v3', auth: authClient });
		const fileMetadata = await drive.files.get({ fileId, fields: 'mimeType, name', supportsAllDrives: true });

		// Set the MIME type for the response
		const mimeType = fileMetadata.data.mimeType;
		res.setHeader('Content-Type', mimeType);
		res.setHeader('Content-Disposition', `inline; filename=${fileMetadata?.data?.name}`);

		const fileStream = await drive.files.get(
			{ fileId, alt: 'media', supportsAllDrives: true }, // Fetch the file content
			{ responseType: 'stream' } // Stream it directly
		);

		// Pipe the file stream to the response
		fileStream.data
			.on('error', (err) => {
				console.error('Error streaming file:', err);
				res.status(500).send('Error streaming file');
			})
			.pipe(res);
	} catch (error) {
		console.error('Error displaying file:', error);
		return res.status(500).json({ message: error?.message || 'Error displaying file!' });
	}
});

// Route to delete a file from Google Drive
router.post('/delete/:fileId', auth, async (req, res) => {
	const { fileId } = req.params;

	try {
		const authClient = await authorize();
		const drive = google.drive({ version: 'v3', auth: authClient });

		// Delete the file by ID
		await drive.files.delete({ fileId: fileId, supportsAllDrives: true });
		return res.status(200).json({ message: 'File deleted successfully!', fileId: fileId });
	} catch (error) {
		console.error('Error deleting file:', error);
		return res.status(error.code || 500).json({ message: error?.message || 'Error deleting file!' });
	}
});

// Route to list files in a specific Google Drive folder
router.get('/list', async (req, res) => {
	try {
		const authClient = await authorize();
		const drive = google.drive({ version: 'v3', auth: authClient });

		// Fetch the list of files in the folder
		const response = await drive.files.list({
			includeItemsFromAllDrives: true,
			q: `'${folderId}' in parents and trashed=false`,
			fields: 'files(id, name, mimeType, webViewLink, owners)', // Get file metadata: ID, name, MIME type, and webViewLink
			supportsAllDrives: true,
		});

		const files = response.data.files;

		if (files.length === 0) {
			return res.status(200).json({
				message: 'No files found.',
				files: [],
			});
		}

		// Return the list of files
		return res.status(200).json({
			message: 'Files retrieved successfully!',
			data: response.data,
		});
	} catch (error) {
		console.error('Error retrieving files:', error.message);
		return res.status(500).json({
			message: 'Error retrieving files!',
			error: error.message,
		});
	}
});

module.exports = router;
