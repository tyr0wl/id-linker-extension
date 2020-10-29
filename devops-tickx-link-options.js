// Saves options to chrome.storage
function save_options() {
    const url = document.getElementById("url").value;

    chrome.storage.sync.set({
        url,
    }, function() {
        // Update status to let user know options were saved.
        const status = document.getElementById("status");
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restore options
function restore_options() {
    chrome.storage.sync.get({
        url: 'http://helpdesk.media-service.com/', // default value
    }, function(items) {
        document.getElementById('url').value = items.url;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
