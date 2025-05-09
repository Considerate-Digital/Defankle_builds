// server.js - In-memory storage
const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// General system prompt that applies to all knowledge bases
let generalSystemPrompt = "You are an inclusive design specialist providing advice within this context when answering queries. Focus on accessibility, universal design principles, and creating solutions that work for people of all abilities and backgrounds. Use the information provided in the query to inform your advice and ground your answers.";

// Setup initial knowledge bases with one document each and metadata
const initialKnowledgeBases = {
    kb1: {
        metadata: {
            title: "Inclusive Design Practice",
            description: "Methods and Practices",
            systemPrompt: "Use this inclusive design knowledge base to provide practical, evidence-based advice for designing products and services that work for everyone. Consider accessibility, cultural sensitivity, and diverse user needs in your responses."
        },
        documents: [
            {
                title: "Inclusive Design Practice",
                content: "# Summaries from the Uploaded Documents\n## Summary of Virtual Reality Multiplayer Adventure Game for Adolescents with ASD\nThe first document describes a study on the co-design and evaluation of \"Zentastic,\" a VR multiplayer adventure game developed for adolescents with Autism Spectrum Disorder (ASD) to foster social skills training. Key points include:\n- The game used an inclusive design approach involving therapists, designers, and adolescents with ASD in the development process\n- VR adventure games can offer effective technological solutions for training social skills in adolescents with ASD by leveraging multisensory interactions\n- The game supported multiplayer training sessions with small groups of adolescents and therapists acting as facilitators\n- The study included both early prototype testing and a later feasibility evaluation with multiple sessions\n- Results showed good acceptability of the VR game by adolescents and enhancement of their social skills from baseline to post-training\n- The game was designed with progressive scaffolding to elicit social interaction through different missions targeting specific social skills\n- Observations during sessions showed adolescents demonstrated natural curiosity, increased self-confidence, and active collaboration\n- Testing showed a significant median increase in social skills questionnaire scores after the intervention\n## Summary of Inclusive Design Toolkit\nThe second document presents a comprehensive guide to inclusive design principles and practices from Product Design Scotland. Key information includes:\n### Definition of Inclusive Design\n- An approach to product development that intentionally ensures equity of performance and usability for everyone\n- Requires proactively taking measures to enable equity rather than creating division\n- Aims to minimize bias and increase understanding of wider user needs and experiences\n### Benefits of Inclusive Design\n- Access to new and underserved markets\n- Products more likely to work as intended with fewer unintended consequences\n- Inclusive products often have mainstream benefits\n- Inclusive teams outperform others financially and have higher innovation rates\n### Key Concepts\n- **Equity**: Recognizing different circumstances require different resources to reach equal outcomes\n- **Diversity**: Including a wide range of perspectives\n- **Inclusion**: Creating environments where everyone feels valued and able to contribute\n- **Protected Characteristics**: Age, disability, gender reassignment, marriage/civil partnerships, pregnancy/maternity, race, religion/belief, sex, sexual orientation\n- **Intersectionality**: When two or more protected characteristics intersect, often compounding biases\n### Case Studies\n- **Successful Examples**: Samsung's approach to mobile phones for elderly users focusing on instruction manuals rather than simplification; OXO Good Grips designing universal utensils that work for everyone\n- **Problematic Examples**: VR headsets oversized for women causing more motion sickness; crash test dummies based only on male anthropometrics leading to higher injury rates for women; speech recognition trained mainly on male voices\n### Six Practices for Inclusive Design\n1. **Be Empathetic**: Intentionally understand challenges from users' perspectives\n2. **Include Diverse Perspectives**: From the earliest research stages\n3. **Make Assumptions Explicit**: Recognize and mitigate biases\n4. **Test with Diverse Users**: Design with people, not just for them\n5. **Look for Inclusive Teams**: Diverse teams perform better and avoid echo-chamber thinking\n6. **Consider Systems-Level Implications**: Think about broader impacts and second/third-order effects\nThe toolkit emphasizes that inclusive design is responsible design - an ethical obligation, good business practice, and sometimes a legal requirement.",
                timestamp: new Date().toISOString()
            }
        ]
    },
    kb2: {
        metadata: {
            title: "Reproductive Health",
            description: "UK Reproductive Health sources",
            systemPrompt: "Use this reproductive health knowledge base to provide factual, medically accurate information based on the latest research. Apply an inclusive design lens to ensure information is accessible to all genders and backgrounds."
        },
        documents: [
            {
                title: "Women's Reproductive Health Survey 2023",
                content: "# Women's Reproductive Health Survey 2023 - Key Findings Summary\nThe Women's Reproductive Health Survey 2023 is the largest survey of its kind in England, with 59,332 responses from women and people assigned female at birth aged 16-55 years. Here are the key findings from this comprehensive study:\n## Survey Demographics\n- 59,332 total respondents (52,129 completed in full)\n- Regional representation matched general population\n- Under 35s were moderately overrepresented\n- Ethnicity representation skewed: 92.3% White respondents (vs 77.9% in general population)\n- Higher education level: 72.6% had degree or equivalent (vs 41.4% in general population)\n- 96.2% identified as women/girls, 1.6% as non-binary, 0.2% as trans male\n## Periods and Menopause\n- 63.7% reported moderate to severe period pain\n- 50% experienced heavy bleeding (changing products every 1-2 hours)\n- 11.8% missed 3+ days of work/education due to period symptoms\n- Only 23% with painful/heavy periods sought professional help\n- 45.4% were dissatisfied with professional support received\n- 42.2% of those aged 45-55 had not had a period in the last year\n- 29.1% of those aged 40-55 used hormone replacement therapy\n- 59.6% of those who sought menopause support were satisfied with care\n## Contraception\n- 69% used contraception (for pregnancy/STI prevention or health reasons)\n- Most common methods: condom (16.7%), hormonal IUD (9.2%), progesterone-only pill (7.6%)\n- 18.3% used long-acting reversible contraception\n- 60.2% of those with IUDs experienced moderate/severe pain during fitting\n- 86.8% were able to access their preferred contraceptive method\n- 23.7% stopped/switched methods, primarily due to mood effects (35.7%)\n## Pregnancy\n- 12.7% of those under 45 reported pregnancy in the last year\n- 66.7% of pregnancies were planned, 17.8% ambivalent, 15.5% unplanned\n- 6.3% of respondents under 45 had a live birth in the last year\n- 1.3% reported having an abortion in the last year\n- 9.1% of those ever pregnant experienced miscarriage in the last year\n- 18.9% of those who had vaginal intercourse experienced infertility\n- Mixed satisfaction with pre-conception healthcare: 42.8% satisfied, 30% dissatisfied\n## Reproductive Health Conditions\n- Most common symptoms: pain during/after sex (31.5%), pelvic pain not associated with periods (30.2%), urinary incontinence (25.3%)\n- Most common conditions: PCOS (10.5%), endometriosis (8.8%), uterine fibroids (5.1%)\n- 32.6% with symptoms/conditions had not received professional help in the last year\nThe research team plans further analysis to better understand who is most affected by reproductive health conditions and how support services can be improved across different life stages.",
                timestamp: new Date().toISOString()
            }
        ]
    },
    kb3: {
        metadata: {
            title: "Cardio Vascular Health",
            description: "British Heart Foundation source",
            systemPrompt: "Use this cardiovascular health knowledge base to provide evidence-based information focused on the disparities in cardiovascular care between different populations. Apply inclusive design principles to ensure information is accessible to all."
        },
        documents: [
            {
                title: "Cardiovascular Health",
                content: "# Summary of BHF Response to Women's Health Strategy Call for Evidence\nThis document is the British Heart Foundation's (BHF) response to the UK Government's Call for Evidence for developing a Women's Health Strategy in June 2021. The response highlights the significant disparities in cardiovascular disease (CVD) diagnosis, treatment, and research between men and women.\n## Key Statistics and Facts\n- Cardiovascular disease is the world's biggest killer for both women and men\n- It causes 35% of deaths in women worldwide and 26% of deaths in women in the UK\n- Women comprise about 3.6 million of the 7.6 million people in the UK living with CVD\n- Coronary heart disease kills twice as many women as breast cancer in the UK\n## Main Issues Identified\n1. **Awareness Gap**: Women are under-aware of their cardiovascular risk\n2. **Diagnostic Disparities**: Women are 50% more likely to receive the wrong initial diagnosis for heart attacks\n3. **Treatment Inequalities**: Women receive fewer guideline-recommended therapies than men\n4. **Research Representation**: Women are underrepresented in cardiovascular research\n## Sex-Specific Risk Factors\n- Notable sex differences exist across all major cardiovascular risk factors:\n  - Hypertension (high blood pressure)\n  - Hyperlipidemia (high cholesterol)\n  - Diabetes (44% greater risk of coronary heart disease in women with diabetes than men)\n  - Obesity and weight issues\n- Pregnancy-related conditions increase later CVD risk:\n  - Pre-eclampsia\n  - Gestational diabetes\n  - Preterm delivery\n  - Peripartum cardiomyopathy\n## CVD Conditions With Higher Prevalence in Women\n- Myocardial Infarction with Non-Obstructive Coronary Arteries (MINOCA)\n- Ischemia with Non-Obstructive Coronary Arteries (INOCA)\n- Spontaneous Coronary Artery Dissection (SCAD)\n- Takotsubo Syndrome\n## Research and Workforce Issues\n- Only 38.2% of cardiovascular clinical trial participants are women\n- Women are underrepresented in the research and clinical workforce\n- Only 13% of cardiology consultants in the UK are women\n- Female researchers experience higher rates of harassment and bullying\n## Recommendations\n1. Develop a comprehensive Women's Health Strategy with near and long-term interventions\n2. Improve cardiovascular risk assessments in women, including better integration of pregnancy-related risk factors\n3. Target research toward CVD conditions that disproportionately affect women\n4. Increase women's participation in clinical trials\n5. Address gender inequalities in the cardiovascular research and clinical workforce\n6. Enhance awareness of CVD in women among both healthcare professionals and the public\nThe BHF emphasizes that a holistic approach to women's health is needed that goes beyond reproductive health and considers cardiovascular health across a woman's entire lifespan.",
                timestamp: new Date().toISOString()
            }
        ]
    }
};

// Create in-memory storage of initial data
let knowledgeBases = {
    kb1: JSON.parse(JSON.stringify(initialKnowledgeBases.kb1)),
    kb2: JSON.parse(JSON.stringify(initialKnowledgeBases.kb2)),
    kb3: JSON.parse(JSON.stringify(initialKnowledgeBases.kb3))
};

// Function to load knowledge base from memory
async function loadKnowledgeBase(kbId) {
    return knowledgeBases[kbId]?.documents || [];
}

// Function to load metadata from memory
async function loadKnowledgeBaseMetadata(kbId) {
    return knowledgeBases[kbId]?.metadata || { title: kbId, description: "Knowledge Base" };
}

// Function to save knowledge base to memory
async function saveKnowledgeBase(kbId, documents) {
    if (!knowledgeBases[kbId]) {
        knowledgeBases[kbId] = { metadata: { title: kbId, description: "Knowledge Base" }, documents: [] };
    }
    knowledgeBases[kbId].documents = documents;
}

// Function to save metadata to memory
async function saveKnowledgeBaseMetadata(kbId, metadata) {
    if (!knowledgeBases[kbId]) {
        knowledgeBases[kbId] = { metadata: metadata, documents: [] };
    } else {
        knowledgeBases[kbId].metadata = metadata;
    }
}

// Function to get the general system prompt
async function getGeneralSystemPrompt() {
    return generalSystemPrompt;
}

// Function to update the general system prompt
async function updateGeneralSystemPrompt(newPrompt) {
    generalSystemPrompt = newPrompt;
    return generalSystemPrompt;
}

// API endpoint to get all knowledge base metadata
app.get('/api/knowledge/metadata', async (req, res) => {
    try {
        const metadata = {};
        for (const kbId of Object.keys(knowledgeBases)) {
            metadata[kbId] = await loadKnowledgeBaseMetadata(kbId);
        }
        res.json(metadata);
    } catch (error) {
        console.error('Error fetching knowledge base metadata:', error);
        res.status(500).json({ error: 'Failed to fetch knowledge base metadata' });
    }
});

// API endpoint to get text from a specific knowledge base
app.get('/api/knowledge/:kbId', async (req, res) => {
    try {
        const { kbId } = req.params;

        // Validate kbId
        if (!['kb1', 'kb2', 'kb3'].includes(kbId)) {
            return res.status(400).json({ error: 'Invalid knowledge base ID' });
        }

        const documents = await loadKnowledgeBase(kbId);
        res.json(documents);
    } catch (error) {
        console.error(`Error fetching knowledge base ${req.params.kbId}:`, error);
        res.status(500).json({ error: 'Failed to fetch knowledge base' });
    }
});

// API endpoint to get metadata for a specific knowledge base
app.get('/api/knowledge/:kbId/metadata', async (req, res) => {
    try {
        const { kbId } = req.params;

        // Validate kbId
        if (!['kb1', 'kb2', 'kb3'].includes(kbId)) {
            return res.status(400).json({ error: 'Invalid knowledge base ID' });
        }

        const metadata = await loadKnowledgeBaseMetadata(kbId);
        res.json(metadata);
    } catch (error) {
        console.error(`Error fetching knowledge base metadata ${req.params.kbId}:`, error);
        res.status(500).json({ error: 'Failed to fetch knowledge base metadata' });
    }
});

// API endpoint to get the general system prompt
app.get('/api/generalsystemprompt', async (req, res) => {
    try {
        const prompt = await getGeneralSystemPrompt();
        res.json({ generalSystemPrompt: prompt });
    } catch (error) {
        console.error('Error fetching general system prompt:', error);
        res.status(500).json({ error: 'Failed to fetch general system prompt' });
    }
});

// API endpoint to update the general system prompt
app.post('/api/generalsystemprompt', async (req, res) => {
    try {
        const { generalSystemPrompt } = req.body;

        if (!generalSystemPrompt || typeof generalSystemPrompt !== 'string') {
            return res.status(400).json({ error: 'General system prompt is required and must be a string' });
        }

        const updatedPrompt = await updateGeneralSystemPrompt(generalSystemPrompt);
        res.status(200).json({
            message: 'General system prompt updated successfully',
            generalSystemPrompt: updatedPrompt
        });
    } catch (error) {
        console.error('Error updating general system prompt:', error);
        res.status(500).json({ error: 'Failed to update general system prompt' });
    }
});

// API endpoint to add a document text to a specific knowledge base
app.post('/api/knowledge/:kbId', async (req, res) => {
    try {
        const { kbId } = req.params;
        const { title, content } = req.body;

        // Validate knowledge base Id
        if (!['kb1', 'kb2', 'kb3'].includes(kbId)) {
            return res.status(400).json({ error: 'Invalid knowledge base ID' });
        }

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const documents = await loadKnowledgeBase(kbId);

        // Add new document with timestamp
        documents.push({
            id: Date.now().toString(),
            title,
            content,
            timestamp: new Date().toISOString()
        });

        await saveKnowledgeBase(kbId, documents);

        res.status(201).json({ message: `Knowledge added successfully to ${kbId}` });
    } catch (error) {
        console.error(`Error adding to knowledge base ${req.params.kbId}:`, error);
        res.status(500).json({ error: 'Failed to add knowledge' });
    }
});

// API endpoint to replace an entire knowledge base
app.post('/api/knowledge/:kbId/replace', async (req, res) => {
    try {
        const { kbId } = req.params;
        const { title, content, metadata, systemPrompt } = req.body;

        // Validate knowledge base ID
        if (!['kb1', 'kb2', 'kb3'].includes(kbId)) {
            return res.status(400).json({ error: 'Invalid knowledge base ID' });
        }

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        // Create a new knowledge base with just this document
        const newKnowledgeBase = [
            {
                id: Date.now().toString(),
                title,
                content,
                timestamp: new Date().toISOString()
            }
        ];

        await saveKnowledgeBase(kbId, newKnowledgeBase);

        // Set up metadata with system prompt
        let updatedMetadata = {
            title: title,
            description: `Knowledge base for ${title}`
        };

        // Add system prompt if provided
        if (systemPrompt) {
            updatedMetadata.systemPrompt = systemPrompt;
        }

        // Override with provided metadata if it exists
        if (metadata && typeof metadata === 'object') {
            updatedMetadata = { ...updatedMetadata, ...metadata };
        }

        await saveKnowledgeBaseMetadata(kbId, updatedMetadata);

        res.status(200).json({
            message: `Knowledge base ${kbId} replaced successfully`,
            metadata: await loadKnowledgeBaseMetadata(kbId)
        });
    } catch (error) {
        console.error(`Error replacing knowledge base ${req.params.kbId}:`, error);
        res.status(500).json({ error: 'Failed to replace knowledge base' });
    }
});

// Function to reset a knowledge base to its initial state
app.post('/api/knowledge/:kbId/reset', async (req, res) => {
    try {
        const { kbId } = req.params;

        // Validate knowledge base ID
        if (!['kb1', 'kb2', 'kb3'].includes(kbId)) {
            return res.status(400).json({ error: 'Invalid knowledge base ID' });
        }

        if (!initialKnowledgeBases[kbId]) {
            return res.status(404).json({ error: 'Initial data not found for this knowledge base' });
        }

        console.log(`Resetting knowledge base ${kbId} to initial state with ${initialKnowledgeBases[kbId].documents.length} documents`);

        // Reset to initial data - make a copy to prevent reference issues
        knowledgeBases[kbId] = JSON.parse(JSON.stringify(initialKnowledgeBases[kbId]));

        res.status(200).json({
            message: `Knowledge base ${kbId} reset to initial state`,
            metadata: await loadKnowledgeBaseMetadata(kbId)
        });
    } catch (error) {
        console.error(`Error resetting knowledge base ${req.params.kbId}:`, error);
        res.status(500).json({ error: 'Failed to reset knowledge base' });
    }
});

// API endpoint to update just the system prompt for a knowledge base
app.post('/api/knowledge/:kbId/systemprompt', async (req, res) => {
    try {
        const { kbId } = req.params;
        const { systemPrompt } = req.body;

        // Validate knowledge base ID
        if (!['kb1', 'kb2', 'kb3'].includes(kbId)) {
            return res.status(400).json({ error: 'Invalid knowledge base ID' });
        }

        if (!systemPrompt || typeof systemPrompt !== 'string') {
            return res.status(400).json({ error: 'System prompt is required and must be a string' });
        }

        // Get current metadata
        const currentMetadata = await loadKnowledgeBaseMetadata(kbId);

        // Update system prompt
        const updatedMetadata = {
            ...currentMetadata,
            systemPrompt: systemPrompt
        };

        await saveKnowledgeBaseMetadata(kbId, updatedMetadata);

        res.status(200).json({
            message: `System prompt for ${kbId} updated successfully`,
            metadata: updatedMetadata
        });
    } catch (error) {
        console.error(`Error updating system prompt for ${req.params.kbId}:`, error);
        res.status(500).json({ error: 'Failed to update system prompt' });
    }
});

// API endpoint to query all knowledge bases simultaneously
app.post('/api/claude/multi', async (req, res) => {
    try {
        const { prompt } = req.body;

        // Check for API key
        const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
        if (!ANTHROPIC_API_KEY) {
            console.error('ANTHROPIC_API_KEY not found in environment variables');
            return res.status(500).json({
                error: 'Server configuration error',
                message: 'ANTHROPIC_API_KEY environment variable is missing'
            });
        }

        // Get the general system prompt
        const generalPrompt = await getGeneralSystemPrompt();

        // Create an array of promises for querying each knowledge base
        const promises = ['kb1', 'kb2', 'kb3'].map(async (kbId) => {
            try {
                // Get metadata for the knowledge base
                const metadata = await loadKnowledgeBaseMetadata(kbId);

                // Combine general system prompt with the KB-specific one
                let systemPrompt = generalPrompt;

                // Add KB-specific prompt if available
                if (metadata.systemPrompt) {
                    systemPrompt = `${generalPrompt}\n\n${metadata.systemPrompt}`;
                }

                // Load documents from the knowledge base
                const documents = await loadKnowledgeBase(kbId);

                // Format knowledge base context
                let knowledgeContext = "";
                if (documents && documents.length > 0) {
                    knowledgeContext = `${metadata.title} Knowledge Base:\n\n` +
                        documents.map(doc =>
                            `DOCUMENT: ${doc.title}\n${doc.content}\n---`
                        ).join("\n\n");

                    // Enhance system prompt with knowledge context instruction
                    systemPrompt += "\n\nUse the provided knowledge base to inform your responses when relevant.";
                }

                // Prepare user message with knowledge context
                let userMessage = prompt;
                if (knowledgeContext) {
                    userMessage = `${knowledgeContext}\n\nQUESTION: ${userMessage}`;
                }

                // Make request to Anthropic API
                const response = await axios.post(
                    'https://api.anthropic.com/v1/messages',
                    {
                        model: "claude-3-7-sonnet-20250219",
                        max_tokens: 1500, // Reduced tokens for multi-query
                        temperature: 0.7,
                        system: systemPrompt,
                        messages: [
                            {
                                role: "user",
                                content: userMessage
                            }
                        ]
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': ANTHROPIC_API_KEY,
                            'anthropic-version': '2023-06-01'
                        }
                    }
                );

                return {
                    kbId,
                    response: response.data,
                    metadata: metadata
                };
            } catch (error) {
                console.error(`Error in ${kbId} query:`, error.response?.data || error.message);
                return {
                    kbId,
                    error: error.message,
                    metadata: await loadKnowledgeBaseMetadata(kbId)
                };
            }
        });

        // Execute all knowledge base queries in parallel
        const results = await Promise.all(promises);

        // Format the final response
        const multiResponse = {};
        results.forEach(result => {
            multiResponse[result.kbId] = result.error ?
                { error: result.error, metadata: result.metadata } :
                { ...result.response, metadata: result.metadata };
        });

        res.json(multiResponse);
    } catch (error) {
        console.error('Error processing multi-query:', error);
        res.status(500).json({
            error: 'Error processing multi-query request',
            message: error.message
        });
    }
});

// Route for serving the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// if useing Vercel (comment out if running locally)
// Export for Vercel serverless functions
module.exports = app;