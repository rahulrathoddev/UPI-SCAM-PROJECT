let allReports = [];

let currentPage = 1;

const reportsPerPage = 5;

let currentUser = null;

let statusChart = null;

let categoryChart = null;


// ==========================================
// ELEMENTS
// ==========================================

const loginPage =
    document.getElementById("loginPage");

const registerPage =
    document.getElementById("registerPage");

const appPage =
    document.getElementById("appPage");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const reportForm =
    document.getElementById("reportForm");

const reportsContainer =
    document.getElementById("reportsContainer");

const message =
    document.getElementById("message");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const fromDate =
    document.getElementById("fromDate");

const toDate =
    document.getElementById("toDate");

const sortSelect =
    document.getElementById("sortSelect");

const pagination =
    document.getElementById("pagination");

const reportModal =
    document.getElementById("reportModal");

const closeModal =
    document.getElementById("closeModal");


// ==========================================
// CHECK LOGIN
// ==========================================

async function checkLogin() {

    try {

        const response =
            await fetch("/api/me");

        const data =
            await response.json();


        if (data.loggedIn) {

            currentUser =
                data.user;

            showApp();

        } else {

            showLogin();

        }

    } catch (error) {

        console.error(error);

    }

}


function showApp() {

    loginPage.classList.add("hidden");

    registerPage.classList.add("hidden");

    appPage.classList.remove("hidden");


    document.getElementById(
        "currentUser"
    ).textContent =
        currentUser.name;


    document.getElementById(
        "roleBadge"
    ).textContent =
        currentUser.role.toUpperCase();


    loadReports();

    loadDashboard();

}


function showLogin() {

    loginPage.classList.remove("hidden");

    registerPage.classList.add("hidden");

    appPage.classList.add("hidden");

}


function showRegister() {

    loginPage.classList.add("hidden");

    registerPage.classList.remove("hidden");

}


checkLogin();


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document.getElementById(
                "loginEmail"
            ).value;


        const password =
            document.getElementById(
                "loginPassword"
            ).value;


        try {

            const response =
                await fetch(
                    "/api/login",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error
                );

            }


            currentUser =
                data.user;


            showApp();


        } catch (error) {

            document.getElementById(
                "authMessage"
            ).innerHTML = `

                <div class="error">
                    ${escapeHTML(error.message)}
                </div>

            `;

        }

    }
);


// ==========================================
// REGISTER
// ==========================================

registerForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "registerName"
            ).value;


        const email =
            document.getElementById(
                "registerEmail"
            ).value;


        const password =
            document.getElementById(
                "registerPassword"
            ).value;


        try {

            const response =
                await fetch(
                    "/api/register",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name,
                            email,
                            password
                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error
                );

            }


            document.getElementById(
                "registerMessage"
            ).innerHTML = `

                <div class="success">
                    Registration successful.
                    You can now login.
                </div>

            `;


            registerForm.reset();


            setTimeout(
                showLogin,
                1500
            );


        } catch (error) {

            document.getElementById(
                "registerMessage"
            ).innerHTML = `

                <div class="error">
                    ${escapeHTML(error.message)}
                </div>

            `;

        }

    }
);


// ==========================================
// LOGOUT
// ==========================================

document.getElementById(
    "logoutButton"
).addEventListener(
    "click",
    async function() {

        await fetch(
            "/api/logout",
            {
                method: "POST"
            }
        );


        currentUser = null;

        showLogin();

    }
);


// ==========================================
// LOAD REPORTS
// ==========================================

async function loadReports() {

    try {

        const response =
            await fetch(
                "/api/reports"
            );


        if (response.status === 401) {

            showLogin();

            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error
            );

        }


        allReports = data;


        currentPage = 1;


        applyFilters();


        updateCharts();


    } catch (error) {

        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// CREATE REPORT
// ==========================================

reportForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const reportId =
            document.getElementById(
                "reportId"
            ).value;


        const formData =
            new FormData();


        formData.append(
            "reporter_name",
            document.getElementById(
                "reporterName"
            ).value
        );


        formData.append(
            "contact",
            document.getElementById(
                "contact"
            ).value
        );


        formData.append(
            "incident_date",
            document.getElementById(
                "incidentDate"
            ).value
        );


        formData.append(
            "transaction_id",
            document.getElementById(
                "transactionId"
            ).value
        );


        formData.append(
            "amount",
            document.getElementById(
                "amount"
            ).value
        );


        formData.append(
            "incident_type",
            document.getElementById(
                "incidentType"
            ).value
        );


        formData.append(
            "description",
            document.getElementById(
                "description"
            ).value
        );


        formData.append(
            "additional_info",
            document.getElementById(
                "additionalInfo"
            ).value
        );


        const evidence =
            document.getElementById(
                "evidence"
            ).files[0];


        if (evidence && !reportId) {

            formData.append(
                "evidence",
                evidence
            );

        }


        try {

            let response;


            if (reportId) {

                const reportData = {

                    reporter_name:
                        document.getElementById(
                            "reporterName"
                        ).value,

                    contact:
                        document.getElementById(
                            "contact"
                        ).value,

                    incident_date:
                        document.getElementById(
                            "incidentDate"
                        ).value,

                    transaction_id:
                        document.getElementById(
                            "transactionId"
                        ).value,

                    amount:
                        document.getElementById(
                            "amount"
                        ).value,

                    incident_type:
                        document.getElementById(
                            "incidentType"
                        ).value,

                    description:
                        document.getElementById(
                            "description"
                        ).value,

                    additional_info:
                        document.getElementById(
                            "additionalInfo"
                        ).value,

                    status:
                        document.getElementById(
                            "reportStatus"
                        ).value

                };


                response =
                    await fetch(
                        `/api/reports/${reportId}`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    reportData
                                )

                        }
                    );

            } else {

                response =
                    await fetch(
                        "/api/reports",
                        {

                            method: "POST",

                            body: formData

                        }
                    );

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error
                );

            }


            showMessage(
                reportId
                    ? "Report updated successfully!"
                    : "Report submitted successfully!",
                "success"
            );


            resetForm();

            await loadReports();

            await loadDashboard();


        } catch (error) {

            showMessage(
                error.message,
                "error"
            );

        }

    }
);


// ==========================================
// VIEW REPORT
// ==========================================

async function viewReport(id) {

    try {

        const response =
            await fetch(
                `/api/reports/${id}`
            );


        const report =
            await response.json();


        if (!response.ok) {

            throw new Error(
                report.error
            );

        }


        let evidenceHTML = "";


        if (report.evidence_path) {

            evidenceHTML = `

                <div class="detail-row">

                    <strong>Evidence:</strong>

                    <br>

                    <a
                        href="${report.evidence_path}"
                        target="_blank"
                        class="evidence-link"
                    >
                        📎 ${escapeHTML(
                            report.evidence_name
                        )}
                    </a>

                </div>

            `;

        }


        document.getElementById(
            "reportDetails"
        ).innerHTML = `

            <h2>
                Report #${report.id}
            </h2>

            <br>


            <div class="detail-row">
                <strong>Reporter:</strong>
                ${escapeHTML(
                    report.reporter_name
                )}
            </div>


            <div class="detail-row">
                <strong>Contact:</strong>
                ${escapeHTML(
                    report.contact
                )}
            </div>


            <div class="detail-row">
                <strong>Incident Date:</strong>
                ${report.incident_date}
            </div>


            <div class="detail-row">
                <strong>Transaction ID:</strong>
                ${escapeHTML(
                    report.transaction_id ||
                    "Not provided"
                )}
            </div>


            <div class="detail-row">
                <strong>Amount:</strong>
                ₹${Number(
                    report.amount
                ).toFixed(2)}
            </div>


            <div class="detail-row">
                <strong>Category:</strong>
                ${escapeHTML(
                    report.incident_type
                )}
            </div>


            <div class="detail-row">
                <strong>Description:</strong>
                ${escapeHTML(
                    report.description
                )}
            </div>


            <div class="detail-row">
                <strong>Additional Information:</strong>
                ${escapeHTML(
                    report.additional_info ||
                    "None"
                )}
            </div>


            <div class="detail-row">
                <strong>Status:</strong>
                ${escapeHTML(
                    report.status
                )}
            </div>


            ${evidenceHTML}

        `;


        reportModal.style.display =
            "flex";


    } catch (error) {

        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// EDIT REPORT
// ==========================================

async function editReport(id) {

    try {

        const response =
            await fetch(
                `/api/reports/${id}`
            );


        const report =
            await response.json();


        if (!response.ok) {

            throw new Error(
                report.error
            );

        }


        document.getElementById(
            "reportId"
        ).value = report.id;


        document.getElementById(
            "reporterName"
        ).value =
            report.reporter_name;


        document.getElementById(
            "contact"
        ).value =
            report.contact;


        document.getElementById(
            "incidentDate"
        ).value =
            report.incident_date;


        document.getElementById(
            "transactionId"
        ).value =
            report.transaction_id || "";


        document.getElementById(
            "amount"
        ).value =
            report.amount;


        document.getElementById(
            "incidentType"
        ).value =
            report.incident_type;


        document.getElementById(
            "description"
        ).value =
            report.description;


        document.getElementById(
            "additionalInfo"
        ).value =
            report.additional_info || "";


        document.getElementById(
            "reportStatus"
        ).value =
            report.status;


        document.getElementById(
            "statusGroup"
        ).classList.remove(
            "hidden"
        );


        document.getElementById(
            "cancelEdit"
        ).classList.remove(
            "hidden"
        );


        reportForm.scrollIntoView({
            behavior: "smooth"
        });


    } catch (error) {

        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// DELETE REPORT
// ==========================================

async function deleteReport(id) {

    if (
        !confirm(
            "Are you sure you want to delete this report?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/reports/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error
            );

        }


        showMessage(
            "Report deleted successfully!",
            "success"
        );


        await loadReports();

        await loadDashboard();


    } catch (error) {

        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// FILTERING
// ==========================================

searchInput.addEventListener(
    "input",
    applyFilters
);

statusFilter.addEventListener(
    "change",
    applyFilters
);

categoryFilter.addEventListener(
    "change",
    applyFilters
);

fromDate.addEventListener(
    "change",
    applyFilters
);

toDate.addEventListener(
    "change",
    applyFilters
);

sortSelect.addEventListener(
    "change",
    applyFilters
);


function applyFilters() {

    const search =
        searchInput.value.toLowerCase();


    const status =
        statusFilter.value;


    const category =
        categoryFilter.value;


    const from =
        fromDate.value;


    const to =
        toDate.value;


    const sort =
        sortSelect.value;


    let filtered =
        allReports.filter(report => {


            const searchableText = `

                ${report.reporter_name}

                ${report.contact}

                ${report.transaction_id}

                ${report.incident_type}

                ${report.description}

            `.toLowerCase();


            const matchesSearch =
                searchableText.includes(
                    search
                );


            const matchesStatus =
                status === "all" ||
                report.status === status;


            const matchesCategory =
                category === "all" ||
                report.incident_type === category;


            const matchesFrom =
                !from ||
                report.incident_date >= from;


            const matchesTo =
                !to ||
                report.incident_date <= to;


            return (

                matchesSearch &&

                matchesStatus &&

                matchesCategory &&

                matchesFrom &&

                matchesTo

            );

        });


    // SORT

    filtered.sort(
        (a, b) => {

            if (sort === "newest") {

                return (
                    new Date(b.incident_date) -
                    new Date(a.incident_date)
                );

            }


            if (sort === "oldest") {

                return (
                    new Date(a.incident_date) -
                    new Date(b.incident_date)
                );

            }


            if (sort === "amountHigh") {

                return (
                    Number(b.amount) -
                    Number(a.amount)
                );

            }


            if (sort === "amountLow") {

                return (
                    Number(a.amount) -
                    Number(b.amount)
                );

            }


            return 0;

        }
    );


    currentPage = 1;


    displayPaginatedReports(
        filtered
    );

}


// ==========================================
// PAGINATION
// ==========================================

function displayPaginatedReports(
    reports
) {

    const totalPages =
        Math.ceil(
            reports.length /
            reportsPerPage
        );


    if (
        currentPage > totalPages &&
        totalPages > 0
    ) {

        currentPage =
            totalPages;

    }


    const start =
        (currentPage - 1) *
        reportsPerPage;


    const end =
        start +
        reportsPerPage;


    const pageReports =
        reports.slice(
            start,
            end
        );


    displayReports(
        pageReports
    );


    createPagination(
        totalPages
    );

}


function createPagination(
    totalPages
) {

    pagination.innerHTML = "";


    if (totalPages <= 1) {

        return;

    }


    const previous =
        document.createElement(
            "button"
        );


    previous.textContent =
        "Previous";


    previous.disabled =
        currentPage === 1;


    previous.onclick =
        function() {

            currentPage--;

            refreshCurrentFilter();

        };


    pagination.appendChild(
        previous
    );


    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.textContent = i;


        if (i === currentPage) {

            button.classList.add(
                "active"
            );

        }


        button.onclick =
            function() {

                currentPage = i;

                refreshCurrentFilter();

            };


        pagination.appendChild(
            button
        );

    }


    const next =
        document.createElement(
            "button"
        );


    next.textContent =
        "Next";


    next.disabled =
        currentPage === totalPages;


    next.onclick =
        function() {

            currentPage++;

            refreshCurrentFilter();

        };


    pagination.appendChild(
        next
    );

}


function refreshCurrentFilter() {

    const search =
        searchInput.value.toLowerCase();


    const status =
        statusFilter.value;


    const category =
        categoryFilter.value;


    const from =
        fromDate.value;


    const to =
        toDate.value;


    let filtered =
        allReports.filter(report => {


            const text = `

                ${report.reporter_name}

                ${report.contact}

                ${report.transaction_id}

                ${report.incident_type}

                ${report.description}

            `.toLowerCase();


            return (

                text.includes(search) &&

                (
                    status === "all" ||
                    report.status === status
                ) &&

                (
                    category === "all" ||
                    report.incident_type === category
                ) &&

                (
                    !from ||
                    report.incident_date >= from
                ) &&

                (
                    !to ||
                    report.incident_date <= to
                )

            );

        });


    const sort =
        sortSelect.value;


    filtered.sort(
        (a, b) => {

            if (sort === "newest")
                return new Date(b.incident_date)
                    - new Date(a.incident_date);

            if (sort === "oldest")
                return new Date(a.incident_date)
                    - new Date(b.incident_date);

            if (sort === "amountHigh")
                return Number(b.amount)
                    - Number(a.amount);

            if (sort === "amountLow")
                return Number(a.amount)
                    - Number(b.amount);

            return 0;

        }
    );


    displayPaginatedReports(
        filtered
    );

}


// ==========================================
// DISPLAY REPORTS
// ==========================================

function displayReports(
    reports
) {

    reportsContainer.innerHTML = "";


    if (reports.length === 0) {

        reportsContainer.innerHTML = `

            <p>
                No reports found.
            </p>

        `;

        return;

    }


    reports.forEach(
        report => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "report-card";


            let evidenceHTML = "";


            if (report.evidence_path) {

                evidenceHTML = `

                    <a
                        href="${report.evidence_path}"
                        target="_blank"
                        class="evidence-link"
                    >
                        📎 View Evidence
                    </a>

                `;

            }


            card.innerHTML = `

                <div class="report-header">

                    <h3>
                        Report #${report.id}
                    </h3>

                    <span class="status">
                        ${escapeHTML(
                            report.status
                        )}
                    </span>

                </div>


                <p class="report-info">

                    <strong>
                        Reporter:
                    </strong>

                    ${escapeHTML(
                        report.reporter_name
                    )}

                </p>


                <p class="report-info">

                    <strong>
                        Category:
                    </strong>

                    ${escapeHTML(
                        report.incident_type
                    )}

                </p>


                <p class="report-info">

                    <strong>
                        Amount:
                    </strong>

                    ₹${Number(
                        report.amount
                    ).toFixed(2)}

                </p>


                <p class="report-info">

                    <strong>
                        Date:
                    </strong>

                    ${report.incident_date}

                </p>


                ${evidenceHTML}


                <div class="action-buttons">

                    <button
                        class="view-btn"
                        onclick="viewReport(${report.id})"
                    >
                        View
                    </button>


                    <button
                        class="edit-btn"
                        onclick="editReport(${report.id})"
                    >
                        Edit
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteReport(${report.id})"
                    >
                        Delete
                    </button>

                </div>

            `;


            reportsContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const response =
            await fetch(
                "/api/dashboard"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error
            );

        }


        document.getElementById(
            "totalReports"
        ).textContent =
            data.total;


        document.getElementById(
            "newReports"
        ).textContent =
            data.newReports;


        document.getElementById(
            "reviewReports"
        ).textContent =
            data.underReview;


        document.getElementById(
            "resolvedReports"
        ).textContent =
            data.resolved;


        document.getElementById(
            "totalAmount"
        ).textContent =
            "₹" +
            Number(
                data.totalAmount
            ).toLocaleString(
                "en-IN"
            );


    } catch (error) {

        console.error(error);

    }

}


// ==========================================
// CHARTS
// ==========================================

function updateCharts() {

    const statusCounts = {

        New: 0,

        "Under Review": 0,

        Resolved: 0,

        Rejected: 0

    };


    const categoryCounts = {};


    allReports.forEach(
        report => {

            if (
                statusCounts[
                    report.status
                ] !== undefined
            ) {

                statusCounts[
                    report.status
                ]++;

            }


            if (
                !categoryCounts[
                    report.incident_type
                ]
            ) {

                categoryCounts[
                    report.incident_type
                ] = 0;

            }


            categoryCounts[
                report.incident_type
            ]++;

        }
    );


    if (statusChart) {

        statusChart.destroy();

    }


    if (categoryChart) {

        categoryChart.destroy();

    }


    statusChart =
        new Chart(
            document.getElementById(
                "statusChart"
            ),
            {

                type: "doughnut",

                data: {

                    labels:
                        Object.keys(
                            statusCounts
                        ),

                    datasets: [

                        {

                            data:
                                Object.values(
                                    statusCounts
                                )

                        }

                    ]

                }

            }
        );


    categoryChart =
        new Chart(
            document.getElementById(
                "categoryChart"
            ),
            {

                type: "bar",

                data: {

                    labels:
                        Object.keys(
                            categoryCounts
                        ),

                    datasets: [

                        {

                            label:
                                "Reports",

                            data:
                                Object.values(
                                    categoryCounts
                                )

                        }

                    ]

                },

                options: {

                    responsive: true,

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }
        );

}


// ==========================================
// EXPORT
// ==========================================

document.getElementById(
    "exportButton"
).addEventListener(
    "click",
    function() {

        window.location.href =
            "/api/export";

    }
);


// ==========================================
// RESET FORM
// ==========================================

document.getElementById(
    "cancelEdit"
).addEventListener(
    "click",
    resetForm
);


function resetForm() {

    reportForm.reset();


    document.getElementById(
        "reportId"
    ).value = "";


    document.getElementById(
        "statusGroup"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "cancelEdit"
    ).classList.add(
        "hidden"
    );

}


// ==========================================
// MODAL
// ==========================================

closeModal.addEventListener(
    "click",
    function() {

        reportModal.style.display =
            "none";

    }
);


window.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            reportModal
        ) {

            reportModal.style.display =
                "none";

        }

    }
);


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    message.innerHTML = `

        <div class="${type}">
            ${escapeHTML(text)}
        </div>

    `;


    setTimeout(
        function() {

            message.innerHTML = "";

        },
        4000
    );

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}