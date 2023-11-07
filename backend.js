// backend.js


// ------------------------ CONFIGURATIONS ------------------------------

require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const { gpt4integration } = require('./gpt4Integration');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // any port is actually fine
const apiKey = process.env.GPT4_API_KEY;

// ------------------------ MIDDLEWARE ------------------------------

app.use(cors());
app.use(bodyParser.json());

// Error handling using middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something went wrong!');
});

app.post('/processEmail', async (req, res) => {
	
})



// ------------------------ GPT4 UTILITY ------------------------------
const processGPTResponse = (response) => {
	return response.split(',').map(task => task.trim()).filter(task => task.length > 0);
};

// -------------------- EMAIL PROCESSING ENDPOINT ------------------------
app.post('/processEmail', async (req, res) => {
	const { emailContent, dueDates } = req.body;

	// -------------------- parameter checking ------------------------
	if (!emailContent) return res.status(400).json({ error: 'Email content missing.' });

	 if (!dueDates || !Array.isArray(dueDates)) return res.status(400).json({ error: 'Valid due dates missing.' });

	 // -------------------- send to gpt4 ------------------------
	const basePrompt = `Based on the following email content: "${emailContent}" with deadlines
	on: "${dueDates.join(', ')}",`;

	const enhancedPrompt = `${basePrompt} Your primary goal is to transform the email content into a
	clear, actionable task list that users can easily follow. Dive deep into the content,
	analyzing both explicit instructions and implied tasks. Here's your guideline:

	1. Analyze and understand: grasp the email's core objectives. if the email mentions or implies a
	significant task, break it down. 2. List tasks: generate a list of 3 to 20 actionable tasks
	based on the main objectives. If there are "main ideas" or "subjects", categorize tasks
	under those labels. For instance, if the email discusses organizing an event, tasks might
	look like: 'Task 1: Book the venue, Task 2: Draft and send out invites...'. 3. Hierarchical
	structure: if some tasks have sub-tasks, list them as 'Task 1a, Task 1b...'. 4. Handle
	ambiguity: in cases of uncertainty, label the task with '(uncertain)'. But remember, avoid
	ambiguous tasks like 'check that thing' or 'refer to email'. 5. User experience: each
	sharply defined task must stand on its own, meaning a user should comprehend it without
	requiring further context. 6. Iterative refinement: after your initial list, review and
	refine to ensure comprehensiveness. 7. Validation: at the end, confirm whether you believe
	these tasks comprehensively address the email's requirements.

	Remember, precision and clarity are key. The output should feel intuitive and user-friendly.`


	const gptResponse = await gpt4integration(enhancedPrompt);

	if (!gptResponse) return res.status(500).json({ error: 'Failed to process with GPT-4' });

	const tasksList = processGPTResponse(gptResponse);
	let [startDate, endDate] = dueDates.length === 1 ? [new Date(dueDates[0])] : [new Date(), new Date()];

	// -------------------- adjust dates based on what's scraped ------------------------
	if (dueDates.length === 1) startDate.setDate(endDate.getDate() - 7);
	else endDate.setMonth(endDate.getMonth() + 1);

	const tasks = tasksList.map(task => ({ name: task, startDate, endDate }));
	return res.json({ tasks });

});

app.listen(port, () => console.log(`Server started on http://localhost:${port}`));

