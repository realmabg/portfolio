

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';


let xScale, yScale;

const colors = d3.scaleOrdinal(d3.schemeTableau10);

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        // What other options do we need to set?
        // Hint: look up configurable, writable, and enumerable
        enumerable: false,
        writable: false,
        configurable: true,
      });

      return ret;
    });
}

// function renderCommitInfo(data, commits) {
//   // Create the dl element
//   const dl = d3.select('#stats').append('dl').attr('class', 'stats');

//   // Add total LOC
//   dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
//   dl.append('dd').text(data.length);

//   // Add total commits
//   dl.append('dt').text('Commits');
//   dl.append('dd').text(commits.length);

//   // Add more stats as needed...
//   const numFiles = d3.group(data, d => d.file).size;
//   dl.append('dt').text('Files');
//   dl.append('dd').text(numFiles);

//   // Longest file
//   const fileLengths = d3.rollups(
//     data,
//     v => d3.max(v, d => d.line),
//     d => d.file
//   ); 
//   const longestFileEntry = d3.greatest(fileLengths, d => d[1]);
//   const longestFileName = longestFileEntry?.[0] ?? 'n/a';
//   const longestFileLen  = longestFileEntry?.[1] ?? 0;
//   dl.append('dt').text('Longest file');
//   dl.append('dd').text(`${longestFileName} (${longestFileLen} lines)`);

//   // Average file length 
//   const avgFileLength = d3.mean(fileLengths, d => d[1]);
//   dl.append('dt').text('Avg file length');
//   dl.append('dd').text(
//     Number.isFinite(avgFileLength) ? Math.round(avgFileLength) : 'n/a'
//   );

//   // Average file depth 
//   const fileMaxDepths = d3.rollups(
//     data,
//     v => d3.max(v, d => d.depth),
//     d => d.file
//   );
  

//   // 
//   const workByPeriod = d3.rollups(
//     data,
//     v => v.length,
//     d => {
//       const dt = d.datetime instanceof Date ? d.datetime : new Date(d.datetime);
//       return dt.toLocaleString('en', { dayPeriod: 'short' }); 
//     }
//   );
//   const maxPeriod = d3.greatest(workByPeriod, d => d[1])?.[0] ?? 'n/a';
//   dl.append('dt').text('Most active period');
//   dl.append('dd').text(maxPeriod);
// }

function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Commits');
  dl.append('dd').text(commits.length);

  // Add more stats as needed...
  const numFiles = d3.group(data, d => d.file).size;
  dl.append('dt').text('Files');
  dl.append('dd').text(numFiles);

  // Longest file
  const fileLengths = d3.rollups(
    data,
    v => d3.max(v, d => d.line),
    d => d.file
  );
  const longestFileEntry = d3.greatest(fileLengths, d => d[1]);
  const longestFileName = longestFileEntry?.[0] ?? 'n/a';
  const longestFileLen  = longestFileEntry?.[1] ?? 0;
  dl.append('dt').text('Longest file');
  dl.append('dd').text(`${longestFileName} (${longestFileLen} lines)`);

  // Average file length
  const avgFileLength = d3.mean(fileLengths, d => d[1]);
  dl.append('dt').text('Avg file length');
  dl.append('dd').text(
    Number.isFinite(avgFileLength) ? Math.round(avgFileLength) : 'n/a'
  );

  // Most active period
  const workByPeriod = d3.rollups(
    data,
    v => v.length,
    d => {
      const dt = d.datetime instanceof Date ? d.datetime : new Date(d.datetime);
      return dt.toLocaleString('en', { dayPeriod: 'short' });
    }
  );
  const maxPeriod = d3.greatest(workByPeriod, d => d[1])?.[0] ?? 'n/a';
  dl.append('dt').text('Most active period');
  dl.append('dd').text(maxPeriod);

  // 🔹 Group each (dt, dd) pair into a .stat tile
  const dlNode = dl.node();
  const children = Array.from(dlNode.children); // dt, dd, dt, dd, ...

  dlNode.innerHTML = '';

  for (let i = 0; i < children.length; i += 2) {
    const tile = document.createElement('div');
    tile.className = 'stat';

    if (children[i]) tile.appendChild(children[i]);       // dt
    if (children[i + 1]) tile.appendChild(children[i+1]); // dd

    dlNode.appendChild(tile);
  }
}

let data = await loadData();

let commits = processCommits(data);

commits = d3.sort(commits, d => d.datetime);



renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

// const dl = document.querySelector('#stats dl.stats');
// if (dl) {
//   const nodes = Array.from(dl.children);
//   dl.innerHTML = '';
//   for (let i = 0; i < nodes.length; i += 2) {
//     const tile = document.createElement('div');
//     tile.className = 'stat';
//     if (nodes[i]) tile.appendChild(nodes[i]);
//     if (nodes[i+1]) tile.appendChild(nodes[i+1]);
//     dl.appendChild(tile);
//   }
// }

function renderScatterPlot(data, commits) {
  // Put all the JS code of Steps inside this function
  
  const width = 1000;
const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
  top: margin.top,
  right: width - margin.right,
  bottom: height - margin.bottom,
  left: margin.left,
  width: width - margin.left - margin.right,
  height: height - margin.top - margin.bottom,
};
const svg = d3
  .select('#chart')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');


xScale = d3.scaleTime()
  .domain(d3.extent(commits, d => d.datetime))
  .range([usableArea.left, usableArea.right])
  .nice();

yScale = d3.scaleLinear()
  .domain([0, 24])
  .range([usableArea.bottom, usableArea.top]);

const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));


const xAxis = d3.axisBottom(xScale);
const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');


// Add X axis
svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .attr('class', 'x-axis') // new line to mark the g tag
    .call(xAxis);

  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .attr('class', 'y-axis') // just for consistency
    .call(yAxis);



const dots = svg.append('g').attr('class', 'dots');
const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
const rScale = d3
  .scaleSqrt() // Change only this line
  .domain([minLines, maxLines])
  .range([3, 22]);
const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

dots
  .selectAll('circle')
  .data(sortedCommits, (d) => d.id)
  .join('circle')
  .attr('cx', (d) => xScale(d.datetime))
  .attr('cy', (d) => yScale(d.hourFrac))
  .attr('r', (d) => rScale(d.totalLines))
  .attr('fill', 'steelblue')
  .style('fill-opacity', 0.7)
  .on('mouseenter', (event, commit) => {
    d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
    renderTooltipContent(commit);
    updateTooltipVisibility(true);
    updateTooltipPosition(event);
  })
  .on('mouseleave', (event) => {
    d3.select(event.currentTarget).style('fill-opacity', 0.7);
    updateTooltipVisibility(false);
  });;

  // function isCommitSelected(selection, commit) {
  // if (!selection) {
  //   return false;
  // }
  // const [[x0, y0], [x1, y1]] = selection;       
  // const x = xScale(commit.datetime);            
  // const y = yScale(commit.hourFrac);
  // return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  // }

  function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
    }



createBrushSelector(svg);
function createBrushSelector(svg) {
  svg.call(d3.brush());
}



function brushed(event) {
    
  console.log(event);
  const selection = event.selection;
  d3.selectAll('circle').classed('selected', (d) =>
    isCommitSelected(selection, d),
  );
  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

// function renderLanguageBreakdown(selection) {
//   const selectedCommits = selection
//     ? commits.filter((d) => isCommitSelected(selection, d))
//     : [];

//   const container = document.getElementById('language-breakdown');

//   // If some commits are selected, use them; otherwise, use all commits
//   const requiredCommits = selectedCommits.length ? selectedCommits : commits;

//   // If there is truly no data, clear and stop (edge case)
//   if (!requiredCommits.length) {
//     container.innerHTML = '';
//     return;
//   }

//   const lines = requiredCommits.flatMap((d) => d.lines);

//   const breakdown = d3.rollup(
//     lines,
//     v => v.length,
//     d => d.type,
//   );

//   container.innerHTML = '';

//   for (const [language, count] of breakdown) {
//     const proportion = count / lines.length;
//     const formatted = d3.format('.1~%')(proportion);

//     container.innerHTML += `
//       <dt>${language}</dt>
//       <dd>${count} lines (${formatted})</dd>
//     `;
//   }
// }



function isCommitSelected(selection, commit) {
  if (!selection) {
    return false;
  }
  // TODO: return true if commit is within brushSelection
  // and false if not
  const [x0, x1] = selection.map((d) => d[0]);
const [y0, y1] = selection.map((d) => d[1]);

const x = xScale(commit.datetime);
const y = yScale(commit.hourFrac);

return x >= x0 && x <= x1 && y >= y0 && y <= y1;
  
}


function renderLanguageBreakdown(selection) {
  if (!selection) {
    container.innerHTML = '';
    return;
  }
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

if (!selectedCommits.length) {
    container.innerHTML = '';
    return;
  }

  const container = document.getElementById('language-breakdown');

  // If some commits are selected, use them; otherwise show all commits
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;

  if (!requiredCommits.length) {
    container.innerHTML = '';
    return;
  }

  const lines = requiredCommits.flatMap((d) => d.lines);

  const breakdown = d3.rollup(
    lines,
    v => v.length,
    d => d.type,
  );

  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}


svg.call(d3.brush().on('start brush end', brushed));


  svg.selectAll('.dots, .overlay ~ *').raise();

  

// Raise dots and everything after overlay




// Update scales with new ranges
xScale.range([usableArea.left, usableArea.right]);
yScale.range([usableArea.bottom, usableArea.top]);



// Create gridlines as an axis with no labels and full-width ticks





}






function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');


  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.datetime?.toLocaleTimeString('en', {
    timeStyle: 'short',
  });

  author.textContent = commit.author || 'Unknown';
  lines.textContent = commit.totalLines ?? 'N/A';
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}



function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}







let commitProgress = 100;

let timeScale = d3
  .scaleTime()
  .domain([
    d3.min(commits, (d) => d.datetime),
    d3.max(commits, (d) => d.datetime),
  ])
  .range([0, 100]);
let commitMaxTime = timeScale.invert(commitProgress);

let filteredCommits = commits;

// renderLanguageBreakdown(null);

updateFileDisplay(filteredCommits);

function updateScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3.select('#chart').select('svg');

  xScale = xScale.domain(d3.extent(commits, (d) => d.datetime));

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const xAxis = d3.axisBottom(xScale);

  // CHANGE: we should clear out the existing xAxis and then create a new one.
  const xAxisGroup = svg.select('g.x-axis');
  xAxisGroup.selectAll('*').remove();
  xAxisGroup.call(xAxis);

  const dots = svg.select('g.dots');

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id) 
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });
}


function onTimeSliderChange() {

  const slider = document.getElementById("commit-progress");


  commitProgress = +slider.value;


  commitMaxTime = timeScale.invert(commitProgress);


  const timeEl = document.getElementById("commit-time");
  timeEl.textContent = commitMaxTime.toLocaleString("en", {
    dateStyle: "long",
    timeStyle: "short",
  });
   filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
   updateScatterPlot(data, filteredCommits);
   updateFileDisplay(filteredCommits);
}




document
  .getElementById("commit-progress")
  .addEventListener("input", onTimeSliderChange);


onTimeSliderChange();

// let lines = filteredCommits.flatMap((d) => d.lines);
// let files = d3
//   .groups(lines, (d) => d.file)
//   .map(([name, lines]) => {
//     return { name, lines };
//   });

function updateFileDisplay(filteredCommits) {

  let lines = filteredCommits.flatMap((d) => d.lines);

  let files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => {
      return { name, lines };
    });

  

  let filesContainer = d3
    .select('#files')
    .selectAll('div')
    .data(files, (d) => d.name)
    .join(

      (enter) =>
        enter.append('div').call((div) => {
          div.append('dt').append('code');
          div.append('dd');
        }),
    );


  filesContainer.select('dt > code').text((d) => d.name);
  filesContainer
  .select('dd')
  .selectAll('div.loc')
  .data((d) => d.lines)
  .join('div')
  .attr('class', 'loc')
  .style('--color', (d) => colors(d.type));
}

// let filesContainer = d3
//   .select('#files')
//   .selectAll('div')
//   .data(files, (d) => d.name)
//   .join(
//     // This code only runs when the div is initially rendered
//     (enter) =>
//       enter.append('div').call((div) => {
//         div.append('dt').append('code');
//         div.append('dd');
//       }),
//   );

// // This code updates the div info
// filesContainer.select('dt > code').text((d) => d.name);
// filesContainer.select('dd').text((d) => `${d.lines.length} lines`);


d3.select('#scatter-story')
  .selectAll('.step')
  .data(commits)
  .join('div')
  .attr('class', 'step')
  .html(
    (d, i) => `
		On ${d.datetime.toLocaleString('en', {
      dateStyle: 'full',
      timeStyle: 'short',
    })},
		I made <a href="${d.url}" target="_blank">${
      i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'
    }</a>.
		I edited ${d.totalLines} lines across ${
      d3.rollups(
        d.lines,
        (D) => D.length,
        (d) => d.file,
      ).length
    } files.
		Then I looked over all I had made, and I saw that it was very good.
	`,
  );


function onStepEnter(response) {
  const commit = response.element.__data__;
  const cutoff = commit.datetime;

  // Filter commits up to this commit's time
  const filtered = commits.filter(d => d.datetime <= cutoff);

  // Keep the slider in sync (optional but nice)
  commitProgress = timeScale(cutoff);
  document.getElementById("commit-progress").value = commitProgress;

  const timeEl = document.getElementById("commit-time");
  timeEl.textContent = cutoff.toLocaleString("en", {
    dateStyle: "long",
    timeStyle: "short",
  });

  // Reuse the same helpers as the slider
  updateScatterPlot(data, filtered);
  updateFileDisplay(filtered);
}


const scroller = scrollama();
scroller
  .setup({
    container: '#scrolly-1',
    step: '#scrolly-1 .step',
  })
  .onStepEnter(onStepEnter);