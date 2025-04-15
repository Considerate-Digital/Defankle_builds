document.addEventListener('DOMContentLoaded', () => {
    // Default question texts
    const defaultQuestions = [
        "1. What opportunities do you want to explore in this design?",
        "2. What challenges do you think you will face?",
        "3. What problem are you trying to solve in this design?"
    ];

    // Store current questions - initialise with defaults
    let currentQuestions = [...defaultQuestions];

    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(`${tabName}-tab`).classList.add('active');

            // Load data based on the selected tab
            if (tabName === 'manage') {
                loadSelectedKnowledgeBase();
            } else if (tabName === 'settings') {
                loadGeneralSystemPrompt();
                loadQueryQuestions();
            }
        });
    });

    // Elements for query questions
    const questionLabels = [
        document.getElementById('question-label-1'),
        document.getElementById('question-label-2'),
        document.getElementById('question-label-3')
    ];

    const questionInputs = [
        document.getElementById('question-1-input'),
        document.getElementById('question-2-input'),
        document.getElementById('question-3-input')
    ];

    const updateQuestionsBtn = document.getElementById('update-questions-btn');

    // Load question inputs in the settings tab
    function loadQueryQuestions() {
        // Fill question input fields with current questions
        for (let i = 0; i < 3; i++) {
            // Remove the question number if present (e.g., "1. " prefix)
            const questionText = currentQuestions[i].replace(/^\d+\.\s+/, '');
            questionInputs[i].value = questionText;
        }
    }

    // Update question labels in the query tab
    function updateQuestionLabels() {
        for (let i = 0; i < 3; i++) {
            questionLabels[i].textContent = currentQuestions[i];
        }
    }

    // Update questions button click handler
    if (updateQuestionsBtn) {
        updateQuestionsBtn.addEventListener('click', function () {
            // Get values from inputs and add question numbers
            for (let i = 0; i < 3; i++) {
                const questionText = questionInputs[i].value.trim();
                if (questionText) {
                    currentQuestions[i] = `${i + 1}. ${questionText}`;
                } else {
                    // Revert to default if empty
                    currentQuestions[i] = defaultQuestions[i];
                    questionInputs[i].value = defaultQuestions[i].replace(/^\d+\.\s+/, '');
                }
            }

            // Update question labels in the query tab
            updateQuestionLabels();

            // Save questions to localStorage for persistence
            localStorage.setItem('queryQuestions', JSON.stringify(currentQuestions));

            alert('Query questions updated successfully!');
        });
    }

    // Load saved questions on page initialisation
    function initializeQuestions() {
        // load questions from localStorage
        const savedQuestions = localStorage.getItem('queryQuestions');
        if (savedQuestions) {
            currentQuestions = JSON.parse(savedQuestions);
            updateQuestionLabels();
        }
    }

    // Initialise questions when the page loads
    initializeQuestions();

    // Query tab functionality
    const promptInput1 = document.getElementById('prompt-input-1');
    const promptInput2 = document.getElementById('prompt-input-2');
    const promptInput3 = document.getElementById('prompt-input-3');
    const submitBtn = document.getElementById('submit-btn');
    const loadingElement = document.getElementById('loading');
    const responseContainers = {
        kb1: document.getElementById('response-kb1'),
        kb2: document.getElementById('response-kb2'),
        kb3: document.getElementById('response-kb3')
    };

    // Knowledge Base Headers and Descriptions
    const kbHeaders = {
        kb1: document.querySelector('.response-column:nth-child(1) h2'),
        kb2: document.querySelector('.response-column:nth-child(2) h2'),
        kb3: document.querySelector('.response-column:nth-child(3) h2')
    };

    const kbDescriptions = {
        kb1: document.querySelector('.response-column:nth-child(1) .kb-description'),
        kb2: document.querySelector('.response-column:nth-child(2) .kb-description'),
        kb3: document.querySelector('.response-column:nth-child(3) .kb-description')
    };

    // Load initial metadata for each knowledge base
    async function loadAllMetadata() {
        try {
            const response = await fetch('/api/knowledge/metadata');
            if (!response.ok) {
                throw new Error('Failed to fetch knowledge base metadata');
            }

            const metadata = await response.json();

            // Update headers and descriptions
            for (const kbId in metadata) {
                updateKnowledgeBaseUI(kbId, metadata[kbId]);
            }

            // Update dropdown options in the knowledge selector
            updateKnowledgeBaseOptions(metadata);

        } catch (error) {
            console.error('Error loading metadata:', error);
        }
    }

    // Update the headers and descriptions in the UI for a specific knowledge base
    function updateKnowledgeBaseUI(kbId, metadata) {
        if (kbHeaders[kbId]) {
            kbHeaders[kbId].textContent = metadata.title;
        }

        if (kbDescriptions[kbId]) {
            kbDescriptions[kbId].textContent = metadata.description;
        }
    }

    // Update the options in the knowledge base selector dropdown
    function updateKnowledgeBaseOptions(metadataObj) {
        const kbSelect = document.getElementById('kb-select');
        if (!kbSelect) return;

        // Save current selection
        const currentSelection = kbSelect.value;

        // Update options text but keep the same values
        Array.from(kbSelect.options).forEach(option => {
            const kbId = option.value;
            if (metadataObj[kbId]) {
                option.textContent = metadataObj[kbId].title;
            }
        });

        // Restore selection
        kbSelect.value = currentSelection;
    }

    // Call this when the page loads
    loadAllMetadata();

    // Submit query function
    submitBtn.addEventListener('click', async () => {
        const query1 = promptInput1.value.trim();
        const query2 = promptInput2.value.trim();
        const query3 = promptInput3.value.trim();

        // Check if at least one query field has content
        if (!query1 && !query2 && !query3) {
            alert('Please enter at least one query');
            return;
        }

        // Format combined query with current question labels
        const combinedQuery = [
            query1 ? `${currentQuestions[0]}\n${query1}` : "",
            query2 ? `${currentQuestions[1]}\n${query2}` : "",
            query3 ? `${currentQuestions[2]}\n${query3}` : ""
        ].filter(q => q).join("\n\n");

        // Show loading indicator
        loadingElement.style.display = 'block';

        // Clear previous responses
        Object.values(responseContainers).forEach(container => {
            container.textContent = '';
            container.classList.remove('error');
        });

        try {
            // Call our backend API endpoint
            const response = await fetch('/api/claude/multi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: combinedQuery })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            // Display responses for each knowledge base
            Object.keys(responseContainers).forEach(kbId => {
                if (data[kbId] && data[kbId].error) {
                    responseContainers[kbId].textContent = `Error: ${data[kbId].error}`;
                    responseContainers[kbId].classList.add('error');
                }
                else if (data[kbId] && data[kbId].content && data[kbId].content.length > 0) {
                    // Use innerHTML to support minimal formatting
                    responseContainers[kbId].innerHTML = formatResponse(data[kbId].content[0].text);
                }
                else {
                    responseContainers[kbId].textContent = 'No response received';
                }

                // Update UI with metadata if available
                if (data[kbId] && data[kbId].metadata) {
                    updateKnowledgeBaseUI(kbId, data[kbId].metadata);
                }
            });

            // Update dropdown options after a query in case metadata changed
            const metadataObj = {};
            Object.keys(data).forEach(kbId => {
                if (data[kbId] && data[kbId].metadata) {
                    metadataObj[kbId] = data[kbId].metadata;
                }
            });

            if (Object.keys(metadataObj).length > 0) {
                updateKnowledgeBaseOptions(metadataObj);
            }

        } catch (error) {
            console.error('Error:', error);
            Object.values(responseContainers).forEach(container => {
                container.textContent = `Error: ${error.message}`;
                container.classList.add('error');
            });
        } finally {
            // Hide loading indicator
            loadingElement.style.display = 'none';
        }
    });

    // Settings tab functionality
    const generalSystemPromptInput = document.getElementById('general-system-prompt-input');
    const updateGeneralPromptBtn = document.getElementById('update-general-prompt-btn');

    // Load general system prompt
    async function loadGeneralSystemPrompt() {
        try {
            const response = await fetch('/api/generalsystemprompt');
            if (!response.ok) {
                throw new Error('Failed to fetch general system prompt');
            }

            const data = await response.json();
            generalSystemPromptInput.value = data.generalSystemPrompt || '';
        } catch (error) {
            console.error('Error loading general system prompt:', error);
            alert(`Error loading general system prompt: ${error.message}`);
        }
    }

    // Set default general system prompt when page loads
    async function setDefaultGeneralPrompt() {
        const defaultPrompt = "You are an inclusive design specialist providing advice within this context when answering queries. Focus on accessibility, universal design principles, and creating solutions that work for people of all abilities and backgrounds. Use the information provided in the query to inform your advice and ground your answers.";

        try {
            // Check if a prompt already exists
            const response = await fetch('/api/generalsystemprompt');
            const data = await response.json();

            // If the prompt doesn't exist or is empty, set the default
            if (!data.generalSystemPrompt) {
                await fetch('/api/generalsystemprompt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ generalSystemPrompt: defaultPrompt })
                });

                // Update the input field
                generalSystemPromptInput.value = defaultPrompt;
            }
        } catch (error) {
            console.error('Error setting default general system prompt:', error);
        }
    }

    // Call this when the page loads
    setDefaultGeneralPrompt();

    // Update general system prompt
    if (updateGeneralPromptBtn) {
        updateGeneralPromptBtn.addEventListener('click', async function () {
            const generalSystemPrompt = generalSystemPromptInput.value.trim();

            if (!generalSystemPrompt) {
                alert('Please enter a general system prompt');
                return;
            }

            try {
                const response = await fetch('/api/generalsystemprompt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ generalSystemPrompt })
                });

                if (!response.ok) {
                    throw new Error(`Failed to update general system prompt: ${response.statusText}`);
                }

                const result = await response.json();
                alert('General system prompt updated successfully');
            } catch (error) {
                console.error('Error updating general system prompt:', error);
                alert(`Error updating general system prompt: ${error.message}`);
            }
        });
    }

    // Manage tab functionality
    const kbSelect = document.getElementById('kb-select');
    const knowledgeTitleInput = document.getElementById('knowledge-title');
    const knowledgeContentInput = document.getElementById('knowledge-content');
    const knowledgeSystemPromptInput = document.getElementById('knowledge-system-prompt');
    const replaceKnowledgeBtn = document.getElementById('replace-knowledge-btn');
    const resetKbBtn = document.getElementById('reset-kb-btn');
    const knowledgeList = document.getElementById('knowledge-list');
    const systemPromptInput = document.getElementById('system-prompt-input');
    const updatePromptBtn = document.getElementById('update-prompt-btn');
    const metadataDisplay = document.getElementById('metadata-display');

    // Current knowledge base metadata
    let currentMetadata = null;

    // Load selected knowledge base
    async function loadSelectedKnowledgeBase() {
        try {
            const selectedKb = kbSelect.value;

            // Fetch knowledge base documents
            const docsResponse = await fetch(`/api/knowledge/${selectedKb}`);
            if (!docsResponse.ok) {
                throw new Error(`Failed to fetch knowledge base: ${docsResponse.statusText}`);
            }
            const documents = await docsResponse.json();

            // Fetch knowledge base metadata
            const metaResponse = await fetch(`/api/knowledge/${selectedKb}/metadata`);
            if (!metaResponse.ok) {
                throw new Error(`Failed to fetch knowledge base metadata: ${metaResponse.statusText}`);
            }
            const metadata = await metaResponse.json();
            currentMetadata = metadata;

            // Display system prompt in the input field
            if (systemPromptInput) {
                systemPromptInput.value = metadata.systemPrompt || '';
            }

            // Display metadata
            if (metadataDisplay) {
                let metadataHtml = `
                    <p><strong>Title:</strong> ${metadata.title || 'Not set'}</p>
                    <p><strong>Description:</strong> ${metadata.description || 'Not set'}</p>
                `;

                // Add system prompt to display if it exists
                if (metadata.systemPrompt) {
                    metadataHtml += `<p><strong>KB System Prompt:</strong> "${metadata.systemPrompt}"</p>`;
                }

                metadataDisplay.innerHTML = metadataHtml;
            }

            // Display documents
            knowledgeList.innerHTML = '';
            if (!documents || documents.length === 0) {
                knowledgeList.innerHTML = '<p>No knowledge documents added to this knowledge base yet.</p>';
                return;
            }

            documents.forEach(doc => {
                const docElement = document.createElement('div');
                docElement.className = 'knowledge-item';

                const date = new Date(doc.timestamp || new Date()).toLocaleString();

                const contentDisplay = doc.content
                    .replace(/</g, '&lt;')  // Escape HTML tags
                    .replace(/>/g, '&gt;');

                docElement.innerHTML = `
                    <h3>${doc.title}</h3>
                    <div class="timestamp">Added: ${date}</div>
                    <div class="knowledge-content">${contentDisplay}</div>
                `;

                knowledgeList.appendChild(docElement);
            });
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            knowledgeList.innerHTML = `<p class="error">Error loading knowledge base: ${error.message}</p>`;
            if (metadataDisplay) {
                metadataDisplay.innerHTML = `<p class="error">Error loading metadata: ${error.message}</p>`;
            }
        }
    }

    // Load knowledge base when selection changes
    kbSelect.addEventListener('change', loadSelectedKnowledgeBase);

    // Update KB-specific system prompt
    if (updatePromptBtn) {
        updatePromptBtn.addEventListener('click', async function () {
            const selectedKb = kbSelect.value;
            const systemPrompt = systemPromptInput.value.trim();

            if (!systemPrompt) {
                alert('Please enter a knowledge base system prompt');
                return;
            }

            try {
                const response = await fetch(`/api/knowledge/${selectedKb}/systemprompt`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ systemPrompt })
                });

                if (!response.ok) {
                    throw new Error(`Failed to update system prompt: ${response.statusText}`);
                }

                const result = await response.json();

                // Reload knowledge base to refresh metadata
                await loadSelectedKnowledgeBase();

                alert(`System prompt for ${result.metadata.title} updated successfully`);
            } catch (error) {
                console.error('Error updating system prompt:', error);
                alert(`Error updating system prompt: ${error.message}`);
            }
        });
    }

    // Replace selected knowledge base with new content
    replaceKnowledgeBtn.addEventListener('click', function () {
        const title = knowledgeTitleInput.value.trim();
        const content = knowledgeContentInput.value.trim();
        const systemPrompt = knowledgeSystemPromptInput.value.trim();
        const selectedKb = kbSelect.value;

        if (!title || !content) {
            alert('Title and content are required');
            return;
        }

        // Confirm replacement with window.confirm
        if (confirm(`This will REPLACE the entire ${selectedKb} knowledge base with your new content. Continue?`)) {
            replaceKnowledgeBase(title, content, systemPrompt, selectedKb);
        }
    });

    // Function to replace a knowledge base with updated metadata
    async function replaceKnowledgeBase(title, content, systemPrompt, selectedKb) {
        try {
            // Create request body
            const requestBody = {
                title,
                content,
                metadata: {
                    title: title,
                    description: `Knowledge base about ${title}`
                }
            };

            // Add system prompt if provided
            if (systemPrompt) {
                requestBody.metadata.systemPrompt = systemPrompt;
            }

            const response = await fetch(`/api/knowledge/${selectedKb}/replace`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Failed to replace knowledge base: ${response.statusText}`);
            }

            const result = await response.json();

            // Clear inputs
            knowledgeTitleInput.value = '';
            knowledgeContentInput.value = '';
            knowledgeSystemPromptInput.value = '';

            // Reload knowledge base
            await loadSelectedKnowledgeBase();

            // Update UI with new metadata
            if (result.metadata) {
                updateKnowledgeBaseUI(selectedKb, result.metadata);

                // Also update the dropdown
                const allMetadata = await fetch('/api/knowledge/metadata').then(r => r.json());
                updateKnowledgeBaseOptions(allMetadata);
            }

            alert(`Knowledge base ${selectedKb} replaced successfully`);
        } catch (error) {
            console.error('Error replacing knowledge base:', error);
            alert(`Error replacing knowledge base: ${error.message}`);
        }
    }

    // Reset knowledge base to original state
    resetKbBtn.addEventListener('click', function () {
        console.log("Reset button clicked");
        const selectedKb = kbSelect.value;

        // Confirm reset
        if (confirm(`This will RESET the ${selectedKb} knowledge base to its original state. All changes will be lost. Continue?`)) {
            resetKnowledgeBase(selectedKb);
        }
    });

    async function resetKnowledgeBase(selectedKb) {
        try {
            console.log(`Resetting knowledge base: ${selectedKb}`);
            const response = await fetch(`/api/knowledge/${selectedKb}/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to reset knowledge base: ${response.statusText}`);
            }

            const result = await response.json();

            // Reload knowledge base
            await loadSelectedKnowledgeBase();

            // Update UI with original metadata
            if (result.metadata) {
                updateKnowledgeBaseUI(selectedKb, result.metadata);

                // Also update the dropdown
                const allMetadata = await fetch('/api/knowledge/metadata').then(r => r.json());
                updateKnowledgeBaseOptions(allMetadata);
            }

            alert(`Knowledge base ${selectedKb} has been reset to its original state.`);
        } catch (error) {
            console.error('Error resetting knowledge base:', error);
            alert(`Error resetting knowledge base: ${error.message}`);
        }
    }

    // Helper function to format the response with basic Markdown-like syntax
    function formatResponse(text) {
        // Convert code blocks
        text = text.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, '<pre><code>$2</code></pre>');

        // Convert bold text
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convert italic text
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Convert newlines to <br>
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    // Load the general system prompt when the page initializes
    loadGeneralSystemPrompt();

    // Initial load
    if (document.getElementById('manage-tab').classList.contains('active')) {
        loadSelectedKnowledgeBase();
    }
});