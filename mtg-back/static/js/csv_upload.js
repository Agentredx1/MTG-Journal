// CSV Upload UI Management
document.addEventListener('DOMContentLoaded', function() {
    const toggleCsvUpload = document.getElementById('toggleCsvUpload');
    const toggleManualEntry = document.getElementById('toggleManualEntry');
    const csvUploadSection = document.getElementById('csvUploadSection');
    const manualEntrySection = document.getElementById('manualEntrySection');
    const csvFileInput = document.getElementById('csvFileInput');
    
    // Initially show manual entry section
    manualEntrySection.style.display = 'block';
    
    // Toggle between CSV upload and manual entry
    toggleCsvUpload.addEventListener('click', function() {
        csvUploadSection.style.display = csvUploadSection.style.display === 'none' ? 'block' : 'none';
        manualEntrySection.style.display = 'none';
        
        // Update button states
        toggleCsvUpload.classList.toggle('btn--primary');
        toggleCsvUpload.classList.toggle('btn--secondary');
        toggleManualEntry.classList.remove('btn--primary');
        toggleManualEntry.classList.add('btn--secondary');
    });
    
    toggleManualEntry.addEventListener('click', function() {
        manualEntrySection.style.display = manualEntrySection.style.display === 'none' ? 'block' : 'none';
        csvUploadSection.style.display = 'none';
        
        // Update button states
        toggleManualEntry.classList.toggle('btn--primary');
        toggleManualEntry.classList.toggle('btn--secondary');
        toggleCsvUpload.classList.remove('btn--primary');
        toggleCsvUpload.classList.add('btn--secondary');
    });
    
    // File input validation and preview
    if (csvFileInput) {
        csvFileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                // Validate file type
                if (!file.name.toLowerCase().endsWith('.csv')) {
                    alert('Please select a CSV file.');
                    this.value = '';
                    return;
                }
                
                // Validate file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB.');
                    this.value = '';
                    return;
                }
                
                // Show file info
                showFileInfo(file);
                
                // Optional: Preview first few rows
                previewCsvContent(file);
            }
        });
    }
    
    // Display success/error messages from URL parameters
    displayUrlMessages();
});

function showFileInfo(file) {
    const fileSize = (file.size / 1024).toFixed(2);
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.innerHTML = `
        <p><strong>Selected file:</strong> ${file.name}</p>
        <p><strong>Size:</strong> ${fileSize} KB</p>
        <p><strong>Last modified:</strong> ${new Date(file.lastModified).toLocaleDateString()}</p>
    `;
    
    // Remove existing file info
    const existingInfo = document.querySelector('.file-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    // Add new file info after the file input
    document.getElementById('csvFileInput').parentElement.appendChild(fileInfo);
}

function previewCsvContent(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvContent = e.target.result;
        const lines = csvContent.split('\n').slice(0, 4); // First 4 lines (header + 3 data rows)
        
        if (lines.length > 0) {
            const preview = document.createElement('div');
            preview.className = 'csv-preview';
            preview.innerHTML = `
                <h4>File Preview:</h4>
                <pre class="csv-preview-content">${lines.join('\n')}</pre>
                ${lines.length > 4 ? '<p><em>...and more rows</em></p>' : ''}
            `;
            
            // Remove existing preview
            const existingPreview = document.querySelector('.csv-preview');
            if (existingPreview) {
                existingPreview.remove();
            }
            
            // Add preview after file info
            const fileInfo = document.querySelector('.file-info');
            if (fileInfo) {
                fileInfo.appendChild(preview);
            }
        }
    };
    reader.readAsText(file);
}

function displayUrlMessages() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const warnings = urlParams.get('warnings');
    
    if (success) {
        showMessage(decodeURIComponent(success), 'success');
        if (warnings) {
            showMessage(decodeURIComponent(warnings), 'warning');
        }
    } else if (error) {
        showMessage(decodeURIComponent(error), 'error');
    }
    
    // Clean up URL
    if (success || error || warnings) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message--${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button type="button" class="message__close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Insert at the top of the content
    const content = document.querySelector('.container');
    const firstChild = content.firstElementChild;
    content.insertBefore(messageDiv, firstChild);
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }
}