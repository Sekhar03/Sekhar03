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

    // Filter: Exclude forks and config files repos
    const activeProjects = repos
      .filter(repo => !repo.fork && repo.name !== 'Sekhar03' && repo.name !== '.github')
      // Sort by last pushed date (most recent first)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      // Take the top 5 most recently active projects
      .slice(0, 5);

    console.log(`Found ${activeProjects.length} active projects.`);

    // Build the Markdown Table
    let tableMarkdown = `<div align="center">\n\n`;
    tableMarkdown += `| Project | Description | Primary Stack |\n`;
    tableMarkdown += `| :--- | :--- | :--- |\n`;

    activeProjects.forEach(repo => {
      const name = repo.name;
      const url = repo.html_url;
      const description = repo.description || 'No description provided.';
      const language = repo.language || 'HTML/CSS';

      tableMarkdown += `| **[${name}](${url})** | ${description} | ${language} |\n`;
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
