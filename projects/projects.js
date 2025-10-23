import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const titleElement = document.querySelector('.projects-title');
renderProjects(projects, projectsContainer, 'h2');
if (titleElement) {
  const count = projects.length;
  const label = count === 1 ? 'Project' : 'Projects';
  titleElement.textContent = `${count} ${label} `;
}
