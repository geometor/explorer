export function initGroupsView() {
    fetchGroupsBySize();
    fetchGroupsByPoint();
    fetchGroupsByChain();
}

async function fetchGroupsBySize() {
    try {
        const response = await fetch('/api/groups/by_size');
        const data = await response.json();
        populateSizesTable(data);
    } catch (error) {
        console.error('Error fetching groups by size:', error);
    }
}

async function fetchGroupsByPoint() {
    try {
        const response = await fetch('/api/groups/by_point');
        const data = await response.json();
        populatePointsGroupTable(data);
    } catch (error) {
        console.error('Error fetching groups by point:', error);
    }
}

async function fetchGroupsByChain() {
    try {
        const response = await fetch('/api/groups/by_chain');
        const data = await response.json();
        populateChainsTable(data);
    } catch (error) {
        console.error('Error fetching groups by chain:', error);
    }
}

function populateSizesTable(data) {
    const tableBody = document.getElementById('sizes-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    const sizes = Object.keys(data).sort((a, b) => data[b].length - data[a].length);

    for (const size of sizes) {
        const sections = data[size];
        const row = tableBody.insertRow();
        row.dataset.sections = JSON.stringify(sections);
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.textContent = parseFloat(size).toFixed(4);
        cell2.textContent = sections.length;
    }
    document.getElementById('sizes-count').textContent = `(${sizes.length})`;
}

function populatePointsGroupTable(data) {
    const tableBody = document.getElementById('points-group-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    const points = Object.keys(data).sort((a, b) => data[b].length - data[a].length);

    for (const pointId of points) {
        const sections = data[pointId];
        const row = tableBody.insertRow();
        row.dataset.sections = JSON.stringify(sections);
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.textContent = pointId;
        cell2.textContent = sections.length;
    }
    document.getElementById('points-group-count').textContent = `(${points.length})`;
}

function populateChainsTable(data) {
    const tableBody = document.getElementById('chains-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    const chains = data.sort((a, b) => b.sections.length - a.sections.length);

    chains.forEach((chain, index) => {
        const row = tableBody.insertRow();
        row.dataset.sections = JSON.stringify(chain.sections);
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.textContent = chain.name;
        cell2.textContent = chain.sections.length;
    });
    document.getElementById('chains-count').textContent = `(${chains.length})`;
}

export function initGroupsEventListeners() {
    const groupTables = ['sizes-table', 'points-group-table', 'chains-table'];

    groupTables.forEach(tableId => {
        const table = document.getElementById(tableId);
        if (table) {
            table.addEventListener('mouseover', (event) => {
                const row = event.target.closest('tr');
                if (row && row.dataset.sections) {
                    const sections = JSON.parse(row.dataset.sections);
                    sections.forEach(id => GEOMETOR.setElementHover(id, true));
                }
            });

            table.addEventListener('mouseout', (event) => {
                const row = event.target.closest('tr');
                if (row && row.dataset.sections) {
                    const sections = JSON.parse(row.dataset.sections);
                    sections.forEach(id => GEOMETOR.setElementHover(id, false));
                }
            });
        }
    });
}

