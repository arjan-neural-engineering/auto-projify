// content.js - ARJAN SINGH PUNIANI
// total encapsulation with IIFE ...
(function() {
	'use strict';
	// ----------------- DEPENDENCIES ---------------------
	require('dotenv').config()

	// ----------------- CONSTANTS ---------------------
	const API_ENDPOINT = determineEndpoint(); const DATE_PATTERNS = defineDatePatterns(); 
	const ALL_DATE_PATTERNS = [ /(by the end of\s+|due\s+
		(by|on)\s+|expected\s+by\s+|\bneeds?\s+by\s+|submit\s+(by|no later than)\s+|please\s+
		(complete|submit|finish|send)?\s+(by|before|no later than)\s+|deadline:\s+)
		(?:(\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})|
		((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}))/gi,
		// other patterns 
	]; 

	const ENVIRONMENTS = { 	DEVELOPMENT: "development", 
							PRODUCTION: "production", 
							STAGING: "staging" 			};

	// ----------------- HELPER FUNCTIONS ---------------------

	function extractDatesFromPage() {
		const pageText = document.body.innerText;
		return ALL_DATE_PATTERNS.flatMap(pattern => {
			const matches = [];
			let match;
			while (match = pattern.exec(pageText)) {
				if (match[6]) {
					matches.push(match[6]); // 'DD Month YYYY' format
				} else if (match[7]) {
					matches.push(match[7]); // 'Month DD, YYYY' format
				}
			}
			return matches;
		});
	}
	function getCurrentEnvironment() {
		return location.hostname.includes("localhost") ? ENVIRONMENTS.DEVELOPMENT : ENVIRONMENTS.PRODUCTION;
	}

	function determineClientFromURL() {
		const hostname = location.hostname;
		if (hostname.includes("outlook")) {
			return "outlook";
		} else if (hostname.includes("google")) {
			return "gmail";
		}
		return "unknown";
	}

	function isDevelopmentEnvironment() {
		return location.hostname === "localhost" || location.hostname == "127.0.0.1";
	}

	function determineEndpoint() {
		let endpoint = "";
		const hostname = location.hostname;
		switch(hostname) {
		case "outlook.live.com":
			endpoint = "outlook";
			break;
		case "mail.google.com":
			endpoint = "gmail";
			break;
		default:
			console.error("Unsupported hostname:", hostname);
			break;
		}
		return endpoint;
	}

		return isDevelopmentEnvironment() ? "http://localhost:3000/processEmail" :
		 "https://[ourdomain].com/api/processEmail";
	}

	function defineDatePatterns() {
		const MONTH_NAMES = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";

		return {
			MONTH_NAME: [
				new RegEx(`\\b(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{1,2}\\b`, 'i'),
				new RegEx(`\\b\\d{1,2}\\s*${MONTH_NAMES}\\s*\\d{2,4}\\b`, 'i')
			],
			SLASH: [/\d{1,2}\/\d{1,2}\/\d{2,4}\b/],
			DASH: [
				// example case: 01-01-2022
				/\b\d{1,2}-\d{1,2}-\d{2,4}\b/,
				// ex: 2024-01-01
				/\b\d{2,4}-\d{1,2}-\d{1,2}\b/ 
			],
			DOT_SPACE: [/\b\d{1,2}[\.\s]\d{1,2}[\.\s]\d{2,4}\b/]
		};
	}

	const EMAIL_CLIENT_SELECTORS = {
		'outlook': 'div[aria-label="Message body"]',
		'gmail': 'implement gmail extraction logic here'
		// ... other clients can be added here effortlessly
	}

	function getEmailContentForClient(clientName) {
		const selector = EMAIL_CLIENT_SELECTORS[clientName];
		if (!selector) throw new Error(`No selector found for client: ${clientName}`);
		return document.querySelector(selector);
	}

	function getAriaLabelFromImgDiv() {
		let element = document.querySelector("div[role='img'][aria-label]");
		return element ? element.getAttribute("aria-label") : null;
	}

	function isValidDate(dateString) {
		return !isNaN(Date.parse(dateString));
	}

	function normalizeDate(dateString) {
		const date = new Date(dateString);
		return date.toISOString().slice(0, 10); // Returns YYYY-MM-DD format
	}

	function sortDates(dates) {
		return dates.sort((a, b) => new Date(a) - new Date(b));
	}

	function daysBetweenDates(date1, date2) {
		const msPerDay = 24 * 60 * 60 * 1000;
		return Math.round((new Date(date2) - new Date(date1)) / msPerDay);
	}

	function alertUpcomingDeadlines(dates, thresholdDays = 3) {
		const today = new Date();
		dates.forEach(date => {
			if (daysBetweenDates(today, date) <= thresholdDays) {
				console.warn(`Upcoming deadline on ${date}`);
			}
		});
	}






	function processEmail() { 
		// WARNING: outlook hardcoded here 
		// for demonstrative purposes
		const emailContent = getEmailContentForClient("outlook");
		const dates = extractFromContentUsingPatterns(emailContent.textContent, ALL_DATE_PATTERNS);

		const ariaLabelValue = getAriaLabelFromImgDiv();
		if (ariaLabelValue) {
			console.log("Found aria-label:", ariaLabelValue);
			// Potential to do more with aria-label value here
		}
	}

	function getEmailContentForClient(clientName) {
		const SELECTORS = {
			'outlook': 'div[aria-label="Message body"]',
			'gmail': 'implement gmail extraction logic here'
		};
		return document.querySelector(SELECTORS[clientName]) || null;
	}

	function extractFromContentUsingPatterns(content, patterns) {
		return patterns.flatMap(pattern => content.match(pattern) || []);
	}

	function hideElementById(id) {
		const element = document.getElementById(id);
		if (element) {
			element.style.display = 'none';
		}
	}

	function extractEmailData() {
		const CLIENT_URLS = {
			'outlook': 'outlook.live.com',
			'gmail': 'mail.google.com'
		};

		const currentURL = window.location.href;
		const clientName = Object.keys(CLIENT_URLS).find(
			client => currentURL.includes(CLIENT_URLS[client]));
		const emailElement = getEmailContentForClient(clientName);
		return emailElement ? emailElement.textContent : null;
	}

	function formatToICal(date) {
		const formatNumber = num => String(num).padStart(2,'0');
		const [y, m, d, h, min, s] = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), dates.getUTCSeconds()].map(formatNumber);
		return `${y}${m}${d}T${h}${min}${s}`;
	}
	// f(x) to create iCal calendar event .ics files
	function generateICSFile(tasks) {
		// generate content for the .ics file based on
		// tasks generated by the chatgpt api call
		let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\n";
		tasks.forEach(task => {
			icsContent += "BEGIN:VEVENT\n";
			icsContent += "SUMMARY:" + task.name + "\n";
			icsContent += "DTSTART:" + formatToICal(task.startDate) + "\n";
			icsContent += "DTEND:" + formatToICal(task.endDate) + "\n";
			icsContent += "END:VEVENT\n";
		});
		icsContent += "END:VCALENDAR";

		// create a Blob with .ics content
		const blob = new Blob([icsContent], { type: 'text/calendar' });

		// now need an anchor link for Blob URL
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = 'my-tasks.ics';

		// Append to the DOM, click the link, and remove
		document.body.appendChild(a);
		a.click();
		URL.revokeObjectURL(url);
	}

	async function fetchData(payload) {
		try {
			const response = await fetch(API_ENDPOINT, {
				method: 'POST';
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const data = await response.json();
			if (data && data.tasks) {
				generateICSFile(data.tasks);
				chrome.runtime.sendMessage({"message": "extraction_success"});
			} else {
				chrome.runtime.sendMessage({"message": "no_tasks_received"});
			}
		} catch (error) {
			console.error("Fetch failed:", error);
			chrome.runtime.sendMessage({"message": "fetch_failed"});
		}
	}

	function getAuthToken() {
		return new Promise((resolve, reject) => {
			chrome.identity.getAuthToken({ 'interactive': true }, token => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError));
				} else {
					resolve(token);
				}
			});
		});
	}

	function getEmailFromGmailApi(token) {
		return new Promise((resolve, reject) => {
			const messageIdEndpoint = 'https://www.googleapis.com/gmail/v1/users/me/messages?q=in:inbox&maxResults=1&key=GMAIL_API_KEY';
			// to get most recent email

			fetch(messageIdEndpoint, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
			.then(response => response.json())
			.then(data => {
				const messageId = data.messages[0].id;
				const messageEndpoint = 
				`https://www.googleapis.com/gmail/v1/users/messages/${messageId}?key=GMAIL_API_KEY`;

				return fetch(messageEndpoint, {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
			})
			.then(response => response.json())
			.then(emailData => {
				const body = emailData.payload.body.data;
				// decode from base64url
				const decodedBody = atob(body.replace(/-/g,'+').replace(/_/g, '/')); 
				resolve(decodedBody);
			})
			.catch(reject);
		});
	}

	function getEmailContentForClient(clientName) {	
		const SELECTORS = {
			'outlook': 'div[aria-label="Message body"]',
			'gmail': 'gmail'
		};

		if (clientName === 'gmail') {
			return getAuthToken().then(getEmailFromGmailApi);
		}

		return Promise.resolve(document.querySelector(SELECTORS[clientName]) || null);
	}

	function extractDueDates(emailContent) {
		return ALL_DATE_PATTERNS.flatMap(pattern => {
			const matches = emailContent.match(pattern);
			return matches || [];
		});
	}


	// hide browswer popup
	function hideAutoProjifyPopup() {
		const popup = document.getElementById('trigger');
		if (popup) {
			popup.style.display = 'none';
		}
	}

	function showFailureMessage() {
		const triggerButton = document.getElementById('trigger');
		const failureMessage = document.getElementById('failure-message');

		if (triggerButton) {
			triggerButton.style.display = 'none';
		}

		if (failureMessage) {
			failureMessage.style.display = 'block';
		}
	}

	// DOM traversal to extract email content
	const extractEmailData = () => {

		let clientName;
		const currentURL = window.location.href;

		if (currentURL.includes("outlook.live.com")) {
			clientName = 'outlook';
		} else if (currentURL.includes("mail.google.com")) {
			clientName = 'gmail';
		}

		const emailElement = getEmailContentForClient(clientName);
		return emailElement ? emailElement.textContent : null;

	};
	function extractDatesFromPage() {
		const pageText = document.body.innerText;
		return ALL_DATE_PATTERNS.flatMap(pattern => pageText.match(
			pattern) || []);
	}

	// extract due dates using regex
	function extractDueDates(emailContent) {
		// common phrases surrounding deadline
		const regex = /(by the end of\s+|due\s+
		(by|on)\s+|expected\s+by\s+|\bneeds?\s+by\s+|submit\s+(by|no later than)\s+|please\s+
		(complete|submit|finish|send)?\s+(by|before|no later than)\s+|deadline:\s+)(?:(\d
		{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})|(
		(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}))/gi;

		/(due\s+on\s+|\bexpect(ed)?\s+this\s+(by|until)\s+|please\s+have\s+it\s+done\s+
		 (by|until)\s+|applications.*?(by|until)\s+|deadline\s+is\s+|to\s+be\s+included\s+in\s+)(?:
		 (\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})|(
		 (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}))/gi;
		

		/(\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s
		 (?:PST|EST|GMT|UTC)?)/gi;

		const dueDates = [];
		let match;
		while (match = regex.exec(emailContent)) {
			if (match[6]) {
				dueDates.push(match[6]); // for 'DD Month YYYY' format
			} else if (match[7]) {
				dueDates.push(match[7]); // for 'Month DD, YYYY' format
			}
		}
		return dueDates;
	}


	// convert js Date into iCal format yyyyMMdd'T'HHmmss
	function formatToICal(date) {
		const [y, m, d, h, min, s] = [date.getUTCFullYear(),
			date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()].map(
				num => String(num).padStart(2,'0')
			);
			return `${y}${m}${d}T${h}${min}${s}`;
	}

	// Talk to backend, FETCH server

	async function fetchData(payload) {
		try {
			const response = await fetch(API_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json', 
				},
				body: JSON.stringify(payload),
			});
			const data = await response.json();
			if (data && data.tasks) {
				generateICSFile(data.tasks);
				chrome.runtime.sendMessage({"message": "extraction_success"});
			} else {
				chrome.runtime.sendMessage({"message": "no_tasks_received"})
			}
		} catch (error) {
			console.error("Fetch failed:", error);
			chrome.runtime.sendMessage({"message": "fetch_failed"})
		}
	}

	function getAuthToken() {
		return new Promise((resolve, reject) => {
			chrome.identity.getAuthToken({ 'interactive': true }, token => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError));
				} else {
					resolve(token);
				}
			});
		});
	}

	async function fetchEmails() {
		try {
			const token = await	getAuthToken();
			const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages', {
				headers: {
					'Authorization': 'Bearer ' + token,
					'Content-Type': 'application/json' 
				}
			});
			const data = await response.json();
			// Process emails here
			} catch (error) {
			console.error(error);
			}
		}

	async function fetchEmailContent(emailId) {
		const token = await getAuthToken();
		const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${emailId}`, {
			headers: {
				'Authorization': 'Bearer ' + token,
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		// Extract email content from data.payload.body.data
		const emailContent = atob(data.payload.body.data); // Gmail API returns base64-encoded content
		return emailContent;
	}
	// ----------------- EXTRACTION METHODS ---------------------
	// target the aria body div container seen in outlook
	function extractFromEmail() {
		const emailContent = extractEmailData();
		if (!emailContent) {
			console.error("Could not find project-related content");
			chrome.runtime.sendMessage({"message": "email_content_not_found"})
			return;
		}
		const dueDates = extractDueDates(emailContent);
		if (dueDates.length === 0) {
			console.error("No due dates found");
			showFailureMessage(); // user-visible failure notification
			return;
		}
		fetchData({ emailContent, dueDates });
	}
	// YC app demonstration
	function extractFromYC() {
		const deadlineParagraph = document.querySelector('div.prose.prose-sm.sm:prose-base > div > p:nth-child(2)')
		if (deadlineParagraph) {
			const deadlineText = deadlineParagraph.textContent;
			console.log(deadlineText);
			// send a success message to our popup
			chrome.runtime.sendMessage({"message": "extraction_success"})
			// additional logic if necessary
		} else {
			console.error("Unable to find deadline info on this page")
			chrome.runtime.sendMessage({"message": "yc_deadline_not_found"})
			console.log("Couldn't find YC deadline")
			hideAutoProjifyPopup();
		}
	}
	// ----------------- MAIN EXECUTION LOOP ---------------------
	// determine context (emails or YC) to select appropros extraction method
	document.addEventListener('DOMContentLoaded', () => {
		const currentURL = window.location.href;

		if (currentURL.includes("mail.")) {
			extractFromEmail();
		} else if (currentURL.includes("www.ycombinator.com/apply/")) {
			extractFromYC();
		}
	});

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.message === "get_due_dates") {
			const emailContent = extractEmailData();
			const dueDates = extractDueDates(emailContent);
			sendResponse({dueDates: dueDates});
		}
	});

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.message === "start_extraction") {
			const dates = extracDatesFromPage();
			if (dates.length > 0) {
				sendResponse({message: "extraction_success", dueDates: dates});
			} else {
				sendResponse({message: "extraction_failed"});
			}
		}
	});

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.message === "start_extraction") {
				const emailContent = extractEmailContentPartTwo();
				const dueDates = extractDueDates(emailContent);

				if (!emailContent) {
					chrome.runtime.sendMessage({"message": "extraction_failed"});
					return;
				}

				// Now send data to backend for further processing
				fetch('http://localhost:3000/processEmail', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						emailContent: emailContent,
						dueDates: dueDates
					})
				})
				.then(response => response.json())
				.then(data => {
					if (data.tasks) {
						chrome.runtime.sendMessage({"message": "extraction_success", "tasks": data.tasks});
					} else {
						chrome.runtime.sendMessage({"message": "extraction_failed"});
					}
				})
				.catch(error => {
					console.error('Error:', error);
					chrome.runtime.sendMessage({"message": "extraction_failed"});
				});
			} catch (error) {
				console.error("Extraction failed:", error);
				chrome.runtime.sendMessage({"message": "extraction_failed"});
			}
		}
	);
	const token = process.env.AZURE_TOKEN;
	fetch('https://graph.microsoft.com/v1.0/me/messages?$top=1', {
		headers: {
			'Authorization': 'Bearer' + token
		}
	})
	.then(response => response.json())
	.then(data => {
		const emailContent = data.value[0].body.content;
		const dueDates = extractDueDates(emailContent);

		// rest of processing logic?
	})
	.catch(error =>{
		console.error("Failed to fetch email:", error);
	});
})();







