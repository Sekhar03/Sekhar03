const fs = require('fs');
const path = require('path');

async function updateReadme() {
  try {
    console.log("Fetching repositories...");
    const response = await fetch('https://api.github.com/users/Sekhar03/repos?per_page=100');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const repos = await response.json();

    // Filter: Exclude forks, config files, duplicates, and local-frontend-mobile
    let activeProjects = repos
      .filter(repo => !repo.fork && repo.name !== 'Sekhar03' && repo.name !== '.github' && repo.name !== 'rrrreeeecccoooonnn' && repo.name !== 'local-frontend-mobile')
      // Sort by last pushed date (most recent first)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      // Take the top 5 most recently active projects
      .slice(0, 5);

    // Swap/Ensure I-CARD-SYSTEM is in the list
    const hasICard = activeProjects.some(repo => repo.name === 'I-CARD-SYSTEM');
    if (!hasICard) {
      const iCardRepo = repos.find(repo => repo.name === 'I-CARD-SYSTEM');
      if (iCardRepo) {
        // Swap with the last item in the list
        activeProjects[activeProjects.length - 1] = iCardRepo;
      }
    }

    console.log(`Found ${activeProjects.length} active projects.`);

    const customDescriptions = {
      'odia-transcriber': 'An automated speech-to-text transcribing tool for the Odia language.',
      'gherkin-checker': 'A syntax checker and validator for Gherkin feature files.',
      'recon': 'Recon Dashboard for system monitoring.',
      'Lokaal': 'A localization or local community management platform.',
      'I-CARD-SYSTEM': 'Institutional automated identity and gate management system for IGIT Sarang.'
    };

    const displayNames = {
      'I-CARD-SYSTEM': 'I-Card'
    };

    const customLanguages = {
      'I-CARD-SYSTEM': 'Java'
    };

    // Build the Markdown Table
    let tableMarkdown = `<div align="center">\n\n`;
    tableMarkdown += `| Project | Description | Primary Stack |\n`;
    tableMarkdown += `| :--- | :--- | :--- |\n`;

    activeProjects.forEach(repo => {
      const name = repo.name;
      const url = repo.html_url;
      const description = customDescriptions[name] || repo.description || 'No description provided.';
      const displayName = displayNames[name] || name;
      const language = customLanguages[name] || repo.language || 'HTML/CSS';

      tableMarkdown += `| **[${displayName}](${url})** | ${description} | ${language} |\n`;
    });

    tableMarkdown += `\n</div>`;

    // Read current README.md
    const readmePath = path.join(__dirname, '../../README.md');
    let readmeContent = fs.readFileSync(readmePath, 'utf8');

    // Replace the section between comment tags
    const startTag = '<!-- START_SECTION:projects -->';
    const endTag = '<!-- END_SECTION:projects -->';

    const startIndex = readmeContent.indexOf(startTag);
    const endIndex = readmeContent.indexOf(endTag);

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Could not find start/end section placeholders in README.md");
    }

    const updatedReadme = 
      readmeContent.slice(0, startIndex + startTag.length) + 
      '\n\n' + 
      tableMarkdown + 
      '\n\n' + 
      readmeContent.slice(endIndex);

    fs.writeFileSync(readmePath, updatedReadme, 'utf8');
    console.log("README.md updated successfully with latest projects!");
  } catch (error) {
    console.error("Error updating README:", error);
    process.exit(1);
  }
}

updateReadme();
