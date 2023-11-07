// background.js


// keep track of extension's state:
let extensionState = 'idle';

// Listen for message from content.js or popup.js to start processing
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'start_processing') {
		extensionState = 'active';

		// sync tasks with server OR directly with chatgpt-api
		fetch('Your_Backend/API_Endpoint', {
			method: 'POST',
			// fetch options go here
		})
		.then(response => response.json())
		.then(data => {
			// sync tasks with user's calendar
			syncTasks(data.tasks);
			extensionState = 'idle';
			// notify popup of success
			chrome.runtime.sendMessage({message: "sync_success"})
		})
		.catch(error => {
			console.error('Error:', error);
			extensionState = 'error';
			// Notify popup about error
			chrome.runtime.sendMessage({message: 'sync_error'});
		});
	} else if (message.action === 'API_REQUEST') {
		fetch('CHATGPT_API_ENDPOINT', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(message.data)
		})
		.then(response => response.json())
		.then(data => sendResponse(data))
		.catch(error => sendResponse({ error: error.message }));

		// send a response asynchronously
		return true; 
	}
});


let lastSyncedDate = null; // keeps track of last successful sync

// function to sync tasks

function validateTask(task) {
	// check if all attributes exist
	if (!task.name || !task.startDate || !task.endDate) {
		return false;
	}
	// check if name is valid and not just a bunch of spaces
	if (task.name.trim().length === 0 || task.name.length > 255) {
		return false;
	}
	// Check date validity and format
	const start = new Date(task.startDate);
	const end = new Date(task.endDate);
	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		return false;
	}
	// ensure endDate ain't before startDate
	if (end < start) {
		return false;
	}

	// TO-DO: additional robust checks

	return true; // valid task
	
}

function syncTasks(tasks) {
	// 1 data integrity and validation
	const validatedTasks = tasks.filter(task => validateTask(task));
}

