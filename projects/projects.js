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

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const allYears = Array.from(new Set(projects.map(p => String(p.year)))).sort();
const colorForYear = d3.scaleOrdinal(d3.schemeTableau10).domain(allYears);

let currentPieData = null;

let query = '';
let searchInput = document.querySelector('.searchBar');
let selectedYear = null;

function renderPieChart(projectsGiven) {
  let svg = d3.select('.container svg');
  let legend = d3.select('.container .legend');
  svg.selectAll('path').remove();
  legend.selectAll('*').remove();

  let newRolledData = d3.rollups(projectsGiven, v => v.length, d => d.year);


  let newData = newRolledData.map(([year, count]) => ({ value: count, label: year }));
  const selectedIndexForRender = newData.findIndex(d => String(d.label) === String(selectedYear));

  let newSliceGenerator = d3.pie().value(d => d.value);
  let newArcData = newSliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let newArcs = newArcData.map(d => arcGenerator(d));
  


  newArcs.forEach((pathD, i) => {
    const year = newData[i].label;
    svg.append('path')
      .attr('d', pathD)
      .attr('fill', colorForYear(year))
      .attr('class', i === selectedIndexForRender ? 'selected' : null)
      .on('click', () => {
       selectedYear = (String(selectedYear) === String(year)) ? null : year;

      svg.selectAll('path')
        .attr('class', (_, idx) =>
          (String(newData[idx].label) === String(selectedYear) ? 'selected' : null)
        );

      legend.selectAll('li')
        .attr('class', (_, idx) =>
          (String(newData[idx].label) === String(selectedYear) ? 'selected' : null)
        );

      const listFiltered = getFilteredProjects();
      renderProjects(listFiltered, projectsContainer, 'h2');
      });
    });



  newData.forEach((d, i) => {
    const year = d.label;
    legend.append('li')
      .attr('style', `--color:${colorForYear(year)}`)
      .attr('class', String(year) === String(selectedYear) ? 'selected' : null)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedYear = (String(selectedYear) === String(year)) ? null : year;

        svg.selectAll('path')
        .attr('class', (_, idx) =>
          (String(newData[idx].label) === String(selectedYear) ? 'selected' : null)
        );

      legend.selectAll('li')
        .attr('class', (_, idx) =>
          (String(newData[idx].label) === String(selectedYear) ? 'selected' : null)
        );

        const listFiltered = getFilteredProjects();
      renderProjects(listFiltered, projectsContainer, 'h2');
      });
  });
}


function setQuery(value) {
  query = value;
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  query = event.target.value;       
  const listFiltered = getFilteredProjects();      
  const pieFiltered  = getQueryFilteredProjects();   
  renderProjects(listFiltered, projectsContainer, 'h2');
  renderPieChart(pieFiltered); 
});

function getFilteredProjects() {
  let list = projects;

  if (query && query.trim() !== '') {
    const q = query.toLowerCase();
    list = list.filter(p =>
      Object.values(p).join('\n').toLowerCase().includes(q)
    );
  }


  if (selectedYear != null) {
    list = list.filter(p => String(p.year) === String(selectedYear));
  }

  return list;
}

function getQueryFilteredProjects() {
  let list = projects;
  if (query && query.trim() !== '') {
    const q = query.toLowerCase();
    list = list.filter(p =>
      Object.values(p).join('\n').toLowerCase().includes(q)
    );
  }
  return list; 
}
