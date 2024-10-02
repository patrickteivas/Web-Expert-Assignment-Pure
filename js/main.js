;(function () {
    'use strict';

    const mapKeyToLabel = {
        id: '#',
        name: 'Name',
        username: 'Username',
        email: 'Email',
        address: 'Address',
        phone: 'Phone',
        website: 'Website',
    };

    const mapCompanyKeyToLabel = {
        name: 'Name',
        catchPhrase: 'Catch Phrase',
        bs: 'Bs',
    };

    let users = null;
    let modalUser = null;

    const userApi = 'https://jsonplaceholder.typicode.com/';
    const usersEndpoint = '/users';

    let searchEl = null;
    let tableEl = null;
    let userModalEl = null;
    let userModal = null;
    let userModalHeaderEl = null;
    let userModalTableEl = null;
    let userModalCompanyTableEl = null;

    const getHtmlByKeyValue = (key, value) => {
        if (key === 'website') {
            return `<a href="https://${value}" target="_blank">${value}</a>`;
        }

        if (key === 'email') {
            return `<a href="mailto:${value}">${value}</a>`;
        }

        if (key === 'phone') {
            return `<a href="tel:${value}">${value}</a>`;
        }

        if (key === 'address') {
            const { street, suite, city, zipcode, geo } = value;
            const { lat, lng } = geo;

            const addressLine = `${street} ${suite}, ${city}, ${zipcode}`;
            const googleMapsUrl = new URL('https://maps.google.com/');
            googleMapsUrl.searchParams.set('q', `${lat},${lng}`);

            return `<span>${addressLine}</span> (<a href="${googleMapsUrl.href}" target="_blank" rel="noreferrer">Google Maps</a>)`;
        }

        return value;
    };

    const createUserModalTable = (targetEl, entries) => {
        for (const entry of entries) {
            const { key, value, name } = entry;
            const trEl = document.createElement('tr');

            const thEl = document.createElement('th');
            thEl.scope = 'row';
            thEl.textContent = name || key;
            trEl.appendChild(thEl);

            const tdEl = document.createElement('td');
            tdEl.innerHTML = getHtmlByKeyValue(key, value);
            trEl.appendChild(tdEl);

            targetEl.appendChild(trEl);
        }
    }

    const applyUserToModal = () => {
        if (!modalUser || !userModalHeaderEl || !userModalTableEl || !userModalCompanyTableEl) {
            return;
        }

        const { company, name, ...baseInfo } = modalUser;

        userModalHeaderEl.textContent = name;

        createUserModalTable(userModalTableEl, Object.entries(baseInfo).map(([key, value]) => ({
            name: mapKeyToLabel[key],
            key,
            value
        })));
        createUserModalTable(userModalCompanyTableEl, Object.entries(company).map(([key, value]) => ({
            name: mapCompanyKeyToLabel[key],
            key,
            value
        })));
    }

    const openModalForUserId = (userId) => {
        fetch(`${userApi}${usersEndpoint}/${userId}`)
            .then((response) => response.json())
            .then((data) => {
                modalUser = data;
                userModal.show();
                applyUserToModal();
            })
            .catch((error) => console.log(error));
    }

    const applyUsersToTable = () => {
        if (document.readyState !== "complete" || !users || !users.length || !tableEl) {
            return;
        }

        for (const user of users) {
            const trEl = document.createElement('tr');

            const thEl = document.createElement('th');
            thEl.scope = 'row';
            thEl.textContent = user.id;
            trEl.appendChild(thEl);

            // Name
            const tdNameEl = document.createElement('td');
            const buttonEl = document.createElement('button');
            buttonEl.className = 'btn btn-link';
            buttonEl.setAttribute('data-users-field', 'name');
            buttonEl.type = 'button';
            buttonEl.addEventListener('click', () => {
                openModalForUserId(user.id);
            });
            buttonEl.textContent = user.name;
            tdNameEl.appendChild(buttonEl);
            trEl.appendChild(tdNameEl);

            const userDataToShow = {
                username: user.username,
                email: user.email,
                website: user.website,
                companyName: user.company.name,
            }

            for (const [key, value] of Object.entries(userDataToShow)) {
                const tdEl = document.createElement('td');
                tdEl.className = 'd-none d-lg-table-cell';
                tdEl.innerHTML = getHtmlByKeyValue(key, value);
                trEl.appendChild(tdEl);
            }

            tableEl.appendChild(trEl);
        }
    }

    fetch(`${userApi}${usersEndpoint}`)
        .then((response) => response.json())
        .then((data) => {
            users = data;
            applyUsersToTable();
        })
        .catch((error) => console.log(error));

    window.addEventListener('load', () => {
        searchEl = document.querySelector('#search');
        tableEl = document.querySelector('#usersTable');
        userModalEl = document.querySelector('#userModal')
        userModal = new bootstrap.Modal(userModalEl);
        userModalHeaderEl = userModalEl.querySelector('#userModalHeader');
        userModalTableEl = userModalEl.querySelector('#userModalTable');
        userModalCompanyTableEl = userModalEl.querySelector('#userModalCompanyTable');

        const hiddenListener = () => {
            userModalHeaderEl.textContent = '';
            userModalTableEl.innerHTML = '';
            userModalCompanyTableEl.innerHTML = '';
            modalUser = null;
        };

        const showUsersBasedOnSearch = (e) => {
            const search = e.target.value;
            const normalizedSearch = search.toLowerCase().trim();

            const rows = tableEl.querySelectorAll('tr');

            for (const row of rows) {
                const name = row.querySelector('[data-users-field="name"]').textContent;

                row.hidden = !name.toLowerCase().includes(normalizedSearch);
            }
        };

        userModalEl.addEventListener('hidden.bs.modal', hiddenListener);
        searchEl.addEventListener('input', showUsersBasedOnSearch);

        applyUsersToTable();
    });
}());