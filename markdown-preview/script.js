// Get DOM elements
const markdownInput = document.getElementById('markdown-input');
const previewContent = document.getElementById('preview-content');
const wordCountDisplay = document.getElementById('word-count');
const copyButton = document.getElementById('copy-preview');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;
const increaseFontButton = document.getElementById('increase-font');
const decreaseFontButton = document.getElementById('decrease-font');
const messageDisplay = document.createElement('p'); // Element to show status messages

// Add message display element to the body
messageDisplay.id = 'status-message';
messageDisplay.style.position = 'fixed';
messageDisplay.style.top = '10px';
messageDisplay.style.right = '10px';
messageDisplay.style.padding = '10px 15px';
messageDisplay.style.borderRadius = '5px';
messageDisplay.style.backgroundColor = '#333';
messageDisplay.style.color = '#fff';
messageDisplay.style.display = 'none';
document.body.appendChild(messageDisplay);

// Function to show message on the page
function showMessage(message, duration = 3000) {
    messageDisplay.textContent = message;
    messageDisplay.style.display = 'block';
    
    setTimeout(() => {
        messageDisplay.style.display = 'none';
    }, duration); // Hide message after the duration
}

// Default font size for preview
let currentFontSize = 16;

// Event listener to detect input in the textarea and update the preview in real-time
markdownInput.addEventListener('input', function () {
    const markdownText = markdownInput.value;
    const htmlContent = marked.parse(markdownText); // Use marked.js to parse Markdown

    // Update preview content
    previewContent.innerHTML = htmlContent;

    // Update word count
    const wordCount = markdownText.split(/\s+/).filter((word) => word.length > 0).length;
    wordCountDisplay.textContent = `Words: ${wordCount} / 1000`;

    // Prevent user from exceeding word limit
    if (wordCount > 1000) {
        markdownInput.value = markdownText.split(/\s+/).slice(0, 1000).join(" ");
        previewContent.innerHTML = marked.parse(markdownInput.value);
    }
});

// Copy the entire preview content as plain text to the clipboard
copyButton.addEventListener('click', function () {
    // Create a temporary element to hold the plain text content
    const tempElement = document.createElement('textarea');
    tempElement.value = previewContent.textContent; // Use textContent to get plain text (without HTML tags)
    document.body.appendChild(tempElement);

    // Select the content
    tempElement.select();
    tempElement.setSelectionRange(0, 99999); // For mobile devices

    // Copy the content to the clipboard
    try {
        document.execCommand('copy');
        showMessage('Copied to clipboard!'); // Show success message
    } catch (err) {
        showMessage('Failed to copy content.', 4000); // Show failure message
    }

    // Remove the temporary element
    document.body.removeChild(tempElement);
});

// Toggle dark mode
darkModeToggle.addEventListener('click', function () {
    body.classList.toggle('dark');
    document.querySelectorAll('button').forEach(button => button.classList.toggle('dark'));
    showMessage('Dark mode toggled');
});

// Increase font size in the preview pane
increaseFontButton.addEventListener('click', function () {
    currentFontSize += 2;
    previewContent.style.fontSize = `${currentFontSize}px`;
    showMessage('Font size increased');
});

// Decrease font size in the preview pane
decreaseFontButton.addEventListener('click', function () {
    if (currentFontSize > 12) {
        currentFontSize -= 2;
        previewContent.style.fontSize = `${currentFontSize}px`;
        showMessage('Font size decreased');
    }
});
