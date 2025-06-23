// Global variables
let prestigeData = [];
let hasUnsavedChanges = false;
let isDarkMode = true; // Default to dark mode
let currentPrestigeIndex = -1; // Track the current prestige index

// DOM elements
const commanderList = document.getElementById('commander-list');
const commanderSearch = document.getElementById('commander-search');
const prestigeForm = document.getElementById('prestige-form');
const noSelection = document.getElementById('no-selection');
const statusMessage = document.getElementById('status-message');
const themeToggleBtn = document.getElementById('theme-toggle');
const savingIndicator = document.getElementById('saving-indicator');

// Form elements
const commanderInput = document.getElementById('commander');
const prestigeInput = document.getElementById('prestige');
const advantagesInput = document.getElementById('advantages');
const disadvantagesInput = document.getElementById('disadvantages');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadPrestigeData();
    
    // Event listeners
    commanderSearch.addEventListener('input', filterCommanders);
    prestigeInput.addEventListener('input', debounce(autoSaveChanges, 1000));
    advantagesInput.addEventListener('input', debounce(autoSaveChanges, 1000));
    disadvantagesInput.addEventListener('input', debounce(autoSaveChanges, 1000));
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Add event listeners for index buttons
    document.querySelector('.index-button.decrease').addEventListener('click', () => {
        // Up arrow decreases the index (moves item up in list)
        if (currentPrestigeIndex > 0) {
            currentPrestigeIndex -= 1;
            movePrestigeInList(commanderInput.value, originalPrestigeName, currentPrestigeIndex);
        }
    });
    
    document.querySelector('.index-button.increase').addEventListener('click', () => {
        // Down arrow increases the index (moves item down in list)
        if (currentPrestigeIndex < 3) {
            currentPrestigeIndex += 1;
            movePrestigeInList(commanderInput.value, originalPrestigeName, currentPrestigeIndex);
        }
    });
    
    // Warn about unsaved changes when leaving
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
});

// Load prestige data from JSON file
async function loadPrestigeData() {
    try {
        const response = await fetch('raw_prestiges.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        prestigeData = await response.json();
        populateCommanderList();
        showStatusMessage('Data loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading data:', error);
        showStatusMessage('Failed to load data: ' + error.message, 'error');
    }
}

// Populate the commander list with unique commanders
function populateCommanderList() {
    // Define the correct order of commanders
    const commanderOrder = [
        'Raynor',
        'Kerrigan',
        'Artanis',
        'Swann',
        'Zagara',
        'Vorazun',
        'Karax',
        'Abathur',
        'Alarak',
        'Nova',
        'Stukov',
        'Fenix',
        'Dehaka',
        'Han & Horner',
        'Tychus',
        'Zeratul',
        'Stetmann',
        'Mengsk'
    ];
    
    // Get unique commanders from data
    const dataCommanders = [...new Set(prestigeData.map(item => item.commander))];
    
    // Combine ordered list with any additional commanders from data
    const commanders = [...commanderOrder];
    dataCommanders.forEach(commander => {
        if (!commanders.includes(commander)) {
            commanders.push(commander);
        }
    });
    
    // Clear existing list
    commanderList.innerHTML = '';
    
    // Create list items for each commander
    commanders.forEach(commander => {
        const commanderItem = document.createElement('div');
        commanderItem.className = 'commander-item';
        
        const commanderName = document.createElement('div');
        commanderName.className = 'commander-name';
        commanderName.textContent = commander;
        commanderItem.appendChild(commanderName);
        
        // Get prestiges for this commander
        const commanderPrestiges = prestigeData.filter(item => item.commander === commander);
        
        // Sort prestiges by index
        commanderPrestiges.sort((a, b) => {
            // Ensure index exists, default to a number based on position
            const indexA = a.index !== undefined ? a.index : 999;
            const indexB = b.index !== undefined ? b.index : 999;
            return indexA - indexB;
        });
        
        // Create list items for each prestige
        commanderPrestiges.forEach(prestige => {
            const prestigeItem = document.createElement('div');
            prestigeItem.className = 'prestige-item';
            
            // Create a span for the prestige name
            const prestigeName = document.createElement('span');
            prestigeName.textContent = prestige.prestige;
            prestigeItem.appendChild(prestigeName);
            
            // Create status indicator
            const statusIndicator = document.createElement('span');
            statusIndicator.className = 'status-indicator';
            
            // Determine status based on advantages and disadvantages
            const hasAdvantages = prestige.advantages && prestige.advantages.trim() !== '';
            const hasDisadvantages = prestige.disadvantages && prestige.disadvantages.trim() !== '';
            
            if (hasAdvantages && hasDisadvantages) {
                statusIndicator.classList.add('complete');
                statusIndicator.title = 'Both advantages and disadvantages are filled';
            } else if (hasAdvantages || hasDisadvantages) {
                statusIndicator.classList.add('partial');
                statusIndicator.title = hasAdvantages ? 'Only advantages are filled' : 'Only disadvantages are filled';
            } else {
                statusIndicator.classList.add('empty');
                statusIndicator.title = 'Both advantages and disadvantages are empty';
            }
            
            prestigeItem.appendChild(statusIndicator);
            
            // Set data attributes
            prestigeItem.dataset.commander = commander;
            prestigeItem.dataset.prestige = prestige.prestige;
            
            // Add click event to select this prestige
            prestigeItem.addEventListener('click', () => {
                selectPrestige(commander, prestige.prestige);
                
                // Remove selected class from all prestige items
                document.querySelectorAll('.prestige-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Add selected class to this prestige item
                prestigeItem.classList.add('selected');
            });
            
            commanderItem.appendChild(prestigeItem);
        });
        
        commanderList.appendChild(commanderItem);
    });
}

// Filter commanders based on search input
function filterCommanders() {
    const searchTerm = commanderSearch.value.toLowerCase();
    const commanderItems = document.querySelectorAll('.commander-item');
    
    commanderItems.forEach(item => {
        const commanderName = item.querySelector('.commander-name').textContent.toLowerCase();
        if (commanderName.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Store the original prestige name for tracking changes
let originalPrestigeName = '';

// Save current form data before switching to another prestige
function saveCurrentFormData() {
    // Only save if a prestige is currently selected
    if (originalPrestigeName) {
        // Auto-save any pending changes
        autoSaveChanges();
        
        // Update status indicators
        const commander = commanderInput.value;
        const prestigeName = prestigeInput.value;
        updateStatusIndicator(commander, prestigeName, advantagesInput.value, disadvantagesInput.value);
    }
}

// Select a prestige and display its details in the form
function selectPrestige(commander, prestigeName) {
    // Save any pending changes from the current form first
    saveCurrentFormData();
    
    // Find the prestige data
    const prestige = prestigeData.find(item => 
        item.commander === commander && item.prestige === prestigeName
    );
    
    if (prestige) {
        // Show the form and hide the message
        prestigeForm.classList.remove('hidden');
        noSelection.classList.add('hidden');
        
        // Store the original prestige name
        originalPrestigeName = prestigeName;
        
        // Store the current prestige index
        currentPrestigeIndex = prestige.index !== undefined ? prestige.index : 0;
        
        // Update the displayed index value
        document.getElementById('index-value').textContent = currentPrestigeIndex;
        
        // Populate form fields
        commanderInput.value = prestige.commander;
        prestigeInput.value = prestige.prestige;
        advantagesInput.value = prestige.advantages;
        disadvantagesInput.value = prestige.disadvantages;
    }
}

// Debounce function to prevent too many saves
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Auto-save changes when user edits a field
function autoSaveChanges() {
    const commander = commanderInput.value;
    const newPrestigeName = prestigeInput.value;
    
    // Show saving indicator
    savingIndicator.classList.remove('hidden');
    
    // Find the prestige in the data using the original name
    const index = prestigeData.findIndex(item => 
        item.commander === commander && item.prestige === originalPrestigeName
    );
    
    if (index !== -1) {
        // Store old name for UI updates
        const oldPrestigeName = originalPrestigeName;
        
        // Update the data
        prestigeData[index].prestige = newPrestigeName;
        prestigeData[index].index = currentPrestigeIndex;
        prestigeData[index].advantages = advantagesInput.value;
        prestigeData[index].disadvantages = disadvantagesInput.value;
        
        // If the prestige name changed, update the UI
        if (oldPrestigeName !== newPrestigeName) {
            // Update the UI to reflect the name change
            updatePrestigeNameInUI(commander, oldPrestigeName, newPrestigeName);
            
            // Update the original prestige name for future reference
            originalPrestigeName = newPrestigeName;
        }
        
        // Update the status indicator in real-time
        updateStatusIndicator(commander, newPrestigeName, advantagesInput.value, disadvantagesInput.value);
        
        // Save to file
        saveChangesToFile();
    }
}

// Save changes to the JSON file
async function saveChangesToFile() {
    try {
        const response = await fetch('/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(prestigeData),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            hasUnsavedChanges = false;
            savingIndicator.classList.add('hidden');
            showStatusMessage('Changes saved successfully', 'success');
        } else {
            throw new Error(result.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error saving data:', error);
        showStatusMessage('Failed to save data: ' + error.message, 'error');
        
        // If there's an issue with the PHP endpoint, offer a download option
        offerDownload();
    }
}

// Offer a download of the JSON data if the server-side save fails
function offerDownload() {
    const downloadLink = document.createElement('a');
    const file = new Blob([JSON.stringify(prestigeData, null, 2)], { type: 'application/json' });
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = 'raw_prestiges.json';
    
    // Add the download link to the status message
    statusMessage.innerHTML += '<br><br>Click <a href="#" id="download-link">here</a> to download the JSON file instead.';
    document.getElementById('download-link').addEventListener('click', (e) => {
        e.preventDefault();
        downloadLink.click();
    });
}

// Show a status message
function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
    
    // Clear the message after 5 seconds
    setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = '';
    }, 5000);
}

// Move a prestige in the list by updating its index
function movePrestigeInList(commander, prestigeName, newIndex) {
    // Find the prestige in the data
    const index = prestigeData.findIndex(item => 
        item.commander === commander && item.prestige === prestigeName
    );
    
    if (index !== -1) {
        const oldIndex = prestigeData[index].index;
        
        // Find the prestige that has the newIndex (to swap with)
        const swapIndex = prestigeData.findIndex(item => 
            item.commander === commander && item.index === newIndex
        );
        
        if (swapIndex !== -1 && swapIndex !== index) {
            // Swap the indexes
            prestigeData[swapIndex].index = oldIndex;
        }
        
        // Update the index in the data
        prestigeData[index].index = newIndex;
        
        // Update the displayed index value
        document.getElementById('index-value').textContent = newIndex;
        
        // Save changes
        autoSaveChanges();
        
        // Refresh the commander list to show the new order
        refreshCommanderList(commander, prestigeName);
    }
}

// Refresh the commander list to reflect the new order
function refreshCommanderList(selectedCommander, selectedPrestige) {
    // Store the current scroll position
    const scrollPosition = commanderList.scrollTop;
    
    // Repopulate the list
    populateCommanderList();
    
    // Re-select the current commander and prestige
    if (selectedCommander && selectedPrestige) {
        // Find and click the prestige item
        const prestigeItems = document.querySelectorAll('.prestige-item');
        for (const item of prestigeItems) {
            if (item.dataset.commander === selectedCommander && item.dataset.prestige === selectedPrestige) {
                item.click();
                break;
            }
        }
    }
    
    // Restore scroll position
    commanderList.scrollTop = scrollPosition;
}

// Update the prestige name in the UI
function updatePrestigeNameInUI(commander, oldName, newName) {
    // Find the prestige item in the UI
    const prestigeItems = document.querySelectorAll('.prestige-item');
    
    for (const item of prestigeItems) {
        if (item.dataset.commander === commander && item.dataset.prestige === oldName) {
            // Update the dataset
            item.dataset.prestige = newName;
            
            // Update the text content (first child is the span with the name)
            const nameSpan = item.querySelector('span:first-child');
            if (nameSpan) {
                nameSpan.textContent = newName;
            }
            
            // If this item is selected, ensure it remains selected
            if (item.classList.contains('selected')) {
                item.classList.add('selected');
            }
            
            console.log(`Updated prestige name from ${oldName} to ${newName}`);
            break;
        }
    }
}

// Update the status indicator for a prestige
function updateStatusIndicator(commander, prestigeName, advantages, disadvantages) {
    // Find the prestige item in the UI
    const prestigeItems = document.querySelectorAll('.prestige-item');
    
    for (const item of prestigeItems) {
        if (item.dataset.commander === commander && item.dataset.prestige === prestigeName) {
            // Find the status indicator
            const statusIndicator = item.querySelector('.status-indicator');
            if (!statusIndicator) continue;
            
            // Remove existing status classes
            statusIndicator.classList.remove('complete', 'partial', 'empty');
            
            // Determine status based on advantages and disadvantages
            const hasAdvantages = advantages && advantages.trim() !== '';
            const hasDisadvantages = disadvantages && disadvantages.trim() !== '';
            
            if (hasAdvantages && hasDisadvantages) {
                statusIndicator.classList.add('complete');
                statusIndicator.title = 'Both advantages and disadvantages are filled';
            } else if (hasAdvantages || hasDisadvantages) {
                statusIndicator.classList.add('partial');
                statusIndicator.title = hasAdvantages ? 'Only advantages are filled' : 'Only disadvantages are filled';
            } else {
                statusIndicator.classList.add('empty');
                statusIndicator.title = 'Both advantages and disadvantages are empty';
            }
            
            break;
        }
    }
}

// Toggle between light and dark mode
function toggleTheme() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        // Switch to dark mode
        document.documentElement.style.setProperty('--bg-color', '#121212');
        document.documentElement.style.setProperty('--card-bg', '#1e1e1e');
        document.documentElement.style.setProperty('--text-color', '#e0e0e0');
        document.documentElement.style.setProperty('--secondary-bg', '#2d2d2d');
        document.documentElement.style.setProperty('--border-color', '#444');
        themeToggleBtn.innerHTML = '☀️ Light Mode';
    } else {
        // Switch to light mode
        document.documentElement.style.setProperty('--bg-color', '#f5f5f5');
        document.documentElement.style.setProperty('--card-bg', '#ffffff');
        document.documentElement.style.setProperty('--text-color', '#333333');
        document.documentElement.style.setProperty('--secondary-bg', '#f8f9fa');
        document.documentElement.style.setProperty('--border-color', '#ddd');
        themeToggleBtn.innerHTML = '🌙 Dark Mode';
    }
}
