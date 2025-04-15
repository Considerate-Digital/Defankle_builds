# Defankle_builds

## Outline

An interactive exploration of Claude Large Language Model and the use of Knowledge Bases.

A knowledge base is what Claude calls its context that “grounds” the LLM. For example, uploading documents or specific text to a Knowledge Base will “ground” the answers in that knowledge.

This interface allows for the query of up to three different knowledge bases simultaneously. It can be used to compare answers, bias and differences when an LLM is informed by different contexts.

## User Interface

### Query

The user can answer three questions to query the LLM and see the different answers returned.

### Knowledge Base Management

Users or workshop facilitators can change the Knowledge Bases in this part of the interface.

1. Select a Knowledge Base you want to replce from the drop down menu.
2. Copy/paste the new text and change the title to replace a Knowledge Base.
3. Click replace Knowledge Base to update.

There is also the ability to set a specific Knowledge Base prompt. This is useful when providing specific instructions that are related to that Knowledge Base only.

If you want to reset the interface back to the original three Knowledge Bases click the red reset button at the bottom of the page.

### System

In this section users or workshop facilitators can edit the three query questions and the general system prompt.

The general system prompt is what instructs the overall query and behaviour of the resulting answers.. What you put in here influences all of the answers. It's useful to use this as a set of instructions as to set a tone of the reply, how you would like to receive answers, what key metrics you want to extract every time and in what format or order. The more specific the instructions are here, the more consistent the structure of the answers will be across the three Knowledge Base answers.

# Build

## Local setup

1. Clone the repository

```
git clone "https://github.com/j3nsykes/Defankle_builds"

```

2. Enter the repository

```
cd Defankle_builds
```

3. Create an `.env` file and edit it. Example (use your text editor of choice such as Visual Studio Code):

```
touch .env
```

4. Add the environmental variables as shown in the example below (see "Environmental Variables"). Make sure you replace the values with the relevant keys, ports and domains.

5. Should you wish to change the API key to your own:

- create a developer account in Claude.
- navigate to the [developer console](https://console.anthropic.com/login?returnTo=%2F%3F)
- Select API keys from the menu.
- Select create new key. Copy/paste the API key from here and paste into the .env file

6. Install the requried libraries.

```
npm install
```

... or use `pnpm`, if you like. :sunglasses:

7. Start the server.

```
npm run dev
```

8. Navigate to your app at http://localhost:3000

## Vercel deployment

[Vercel](https://vercel.com/docs) is a useful platform for deploying web applications. You can easily deploy this build to Vercel to share it with others.

You can also use other similar platforms, deploy to a cloud server or opt to deploy the build to your own physical server. Please refer to 'production setup' for instructions on how to do this.

Before you begin, create an account on Vercel. The simplest way to deploy is to connect your Github account to Vercel so your repositories can be deployed easily as projects.

1. Clone the repository

```
git clone "https://github.com/j3nsykes/Defankle_builds"

```

2. Enter the repository

```
cd Defankle_builds
```

3. Create an `.env` file and edit it. Example (use your text editor of choice such as Visual Studio Code):

```
touch .env
```

4. Add the environmental variables as shown in the example below (see "Environmental Variables"). Make sure you replace the values with the relevant keys, ports and domains.

5. Should you wish to change the API key to your own: - see instructions outlined above in step 5 for local build.

6. Install the requried libraries.

```
npm install
```

... or use `pnpm`, if you like. :sunglasses:

7. Create a `vercel.json` file in the root directory. Your folder heirarchy should look like this when you are finished:

```bash
/project-root/
│
├── server.js                   # Main server application
├── vercel.json                 # Vercel deployment configuration
├── package.json                # Node.js dependencies
├── .env                        # Environment variables (ANTHROPIC_API_KEY)
│
├── public/                     # Static files served by Express
│   ├── index.html              # Main HTML file with UI structure
│   ├── style.css               # CSS styles for the application
│   └── script.js               # Client-side JavaScript for the UI
│
└── node_modules/               # Node.js installed packages
```

8. Copy/paste the following into your `vercel.json` file.

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

9. Push the recent changes to your Github repo.

10. In the Vercel Dashboard, select 'add new project' and opt to Import Git Repository.

11. Select your repository from the list and click import.

12. When you deploy to Vercel, your local .env file isn't uploaded or used by default. Instead, you need to set the environment variables directly in the Vercel dashboard.

13. Navigate to "Environment Variables" at the bottom of the project settings.

14. Add a new variable:
    NAME: ANTHROPIC_API_KEY
    VALUE: Paste your live API key
15. Click "Deploy" to deploy your application.

16. This may take a few minutes to deploy, afterwhich you will be provided with a URL where your application is hosted.

## Production Setup

You may wish to deploy the application to a cloud server of your choosing. The deployment options vary between providers. Many organisations will opt to create a containerised application, building an image using Docker or containerd, and then deploying the application image using Podman, Docker, containerd, Ansible or Kubernetes.

Building an image can be automated using traditional system scripting or using Docker Compose and Dockerfiles. The starting point for creating build scripts should follow a pathway similar to the two deployment setups outlined above.

It is common practice to separate applications into microservices for scalable deployment. In this case, this would involve separating the “backend” server application, the “frontend” client-side application, any data storage such as vector or traditional databases, and any fine tuned models with API (webserver) access.

## Environmental Variables

Before the app can run, you need to tell it how to connect to the various services that it deploys. These are detailed in the `.env` file at the root of the project.

Here are some examples:

Standard local setup:

```
ANTHROPIC_API_KEY=your_api_key_copied_here
PORT=3000
```

Standard production setup:

```
ANTHROPIC_API_KEY=your_api_key_copied_here
```

### Authors and Support

This project was made by Alex and Jen at Considerate Digital. If you need support please [contact us](https://considerate.digital).

### System Architecture

[View system diagram and future iteration suggestions here ![](https://app.eraser.io/workspace/ICGIWlI0KeSv68A1feZs/preview?elements=C0ZVSjn2lKvnnEOUOZ8BZQ&type=embed)](https://app.eraser.io/workspace/ICGIWlI0KeSv68A1feZs?elements=C0ZVSjn2lKvnnEOUOZ8BZQ)
