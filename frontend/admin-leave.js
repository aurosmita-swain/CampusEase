document.addEventListener("DOMContentLoaded", function () {

    const leaveList =
        document.getElementById("leaveRequestList");

    const totalLeaveRequests =
        document.getElementById("totalLeaveRequests");

    const pendingLeaveRequests =
        document.getElementById("pendingLeaveRequests");

    const approvedLeaveRequests =
        document.getElementById("approvedLeaveRequests");

    const rejectedLeaveRequests =
        document.getElementById("rejectedLeaveRequests");


    // ==========================================
    // LOAD ALL LEAVE REQUESTS
    // ==========================================

    async function loadLeaveRequests() {

        if (!leaveList) {
            return;
        }

        try {

            const response = await fetch(
                "http://localhost:5000/api/leave"
            );


            const text = await response.text();

            console.log(
                "Leave API Status:",
                response.status
            );

            console.log(
                "Leave API Response:",
                text
            );


            let data;

            try {

                data = JSON.parse(text);

            } catch (jsonError) {

                throw new Error(
                    "Server returned invalid data."
                );

            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load leave requests."
                );

            }


            const requests =
                Array.isArray(data.requests)
                    ? data.requests
                    : [];


            // ==========================================
            // SUMMARY COUNTS
            // ==========================================

            if (totalLeaveRequests) {

                totalLeaveRequests.textContent =
                    requests.length;

            }


            if (pendingLeaveRequests) {

                pendingLeaveRequests.textContent =
                    requests.filter(
                        request =>
                            String(request.status)
                                .toLowerCase() === "pending"
                    ).length;

            }


            if (approvedLeaveRequests) {

                approvedLeaveRequests.textContent =
                    requests.filter(
                        request =>
                            String(request.status)
                                .toLowerCase() === "approved"
                    ).length;

            }


            if (rejectedLeaveRequests) {

                rejectedLeaveRequests.textContent =
                    requests.filter(
                        request =>
                            String(request.status)
                                .toLowerCase() === "rejected"
                    ).length;

            }


            // ==========================================
            // NO REQUESTS
            // ==========================================

            if (requests.length === 0) {

                leaveList.innerHTML = `

                    <div class="leave-empty">

                        <h3>
                            No Leave Requests
                        </h3>

                        <p>
                            No student has submitted a leave request yet.
                        </p>

                    </div>

                `;

                return;
            }


            // ==========================================
            // DISPLAY REQUESTS
            // ==========================================

            leaveList.innerHTML = "";


            requests.forEach(function (request) {

                const status =
                    request.status || "Pending";


                const statusClass =
                    String(status).toLowerCase();


                const card =
                    document.createElement("div");


                card.className =
                    "request-card";


                card.innerHTML = `

                    <div>

                        <h3>
                            📝 Student Leave Request
                        </h3>


                        <p>

                            <strong>
                                Student User ID:
                            </strong>

                            ${escapeHTML(
                                String(
                                    request.user_id || "N/A"
                                )
                            )}

                        </p>


                        <div class="leave-details">

                            <p>

                                <strong>
                                    From:
                                </strong>

                                ${escapeHTML(
                                    String(
                                        request.from_date || "-"
                                    )
                                )}

                            </p>


                            <p>

                                <strong>
                                    To:
                                </strong>

                                ${escapeHTML(
                                    String(
                                        request.to_date || "-"
                                    )
                                )}

                            </p>


                            <p>

                                <strong>
                                    Reason:
                                </strong>

                                ${escapeHTML(
                                    String(
                                        request.reason || "-"
                                    )
                                )}

                            </p>


                            <p>

                                <strong>
                                    Submitted:
                                </strong>

                                ${escapeHTML(
                                    formatDate(
                                        request.created_at
                                    )
                                )}

                            </p>


                            <p>

                                <strong>
                                    Notification:
                                </strong>

                                ${escapeHTML(
                                    request.notification_role ||
                                    "Admin"
                                )}

                            </p>

                        </div>


                        ${
                            statusClass === "pending"
                            ?

                            `

                            <div class="leave-actions">

                                <button
                                    class="approve-leave-btn"
                                    onclick="updateLeaveStatus(
                                        ${request.id},
                                        'Approved'
                                    )"
                                >
                                    ✓ Approve
                                </button>


                                <button
                                    class="reject-leave-btn"
                                    onclick="updateLeaveStatus(
                                        ${request.id},
                                        'Rejected'
                                    )"
                                >
                                    ✕ Reject
                                </button>

                            </div>

                            `

                            :

                            ""

                        }

                    </div>


                    <span
                        class="status ${statusClass}"
                    >
                        ${escapeHTML(status)}
                    </span>

                `;


                leaveList.appendChild(card);

            });


        }

        catch (error) {

            console.error(
                "Admin Leave Error:",
                error
            );


            leaveList.innerHTML = `

                <div class="leave-empty">

                    <h3>
                        Unable to Load Leave Requests
                    </h3>

                    <p>
                        ${escapeHTML(error.message)}
                    </p>

                </div>

            `;

        }

    }


    // ==========================================
    // UPDATE LEAVE STATUS
    // ==========================================

    window.updateLeaveStatus =
        async function (id, status) {

            try {

                const response =
                    await fetch(
                        `http://localhost:5000/api/leave/${id}/status`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                status: status
                            })
                        }
                    );


                const text =
                    await response.text();


                let data;


                try {

                    data =
                        JSON.parse(text);

                }

                catch {

                    throw new Error(
                        "Server returned invalid response."
                    );

                }


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to update leave request."
                    );

                }


                alert(
                    `Leave request ${status.toLowerCase()} successfully.`
                );


                await loadLeaveRequests();

            }


            catch (error) {

                console.error(
                    "Update Leave Error:",
                    error
                );


                alert(
                    "Failed to update leave request.\n\n" +
                    error.message
                );

            }

        };


    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // ==========================================
    // FORMAT DATE
    // ==========================================

    function formatDate(dateValue) {

        if (!dateValue) {
            return "-";
        }


        const date =
            new Date(dateValue);


        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }


        return date.toLocaleString();

    }


    // ==========================================
    // START
    // ==========================================

    loadLeaveRequests();

});