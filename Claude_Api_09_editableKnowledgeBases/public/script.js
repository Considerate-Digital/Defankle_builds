document.addEventListener('DOMContentLoaded', () => {
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

            // If switching to manage tab, load the knowledge base contents
            if (tabName === 'manage') {
                loadSelectedKnowledgeBase();
            }
        });
    });

    // Query tab functionality
    const promptInput = document.getElementById('prompt-input');
    const submitBtn = document.getElementById('submit-btn');
    const loadingElement = document.getElementById('loading');
    const responseContainers = {
        kb1: document.getElementById('response-kb1'),
        kb2: document.getElementById('response-kb2'),
        kb3: document.getElementById('response-kb3')
    };

    // Submit query function
    submitBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();

        if (!prompt) {
            alert('Please enter a query');
            return;
        }

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
                body: JSON.stringify({ prompt })
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
            });

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

    // Manage tab functionality
    const kbSelect = document.getElementById('kb-select');
    const knowledgeTitleInput = document.getElementById('knowledge-title');
    const knowledgeContentInput = document.getElementById('knowledge-content');
    const replaceKnowledgeBtn = document.getElementById('replace-knowledge-btn');
    const resetKbBtn = document.getElementById('reset-kb-btn');
    const knowledgeList = document.getElementById('knowledge-list');

    // Load selected knowledge base
    async function loadSelectedKnowledgeBase() {
        try {
            const selectedKb = kbSelect.value;
            const response = await fetch(`/api/knowledge/${selectedKb}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch knowledge base: ${response.statusText}`);
            }

            const documents = await response.json();

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
        }
    }

    // Load knowledge base when selection changes
    kbSelect.addEventListener('change', loadSelectedKnowledgeBase);

    // Replace selected knowledge base with new content
    replaceKnowledgeBtn.addEventListener('click', function () {
        const title = knowledgeTitleInput.value.trim();
        const content = knowledgeContentInput.value.trim();
        const selectedKb = kbSelect.value;

        if (!title || !content) {
            alert('Title and content are required');
            return;
        }

        // Confirm replacement with window.confirm
        if (confirm(`This will REPLACE the entire ${selectedKb} knowledge base with your new content. Continue?`)) {
            replaceKnowledgeBase(title, content, selectedKb);
        }
    });

    async function replaceKnowledgeBase(title, content, selectedKb) {
        try {
            const response = await fetch(`/api/knowledge/${selectedKb}/replace`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content })
            });

            if (!response.ok) {
                throw new Error(`Failed to replace knowledge base: ${response.statusText}`);
            }

            // Clear inputs
            knowledgeTitleInput.value = '';
            knowledgeContentInput.value = '';

            // Reload knowledge base
            await loadSelectedKnowledgeBase();

            alert(`Knowledge base ${selectedKb} replaced successfully`);
        } catch (error) {
            console.error('Error replacing knowledge base:', error);
            alert(`Error replacing knowledge base: ${error.message}`);
        }
    }

    // Reset knowledge base to original state - Fixed
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

            // Reload knowledge base
            await loadSelectedKnowledgeBase();

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

    // Initial load
    if (document.getElementById('manage-tab').classList.contains('active')) {
        loadSelectedKnowledgeBase();
    }
});