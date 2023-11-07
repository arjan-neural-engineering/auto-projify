// popup.js

document.addEventListener('DOMContentLoaded', function() {
    const triggerButton = document.getElementById('trigger');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const dueDatesContainer = document.getElementById("dueDatesContainer");

    // Initial state
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    dueDatesContainer.innerText = "Fetching due dates...";

    triggerButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {"message": "start_extraction"});
        });
    });

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.message === "extraction_failed") {
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            } else if (request.message === "extraction_success") {
                errorMessage.style.display = 'none';
                successMessage.style.display = 'block';
            } else if (request.message === "sync_error") {
                errorMessage.innerText = '❌ Sync Error!';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            } else if (request.message === "sync_success") {
                errorMessage.style.display = 'none';
                successMessage.style.display = 'block';
            } else if (request.message === "due_dates") {
                if (request.dueDates && request.dueDates.length > 0) {
                    dueDatesContainer.innerText = request.dueDates.join(', ');
                } else {
                    dueDatesContainer.innerText = "No due dates found";
                }
            }
        }
    );

    // Fetching due dates upon popup open
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let currentTab = tabs[0];
        chrome.tabs.sendMessage(currentTab.id, {message: "get_due_dates"}, (response) => {
            if (response && response.dueDates) {
                dueDatesContainer.innerText = response.dueDates.join(', ');
            } else {
                dueDatesContainer.innerText = "No due dates found";
            }
        });
    });
});
