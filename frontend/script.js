// =====================================================
// CAMPUSEASE - COMMON USER HELPER
// =====================================================

function getCurrentUser() {

    const userData =
        localStorage.getItem("campusEaseUser");

    if (!userData) {
        return null;
    }

    try {

        return JSON.parse(userData);

    } catch (error) {

        console.error(
            "Invalid campusEaseUser data:",
            error
        );

        localStorage.removeItem(
            "campusEaseUser"
        );

        return null;
    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// CAMPUSEASE - SIGNUP FORM
// =====================================================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    const role =
        document.getElementById("role");

    const studentTypeGroup =
        document.getElementById("studentTypeGroup");

    const studentType =
        document.getElementById("studentType");

    const hostelBlockGroup =
        document.getElementById("hostelBlockGroup");

    const hostelBlock =
        document.getElementById("hostelBlock");

    const department =
        document.getElementById("department");

    const section =
        document.getElementById("section");


    // =================================================
    // ROLE CHANGE
    // =================================================

    if (role) {

        role.addEventListener(
            "change",
            function () {

                const selectedRole =
                    role.value;


                if (selectedRole === "student") {

                    if (studentTypeGroup) {
                        studentTypeGroup.style.display =
                            "block";
                    }

                    if (studentType) {
                        studentType.required = true;
                    }

                    if (department) {
                        department.required = true;
                    }

                    if (section) {
                        section.disabled = false;
                        section.required = true;
                    }

                }

                else if (selectedRole === "faculty") {

                    if (studentTypeGroup) {
                        studentTypeGroup.style.display =
                            "none";
                    }

                    if (studentType) {
                        studentType.required = false;
                        studentType.value = "";
                    }

                    if (hostelBlockGroup) {
                        hostelBlockGroup.style.display =
                            "none";
                    }

                    if (hostelBlock) {
                        hostelBlock.required = false;
                        hostelBlock.value = "";
                    }

                    if (department) {
                        department.required = true;
                    }

                    if (section) {
                        section.disabled = false;
                        section.required = false;
                    }

                }

                else {

                    if (studentTypeGroup) {
                        studentTypeGroup.style.display =
                            "none";
                    }

                    if (studentType) {
                        studentType.required = false;
                        studentType.value = "";
                    }

                    if (hostelBlockGroup) {
                        hostelBlockGroup.style.display =
                            "none";
                    }

                    if (hostelBlock) {
                        hostelBlock.required = false;
                        hostelBlock.value = "";
                    }

                    if (department) {
                        department.required = false;
                    }

                    if (section) {
                        section.disabled = true;
                        section.required = false;
                        section.value = "";
                    }
                }
            }
        );
    }


    // =================================================
    // STUDENT TYPE CHANGE
    // =================================================

    if (studentType) {

        studentType.addEventListener(
            "change",
            function () {

                const selectedStudentType =
                    studentType.value;


                if (
                    selectedStudentType ===
                    "hosteller"
                ) {

                    if (hostelBlockGroup) {
                        hostelBlockGroup.style.display =
                            "block";
                    }

                    if (hostelBlock) {
                        hostelBlock.required = true;
                    }

                }

                else {

                    if (hostelBlockGroup) {
                        hostelBlockGroup.style.display =
                            "none";
                    }

                    if (hostelBlock) {
                        hostelBlock.required = false;
                        hostelBlock.value = "";
                    }
                }
            }
        );
    }


    // =================================================
    // SIGNUP SUBMISSION
    // =================================================

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById("name")
                    ?.value.trim();

            const email =
                document.getElementById("email")
                    ?.value.trim();

            const selectedRole =
                role?.value;

            const selectedStudentType =
                studentType?.value;

            const selectedHostelBlock =
                hostelBlock?.value;

            const selectedDepartment =
                department?.value.trim();

            const selectedSection =
                section?.value;

            const userId =
                document.getElementById("userId")
                    ?.value.trim();

            const password =
                document.getElementById("password")
                    ?.value;

            const confirmPassword =
                document.getElementById("confirmPassword")
                    ?.value;


            if (
                !name ||
                !email ||
                !selectedRole ||
                !userId ||
                !password ||
                !confirmPassword
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;
            }


            if (selectedRole === "student") {

                if (!selectedStudentType) {

                    alert(
                        "Please select Day Scholar or Hosteller."
                    );

                    return;
                }


                if (!selectedDepartment) {

                    alert(
                        "Please enter your department."
                    );

                    return;
                }


                if (!selectedSection) {

                    alert(
                        "Please select your section."
                    );

                    return;
                }


                if (
                    selectedStudentType === "hosteller" &&
                    !selectedHostelBlock
                ) {

                    alert(
                        "Please select your hostel block."
                    );

                    return;
                }
            }


            if (
                selectedRole === "faculty" &&
                !selectedDepartment
            ) {

                alert(
                    "Please enter the department."
                );

                return;
            }


            if (
                password !== confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/signup",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                role: selectedRole,

                                studentType:
                                    selectedRole === "student"
                                        ? selectedStudentType
                                        : null,

                                hostelBlock:
                                    selectedRole === "student" &&
                                    selectedStudentType === "hosteller"
                                        ? selectedHostelBlock
                                        : null,

                                department:
                                    selectedDepartment ||
                                    null,

                                section:
                                    selectedRole === "student"
                                        ? selectedSection
                                        : null,

                                userId: userId,

                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Signup failed."
                    );

                    return;
                }


                alert(
                    "Account created successfully!"
                );


                signupForm.reset();


                if (studentTypeGroup) {
                    studentTypeGroup.style.display =
                        "none";
                }

                if (studentType) {
                    studentType.required = false;
                }

                if (hostelBlockGroup) {
                    hostelBlockGroup.style.display =
                        "none";
                }

                if (hostelBlock) {
                    hostelBlock.required = false;
                    hostelBlock.value = "";
                }

                if (section) {
                    section.disabled = true;
                    section.required = false;
                    section.value = "";
                }


                window.location.href =
                    "login.html";

            }

            catch (error) {

                console.error(
                    "Signup Error:",
                    error
                );

                alert(
                    "Cannot connect to CampusEase server."
                );
            }
        }
    );
}


// =====================================================
// CAMPUSEASE - LOGIN FORM
// =====================================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById("email")
                    ?.value.trim();

            const password =
                document.getElementById("password")
                    ?.value;

            const role =
                document.getElementById("role")
                    ?.value;


            if (
                !email ||
                !password ||
                !role
            ) {

                alert(
                    "Please fill all login fields."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email: email,

                                password: password,

                                role: role
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Login failed."
                    );

                    return;
                }


                // Save logged-in user
                localStorage.setItem(
                    "campusEaseUser",
                    JSON.stringify(data.user)
                );


                alert(
                    "Login successful!"
                );


                // =================================================
                // ADMIN LOGIN
                // =================================================
const userRole =
    String(data.user.role).toLowerCase();

if (userRole === "admin") {

    window.location.href =
        "admin-dashboard.html";

    return;
}

if (userRole === "faculty") {

    window.location.href =
        "faculty-dashboard.html";

    return;
}

window.location.href =
    "dashboard.html";


                // =================================================
                // FACULTY LOGIN
                // =================================================

                if (
                    data.user &&
                    String(data.user.role)
                        .toLowerCase() === "faculty"
                ) {

                    window.location.href =
                        "faculty-dashboard.html";

                    return;
                }


                // =================================================
                // STUDENT LOGIN
                // =================================================

                window.location.href =
                    "dashboard.html";

            }

            catch (error) {

                console.error(
                    "Login Error:",
                    error
                );

                alert(
                    "Cannot connect to CampusEase server."
                );
            }
        }
    );
}


// =====================================================
// CAMPUSEASE - STUDENT DASHBOARD
// =====================================================

const dashboardPage =
    document.querySelector(
        ".student-dashboard"
    );

if (dashboardPage) {

    const user =
        getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";

    }

    else {

        try {

            const studentName =
                document.getElementById(
                    "studentName"
                );

            if (studentName) {

                studentName.textContent =
                    user.name ||
                    "Student";
            }


            const studentDepartment =
                document.getElementById(
                    "studentDepartment"
                );

            if (studentDepartment) {

                studentDepartment.textContent =
                    user.department ||
                    "Department";
            }


            const studentSection =
                document.getElementById(
                    "studentSection"
                );

            if (studentSection) {

                studentSection.textContent =
                    user.section ||
                    "-";
            }


            const studentTypeDisplay =
                document.getElementById(
                    "studentType"
                );

            if (studentTypeDisplay) {

                studentTypeDisplay.textContent =
                    user.student_type ||
                    "-";
            }


            const studentHostel =
                document.getElementById(
                    "studentHostel"
                );

            const hostelSeparator =
                document.getElementById(
                    "hostelSeparator"
                );


            if (
                user.student_type === "hosteller" &&
                user.hostel_block
            ) {

                if (studentHostel) {

                    studentHostel.textContent =
                        user.hostel_block;

                    studentHostel.style.display =
                        "inline";
                }


                if (hostelSeparator) {

                    hostelSeparator.style.display =
                        "inline";
                }

            }

            else {

                if (studentHostel) {

                    studentHostel.style.display =
                        "none";
                }


                if (hostelSeparator) {

                    hostelSeparator.style.display =
                        "none";
                }
            }


            const classTimes = [

                {
                    id: "classStatus1",
                    time: "09:15"
                },

                {
                    id: "classStatus2",
                    time: "11:00"
                },

                {
                    id: "classStatus3",
                    time: "13:30"
                },

                {
                    id: "classStatus4",
                    time: "15:00"
                }
            ];


            const currentTime =
                new Date();

            const currentMinutes =
                currentTime.getHours() * 60 +
                currentTime.getMinutes();


            classTimes.forEach(
                function (classItem) {

                    const statusElement =
                        document.getElementById(
                            classItem.id
                        );


                    if (!statusElement) {
                        return;
                    }


                    const [
                        hours,
                        minutes
                    ] =
                        classItem.time
                            .split(":")
                            .map(Number);


                    const classMinutes =
                        hours * 60 +
                        minutes;


                    if (
                        currentMinutes <
                        classMinutes
                    ) {

                        statusElement.textContent =
                            "Upcoming";

                    }

                    else if (
                        currentMinutes <
                        classMinutes + 60
                    ) {

                        statusElement.textContent =
                            "Ongoing";

                    }

                    else {

                        statusElement.textContent =
                            "Completed";
                    }
                }
            );


            const assignments = [

                {
                    id: "assignmentDays1",
                    date: "2026-10-10"
                },

                {
                    id: "assignmentDays2",
                    date: "2026-10-14"
                },

                {
                    id: "assignmentDays3",
                    date: "2026-10-17"
                }
            ];


            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );


            assignments.forEach(
                function (assignment) {

                    const element =
                        document.getElementById(
                            assignment.id
                        );


                    if (!element) {
                        return;
                    }


                    const dueDate =
                        new Date(
                            assignment.date
                        );

                    dueDate.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    const difference =
                        dueDate - today;


                    const daysRemaining =
                        Math.ceil(
                            difference /
                            (1000 * 60 * 60 * 24)
                        );


                    if (
                        daysRemaining < 0
                    ) {

                        element.textContent =
                            "Overdue";

                    }

                    else if (
                        daysRemaining === 0
                    ) {

                        element.textContent =
                            "Due today";

                    }

                    else if (
                        daysRemaining === 1
                    ) {

                        element.textContent =
                            "1 day";

                    }

                    else {

                        element.textContent =
                            daysRemaining +
                            " days";
                    }
                }
            );

        }

        catch (error) {

            console.error(
                "Dashboard Error:",
                error
            );
        }
    }
}


// =====================================================
// LOGOUT
// =====================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            localStorage.removeItem(
                "campusEaseUser"
            );

            window.location.href =
                "login.html";
        }
    );
}


// =====================================================
// ADMIN LOGOUT
// =====================================================

const adminLogoutBtn =
    document.getElementById(
        "adminLogoutBtn"
    );

if (adminLogoutBtn) {

    adminLogoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            localStorage.removeItem(
                "campusEaseUser"
            );

            window.location.href =
                "login.html";
        }
    );
}


// =====================================================
// REPORT PROBLEM
// =====================================================

const problemForm =
    document.getElementById(
        "problemForm"
    );

if (problemForm) {

    problemForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                getCurrentUser();


            if (!user || !user.id) {

                alert(
                    "Please login first."
                );

                window.location.href =
                    "login.html";

                return;
            }


            const title =
                document.getElementById(
                    "problemTitle"
                )?.value.trim();

            const category =
                document.getElementById(
                    "problemCategory"
                )?.value;

            const location =
                document.getElementById(
                    "problemLocation"
                )?.value.trim();

            const description =
                document.getElementById(
                    "problemDescription"
                )?.value.trim();


            if (
                !title ||
                !category ||
                !location ||
                !description
            ) {

                alert(
                    "Please fill all problem report fields."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/problems",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                userId:
                                    user.id,

                                title:
                                    title,

                                category:
                                    category,

                                location:
                                    location,

                                description:
                                    description
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to submit problem."
                    );

                    return;
                }


                problemForm.reset();


                const problemSuccess =
                    document.getElementById(
                        "problemSuccess"
                    );


                if (problemSuccess) {

                    problemSuccess.style.display =
                        "block";
                }


                if (
                    data.notificationRole
                ) {

                    console.log(
                        "Notification sent to:",
                        data.notificationRole
                    );
                }

            }

            catch (error) {

                console.error(
                    "Problem Report Error:",
                    error
                );

                alert(
                    "Unable to connect to the CampusEase server."
                );
            }
        }
    );
}


// =====================================================
// CAMPUS NAVIGATION
// =====================================================

const campusMapElement =
    document.getElementById(
        "campusMap"
    );

if (
    campusMapElement &&
    typeof L !== "undefined"
) {

    const campusLocations = {

        "room 204": {
            name: "Room 204",
            latitude: 20.335200,
            longitude: 85.850800
        },

        "lab 2": {
            name: "Lab 2",
            latitude: 20.335300,
            longitude: 85.850900
        },

        "room 305": {
            name: "Room 305",
            latitude: 20.335400,
            longitude: 85.851000
        },

        "room 201": {
            name: "Room 201",
            latitude: 20.335100,
            longitude: 85.850700
        }
    };


    const map =
        L.map("campusMap").setView(
            [20.334941, 85.850594],
            18
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors",

            maxZoom: 22
        }
    ).addTo(map);


    let currentMarker = null;
    let destinationMarker = null;
    let routeLine = null;


    const findRouteBtn =
        document.getElementById(
            "findRouteBtn"
        );

    const destinationInput =
        document.getElementById(
            "destination"
        );


    if (
        findRouteBtn &&
        destinationInput
    ) {

        findRouteBtn.addEventListener(
            "click",
            function () {

                const destination =
                    destinationInput.value
                        .trim()
                        .toLowerCase();


                if (!destination) {

                    alert(
                        "Please enter a destination."
                    );

                    return;
                }


                const selectedLocation =
                    campusLocations[
                        destination
                    ];


                if (!selectedLocation) {

                    alert(
                        "Location not found. Try Room 204, Lab 2, Room 305 or Room 201."
                    );

                    return;
                }


                if (!navigator.geolocation) {

                    alert(
                        "Your browser does not support location services."
                    );

                    return;
                }


                findRouteBtn.textContent =
                    "📍 Detecting Location...";


                navigator.geolocation.getCurrentPosition(

                    function (position) {

                        const currentLatitude =
                            position.coords.latitude;

                        const currentLongitude =
                            position.coords.longitude;


                        if (currentMarker) {
                            map.removeLayer(
                                currentMarker
                            );
                        }


                        if (destinationMarker) {
                            map.removeLayer(
                                destinationMarker
                            );
                        }


                        if (routeLine) {
                            map.removeLayer(
                                routeLine
                            );
                        }


                        currentMarker =
                            L.marker([
                                currentLatitude,
                                currentLongitude
                            ])
                                .addTo(map)
                                .bindPopup(
                                    "<b>📍 Your Current Location</b>"
                                );


                        destinationMarker =
                            L.marker([
                                selectedLocation.latitude,
                                selectedLocation.longitude
                            ])
                                .addTo(map)
                                .bindPopup(
                                    "<b>🏫 " +
                                    selectedLocation.name +
                                    "</b>"
                                );


                        const midpointLatitude =
                            (
                                currentLatitude +
                                selectedLocation.latitude
                            ) / 2;


                        const midpointLongitude =
                            (
                                currentLongitude +
                                selectedLocation.longitude
                            ) / 2;


                        const campusPath = [

                            [
                                currentLatitude,
                                currentLongitude
                            ],

                            [
                                midpointLatitude,
                                midpointLongitude
                            ],

                            [
                                selectedLocation.latitude,
                                selectedLocation.longitude
                            ]
                        ];


                        routeLine =
                            L.polyline(
                                campusPath,
                                {
                                    weight: 6
                                }
                            ).addTo(map);


                        const distance =
                            calculateDistance(
                                currentLatitude,
                                currentLongitude,
                                selectedLocation.latitude,
                                selectedLocation.longitude
                            );


                        const routeBounds =
                            L.latLngBounds(
                                campusPath
                            );


                        map.fitBounds(
                            routeBounds,
                            {
                                padding: [
                                    50,
                                    50
                                ]
                            }
                        );


                        currentMarker.openPopup();


                        findRouteBtn.textContent =
                            "🧭 Find Route";


                        alert(
                            "Route found!\n\n" +
                            "From: Your Current Location\n" +
                            "To: " +
                            selectedLocation.name +
                            "\n\nApproximate distance: " +
                            distance.toFixed(2) +
                            " km"
                        );
                    },

                    function (error) {

                        findRouteBtn.textContent =
                            "🧭 Find Route";


                        if (error.code === 1) {

                            alert(
                                "Location permission was denied. Please allow location access in your browser."
                            );

                        }

                        else if (error.code === 2) {

                            alert(
                                "Your current location could not be determined."
                            );

                        }

                        else if (error.code === 3) {

                            alert(
                                "Location request timed out. Please try again."
                            );

                        }

                        else {

                            alert(
                                "Unable to detect your current location."
                            );
                        }
                    },

                    {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 0
                    }
                );
            }
        );
    }


    function calculateDistance(
        latitude1,
        longitude1,
        latitude2,
        longitude2
    ) {

        const earthRadius =
            6371;


        const latitudeDifference =
            toRadians(
                latitude2 -
                latitude1
            );


        const longitudeDifference =
            toRadians(
                longitude2 -
                longitude1
            );


        const a =
            Math.sin(
                latitudeDifference / 2
            ) *
            Math.sin(
                latitudeDifference / 2
            ) +

            Math.cos(
                toRadians(latitude1)
            ) *

            Math.cos(
                toRadians(latitude2)
            ) *

            Math.sin(
                longitudeDifference / 2
            ) *

            Math.sin(
                longitudeDifference / 2
            );


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return earthRadius * c;
    }


    function toRadians(
        degrees
    ) {

        return degrees *
            (Math.PI / 180);
    }
}


// =====================================================
// DIGITAL QUEUE
// =====================================================

const queueForm =
    document.getElementById(
        "queueForm"
    );

if (queueForm) {

    queueForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                getCurrentUser();


            if (!user || !user.id) {

                alert(
                    "Please login first."
                );

                window.location.href =
                    "login.html";

                return;
            }


            const service =
                document.getElementById(
                    "service"
                )?.value;


            if (!service) {

                alert(
                    "Please select a service."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/queue/join",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                userId:
                                    user.id,

                                service:
                                    service
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Unable to join queue."
                    );

                    return;
                }


                const tokenCard =
                    document.getElementById(
                        "tokenCard"
                    );

                const tokenNumber =
                    document.getElementById(
                        "tokenNumber"
                    );

                const tokenService =
                    document.getElementById(
                        "tokenService"
                    );

                const queuePosition =
                    document.getElementById(
                        "queuePosition"
                    );

                const queueStatus =
                    document.getElementById(
                        "queueStatus"
                    );


                const generatedToken =
                    data.tokenNumber ||
                    data.token ||
                    "--";


                if (tokenCard) {
                    tokenCard.style.display =
                        "block";
                }


                if (tokenNumber) {
                    tokenNumber.textContent =
                        generatedToken;
                }


                if (tokenService) {
                    tokenService.textContent =
                        service;
                }


                if (queuePosition) {
                    queuePosition.textContent =
                        data.queuePosition ||
                        "1";
                }


                if (queueStatus) {
                    queueStatus.textContent =
                        data.status ||
                        "Waiting";
                }


                const queueInfoToken =
                    document.getElementById(
                        "queueInfoToken"
                    );

                const queueInfoPosition =
                    document.getElementById(
                        "queueInfoPosition"
                    );

                const queueInfoNotification =
                    document.getElementById(
                        "queueInfoNotification"
                    );


                if (queueInfoToken) {

                    queueInfoToken.textContent =
                        "Token #" +
                        generatedToken;
                }


                if (queueInfoPosition) {

                    queueInfoPosition.textContent =
                        data.queuePosition ||
                        "1";
                }


                if (queueInfoNotification) {

                    queueInfoNotification.textContent =
                        "Waiting";
                }


                alert(
                    "Queue joined successfully!\n\n" +
                    "Your Token: " +
                    generatedToken
                );

            }

            catch (error) {

                console.error(
                    "Queue Error:",
                    error
                );

                alert(
                    "Cannot connect to CampusEase server."
                );
            }
        }
    );
}


// =====================================================
// DEPARTMENT-SPECIFIC NOTICES
// =====================================================

const noticeList =
    document.getElementById(
        "noticeList"
    );

if (noticeList) {

    const user =
        getCurrentUser();


    if (user) {

        const department =
            (
                user.department ||
                ""
            ).toLowerCase();


        const notices = [

            {
                department: "general",
                date: "OCT 07",
                title:
                    "Mid-Semester Examination Schedule",
                description:
                    "Examination schedule has been published."
            },

            {
                department: "cse",
                date: "OCT 06",
                title:
                    "CSE Department Seminar",
                description:
                    "A technical seminar will be conducted for CSE students."
            },

            {
                department: "ece",
                date: "OCT 06",
                title:
                    "ECE Department Workshop",
                description:
                    "An electronics and communication workshop is scheduled."
            },

            {
                department: "general",
                date: "OCT 05",
                title:
                    "Campus Hackathon",
                description:
                    "Registration is now open for all students."
            }
        ];


        const filteredNotices =
            notices.filter(
                function (notice) {

                    return (
                        notice.department === "general" ||
                        department.includes(
                            notice.department
                        )
                    );
                }
            );


        noticeList.innerHTML = "";


        filteredNotices.forEach(
            function (notice) {

                const noticeCard =
                    document.createElement(
                        "div"
                    );


                noticeCard.className =
                    "notice-card";


                noticeCard.innerHTML = `

                    <span class="notice-date">
                        ${notice.date}
                    </span>

                    <div>

                        <h3>
                            ${notice.title}
                        </h3>

                        <p>
                            ${notice.description}
                        </p>

                    </div>
                `;


                noticeList.appendChild(
                    noticeCard
                );
            }
        );
    }
}


// =====================================================
// LEAVE REQUEST
// =====================================================

const leaveForm =
    document.getElementById(
        "leaveForm"
    );

if (leaveForm) {

    leaveForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                getCurrentUser();


            if (!user || !user.id) {

                alert(
                    "Please login first."
                );

                return;
            }


            const fromDate =
                document.getElementById(
                    "fromDate"
                )?.value;

            const toDate =
                document.getElementById(
                    "toDate"
                )?.value;

            const reason =
                document.getElementById(
                    "leaveReason"
                )?.value.trim();


            if (
                !fromDate ||
                !toDate ||
                !reason
            ) {

                alert(
                    "Please fill all fields."
                );

                return;
            }


            if (toDate < fromDate) {

                alert(
                    "To Date cannot be before From Date."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/leave",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                userId:
                                    user.id,

                                fromDate:
                                    fromDate,

                                toDate:
                                    toDate,

                                reason:
                                    reason
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to submit leave request."
                    );

                    return;
                }


                const leaveSuccess =
                    document.getElementById(
                        "leaveSuccess"
                    );


                if (leaveSuccess) {

                    leaveSuccess.style.display =
                        "block";
                }


                leaveForm.reset();


                if (
                    document.getElementById(
                        "leaveRequestInfo"
                    )
                ) {

                    loadLeaveRequest();
                }


                updatePendingRequestsCount();

            }

            catch (error) {

                console.error(
                    "Leave Request Error:",
                    error
                );

                alert(
                    "Unable to connect to CampusEase server."
                );
            }
        }
    );
}


// =====================================================
// LOAD LEAVE REQUEST STATUS
// =====================================================

async function loadLeaveRequest() {

    const leaveInfo =
        document.getElementById(
            "leaveRequestInfo"
        );

    const leaveStatus =
        document.getElementById(
            "leaveRequestStatus"
        );


    if (
        !leaveInfo ||
        !leaveStatus
    ) {

        return;
    }


    const user =
        getCurrentUser();


    if (!user || !user.id) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/leave/${user.id}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.request
        ) {

            leaveInfo.textContent =
                "No leave request submitted.";

            leaveStatus.textContent =
                "None";

            leaveStatus.className =
                "status pending";

            return;
        }


        const request =
            data.request;


        leaveInfo.textContent =
            `${request.from_date} → ${request.to_date} • ${request.reason}`;


        leaveStatus.textContent =
            request.status ||
            "Pending";


        leaveStatus.className =
            "status " +
            String(
                request.status ||
                "Pending"
            ).toLowerCase();

    }

    catch (error) {

        console.error(
            "Failed to load leave request:",
            error
        );
    }
}


if (
    document.getElementById(
        "leaveRequestInfo"
    )
) {

    loadLeaveRequest();
}


// =====================================================
// LOAD MY PROBLEM REPORTS - STUDENT
// =====================================================

async function loadMyProblemReports() {

    const container =
        document.getElementById(
            "myReports"
        );


    if (!container) {
        return;
    }


    const user =
        getCurrentUser();


    if (!user || !user.id) {

        container.innerHTML = `

            <div class="complaint-card">

                <div class="complaint-info">

                    <div class="complaint-icon">
                        ⚠️
                    </div>

                    <div>

                        <h3>
                            Please Login
                        </h3>

                        <p>
                            Login to view your problem reports.
                        </p>

                    </div>

                </div>

            </div>

        `;

        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/problems/user/${user.id}`
            );


        const reports =
            await response.json();


        if (!response.ok) {

            throw new Error(
                reports.message ||
                "Failed to load problem reports."
            );
        }


        if (
            !Array.isArray(reports) ||
            reports.length === 0
        ) {

            container.innerHTML = `

                <div class="complaint-card">

                    <div class="complaint-info">

                        <div class="complaint-icon">
                            ✅
                        </div>

                        <div>

                            <h3>
                                No Problem Reports
                            </h3>

                            <p>
                                You have not reported any campus problems yet.
                            </p>

                        </div>

                    </div>

                </div>

            `;

            return;
        }


        container.innerHTML = "";


        reports.forEach(
            function (report) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "complaint-card";


                const statusClass =
                    getProblemStatusClass(
                        report.status
                    );


                card.innerHTML = `

                    <div class="complaint-info">

                        <div class="complaint-icon">
                            🛠️
                        </div>

                        <div>

                            <h3>
                                ${escapeHTML(
                                    report.title
                                )}
                            </h3>

                            <p>
                                <strong>
                                    Category:
                                </strong>
                                ${escapeHTML(
                                    report.category
                                )}
                            </p>

                            <p>
                                <strong>
                                    Location:
                                </strong>
                                ${escapeHTML(
                                    report.location
                                )}
                            </p>

                            <p>
                                <strong>
                                    Description:
                                </strong>
                                ${escapeHTML(
                                    report.description
                                )}
                            </p>

                            <p>
                                <strong>
                                    Assigned To:
                                </strong>
                                ${escapeHTML(
                                    report.assigned_to ||
                                    "Not assigned yet"
                                )}
                            </p>

                        </div>

                    </div>

                    <span class="status ${statusClass}">
                        ${escapeHTML(
                            report.status ||
                            "Pending"
                        )}
                    </span>

                `;


                container.appendChild(
                    card
                );
            }
        );

    }

    catch (error) {

        console.error(
            "My problem reports error:",
            error
        );


        container.innerHTML = `

            <div class="complaint-card">

                <div class="complaint-info">

                    <div class="complaint-icon">
                        ⚠️
                    </div>

                    <div>

                        <h3>
                            Unable to Load Reports
                        </h3>

                        <p>
                            Make sure the CampusEase server is running.
                        </p>

                    </div>

                </div>

            </div>

        `;
    }
}


// =====================================================
// PROBLEM STATUS CLASS
// =====================================================

function getProblemStatusClass(status) {

    if (!status) {
        return "pending";
    }


    const value =
        String(status).toLowerCase();


    if (value === "resolved") {
        return "approved";
    }


    if (value === "in progress") {
        return "processing";
    }


    return "pending";
}


// =====================================================
// START STUDENT PROBLEM REPORTS
// =====================================================

if (
    document.getElementById(
        "myReports"
    )
) {

    loadMyProblemReports();
}


// =====================================================
// ADMIN - LOAD PROBLEM REPORTS ON DASHBOARD
// =====================================================

async function loadAdminDashboardProblems() {

    const container =
        document.getElementById(
            "adminDashboardProblems"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/admin/problems"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load problem reports."
            );
        }


        const reports =
            Array.isArray(data)
                ? data
                : data.problems || data.reports || [];


        container.innerHTML = "";


        if (reports.length === 0) {

            container.innerHTML = `

                <div class="request-card">

                    <div>

                        <h3>
                            No Problem Reports
                        </h3>

                        <p>
                            No student problems have been reported yet.
                        </p>

                    </div>

                    <span class="status pending">
                        None
                    </span>

                </div>

            `;

            return;
        }


        reports
            .slice(0, 5)
            .forEach(
                function (report) {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "request-card";


                    const status =
                        report.status ||
                        "Pending";


                    const statusClass =
                        getProblemStatusClass(
                            status
                        );


                    card.innerHTML = `

                        <div>

                            <h3>
                                🛠️
                                ${escapeHTML(
                                    report.title ||
                                    "Campus Problem"
                                )}
                            </h3>

                            <p>
                                <strong>
                                    Student:
                                </strong>
                                ${escapeHTML(
                                    report.student_name ||
                                    report.name ||
                                    "Unknown Student"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Location:
                                </strong>
                                ${escapeHTML(
                                    report.location ||
                                    "Not provided"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Category:
                                </strong>
                                ${escapeHTML(
                                    report.category ||
                                    "General"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Assigned To:
                                </strong>
                                ${escapeHTML(
                                    report.assigned_to ||
                                    "Not assigned yet"
                                )}
                            </p>

                        </div>

                        <div>

                            <span class="status ${statusClass}">
                                ${escapeHTML(
                                    status
                                )}
                            </span>

                            <br><br>

                            <a
                                href="admin-problems.html"
                                class="view-link"
                            >
                                Manage →
                            </a>

                        </div>

                    `;


                    container.appendChild(
                        card
                    );
                }
            );

    }

    catch (error) {

        console.error(
            "Admin dashboard problem reports error:",
            error
        );


        container.innerHTML = `

            <div class="request-card">

                <div>

                    <h3>
                        Unable to Load Problem Reports
                    </h3>

                    <p>
                        Make sure the CampusEase backend is running.
                    </p>

                </div>

                <span class="status pending">
                    Error
                </span>

            </div>

        `;
    }
}


// =====================================================
// START ADMIN DASHBOARD PROBLEM REPORTS
// =====================================================

if (
    document.getElementById(
        "adminDashboardProblems"
    )
) {

    loadAdminDashboardProblems();
}


// =====================================================
// LOAD ACTIVE QUEUE TOKEN
// =====================================================

async function loadQueueToken() {

    const queueContainer =
        document.getElementById(
            "queueStatus"
        );

    const queueTokenStatus =
        document.getElementById(
            "queueTokenStatus"
        );


    if (!queueContainer) {
        return;
    }


    const user =
        getCurrentUser();


    if (!user || !user.id) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/queue/user/${user.id}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.token
        ) {

            queueContainer.textContent =
                "No active queue token.";


            if (queueTokenStatus) {

                queueTokenStatus.textContent =
                    "None";

                queueTokenStatus.className =
                    "status pending";
            }


            return;
        }


        const token =
            data.token;


        queueContainer.textContent =
            `🎫 Token #${token.token_number} • ${token.service}`;


        if (queueTokenStatus) {

            queueTokenStatus.textContent =
                token.status ||
                "Waiting";


            queueTokenStatus.className =
                "status " +
                String(
                    token.status ||
                    "Waiting"
                ).toLowerCase();
        }

    }

    catch (error) {

        console.error(
            "Failed to load queue token:",
            error
        );
    }
}


if (
    document.getElementById(
        "queueStatus"
    )
) {

    loadQueueToken();
}


// =====================================================
// AI CAMPUS ASSISTANT
// =====================================================

const aiChatForm =
    document.getElementById(
        "aiChatForm"
    );

const aiQuestion =
    document.getElementById(
        "aiQuestion"
    );

const chatMessages =
    document.getElementById(
        "chatMessages"
    );


function addChatMessage(
    message,
    type
) {

    if (!chatMessages) {
        return;
    }


    const messageDiv =
        document.createElement(
            "div"
        );


    messageDiv.className =
        "chat-message " +
        (
            type === "user"
                ? "user-message"
                : "bot-message"
        );


    if (type === "user") {

        messageDiv.innerHTML = `

            <div class="chat-bubble">

                <p>
                    ${message}
                </p>

            </div>

            <div class="chat-icon">
                👤
            </div>
        `;

    }

    else {

        messageDiv.innerHTML = `

            <div class="chat-icon">
                🤖
            </div>

            <div class="chat-bubble">

                <p>
                    ${message}
                </p>

            </div>
        `;
    }


    chatMessages.appendChild(
        messageDiv
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


function getAIResponse(
    question
) {

    const text =
        question.toLowerCase();


    if (
        text.includes("room 204") ||
        text.includes("where is room")
    ) {

        return `
            Room 204 is the classroom used for
            Data Structures. You can use Campus
            Navigation to find the location.
        `;
    }


    if (
        text.includes("queue") ||
        text.includes("token")
    ) {

        return `
            You can use Digital Queue to get a
            digital token without standing in a
            physical queue. Select a service and
            click "Get Digital Token".
        `;
    }


    if (
        text.includes("leave") ||
        text.includes("absence")
    ) {

        return `
            You can submit a leave request from
            the Leave Request section on your
            dashboard. Enter your dates and reason,
            then submit the request.
        `;
    }


    if (
        text.includes("problem") ||
        text.includes("complaint") ||
        text.includes("report")
    ) {

        return `
            You can report a campus problem using
            the Report Problem option. Add the
            problem title, category, location and
            description so it can be tracked.
        `;
    }


    if (
        text.includes("navigation") ||
        text.includes("location") ||
        text.includes("classroom") ||
        text.includes("lab")
    ) {

        return `
            Use Campus Navigation from the
            dashboard to find classrooms, labs
            and other important campus locations.
        `;
    }


    if (
        text.includes("notice") ||
        text.includes("announcement")
    ) {

        return `
            You can check the Notices section on
            your student dashboard for important
            campus announcements and updates.
        `;
    }


    if (
        text.includes("document") ||
        text.includes("certificate") ||
        text.includes("transcript")
    ) {

        return `
            You can request important college
            documents from the Documents section.
            Select the document, enter the purpose,
            and submit your request.
        `;
    }


    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {

        return `
            Hello! 👋 How can I help you with
            CampusEase today?
        `;
    }


    return `
        I can help you with Digital Queue,
        Leave Requests, Problem Reports,
        Campus Navigation, Documents and
        Campus Notices. Try asking me about
        one of these.
    `;
}


if (
    aiChatForm &&
    aiQuestion
) {

    aiChatForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const question =
                aiQuestion.value.trim();


            if (!question) {
                return;
            }


            addChatMessage(
                question,
                "user"
            );


            const response =
                getAIResponse(
                    question
                );


            setTimeout(
                function () {

                    addChatMessage(
                        response,
                        "bot"
                    );

                },
                400
            );


            aiQuestion.value = "";

            aiQuestion.focus();
        }
    );
}


// =====================================================
// AI QUICK QUESTIONS
// =====================================================

const quickQuestionButtons =
    document.querySelectorAll(
        ".ai-question-btn"
    );


quickQuestionButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                if (
                    !aiChatForm ||
                    !aiQuestion
                ) {

                    return;
                }


                const question =
                    button.getAttribute(
                        "data-question"
                    ) ||
                    button.textContent
                        .replace(
                            /[^\w\s?]+/g,
                            ""
                        )
                        .trim();


                aiQuestion.value =
                    question;


                aiChatForm.dispatchEvent(
                    new Event(
                        "submit",
                        {
                            bubbles: true,
                            cancelable: true
                        }
                    )
                );
            }
        );
    }
);


// =====================================================
// DOCUMENT REQUEST
// =====================================================

const documentForm =
    document.getElementById(
        "documentForm"
    );


if (documentForm) {

    documentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                getCurrentUser();


            if (!user || !user.id) {

                alert(
                    "Please login first."
                );

                window.location.href =
                    "login.html";

                return;
            }


            const documentType =
                document.getElementById(
                    "documentType"
                )?.value;

            const purpose =
                document.getElementById(
                    "documentPurpose"
                )?.value.trim();


            if (
                !documentType ||
                !purpose
            ) {

                alert(
                    "Please fill all fields."
                );

                return;
            }


            const button =
                document.getElementById(
                    "documentSubmitBtn"
                );


            if (button) {

                button.textContent =
                    "Submitting...";

                button.disabled =
                    true;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/documents",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                userId:
                                    user.id,

                                documentType:
                                    documentType,

                                purpose:
                                    purpose
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to submit document request."
                    );


                    if (button) {

                        button.textContent =
                            "Submit Request";

                        button.disabled =
                            false;
                    }

                    return;
                }


                const success =
                    document.getElementById(
                        "documentSuccess"
                    );

                const successText =
                    document.getElementById(
                        "documentSuccessText"
                    );


                if (successText) {

                    successText.textContent =
                        `${documentType} request submitted successfully.`;
                }


                if (success) {

                    success.style.display =
                        "block";
                }


                documentForm.reset();


                if (button) {

                    button.textContent =
                        "Request Submitted ✓";

                    button.disabled =
                        false;
                }


                if (success) {

                    success.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }


                updatePendingRequestsCount();

            }

            catch (error) {

                console.error(
                    "Document Request Error:",
                    error
                );


                alert(
                    "Cannot connect to CampusEase server. Make sure the backend server is running."
                );


                if (button) {

                    button.textContent =
                        "Submit Request";

                    button.disabled =
                        false;
                }
            }
        }
    );
}


// =====================================================
// LOAD DOCUMENT REQUEST
// =====================================================

async function loadDocumentRequest() {

    const documentInfo =
        document.getElementById(
            "documentRequestInfo"
        );

    const documentStatus =
        document.getElementById(
            "documentRequestStatus"
        );


    if (
        !documentInfo ||
        !documentStatus
    ) {

        return;
    }


    const user =
        getCurrentUser();


    if (!user || !user.id) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/documents/${user.id}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.request
        ) {

            documentInfo.textContent =
                "No document request submitted.";

            documentStatus.textContent =
                "None";

            documentStatus.className =
                "status pending";

            return;
        }


        const request =
            data.request;


        documentInfo.textContent =
            `${request.document_type} • ${request.purpose}`;


        documentStatus.textContent =
            request.status ||
            "Pending";


        documentStatus.className =
            "status " +
            String(
                request.status ||
                "Pending"
            ).toLowerCase();

    }

    catch (error) {

        console.error(
            "Failed to load document request:",
            error
        );


        documentInfo.textContent =
            "Unable to load document request.";

        documentStatus.textContent =
            "Error";

        documentStatus.className =
            "status pending";
    }
}


if (
    document.getElementById(
        "documentRequestInfo"
    )
) {

    loadDocumentRequest();
}


// =====================================================
// ADMIN - LOAD DOCUMENT REQUESTS
// =====================================================

async function loadAdminDocumentRequests() {

    const container =
        document.getElementById(
            "adminDocumentRequests"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/admin/documents"
            );


        const data =
            await response.json();


        if (!response.ok) {

            container.innerHTML = `

                <div class="request-card">

                    <div>

                        <h3>
                            Unable to load requests
                        </h3>

                        <p>
                            ${escapeHTML(
                                data.message ||
                                "Please try again later."
                            )}
                        </p>

                    </div>

                    <span class="status pending">
                        Error
                    </span>

                </div>
            `;

            return;
        }


        container.innerHTML = "";


        if (
            !data.requests ||
            data.requests.length === 0
        ) {

            container.innerHTML = `

                <div class="request-card">

                    <div>

                        <h3>
                            No Document Requests
                        </h3>

                        <p>
                            No student document requests have been submitted.
                        </p>

                    </div>

                    <span class="status pending">
                        None
                    </span>

                </div>
            `;

            return;
        }


        data.requests.forEach(
            function (request) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "request-card";


                const status =
                    String(
                        request.status ||
                        "Pending"
                    );


                card.innerHTML = `

                    <div>

                        <h3>
                            ${escapeHTML(
                                request.document_type ||
                                "Document Request"
                            )}
                        </h3>

                        <p>
                            Student:
                            ${escapeHTML(
                                request.student_name ||
                                request.name ||
                                "Unknown"
                            )}

                            ${
                                request.user_id_number
                                    ? `(${escapeHTML(
                                        request.user_id_number
                                    )})`
                                    : ""
                            }
                        </p>

                        <p>
                            Purpose:
                            ${escapeHTML(
                                request.purpose ||
                                "Not provided"
                            )}
                        </p>

                    </div>

                    <span
                        class="status ${status.toLowerCase()}"
                    >
                        ${escapeHTML(status)}
                    </span>
                `;


                container.appendChild(
                    card
                );
            }
        );

    }

    catch (error) {

        console.error(
            "Failed to load admin document requests:",
            error
        );


        container.innerHTML = `

            <div class="request-card">

                <div>

                    <h3>
                        Server Connection Error
                    </h3>

                    <p>
                        Make sure the CampusEase backend is running.
                    </p>

                </div>

                <span class="status pending">
                    Error
                </span>

            </div>
        `;
    }
}


if (
    document.getElementById(
        "adminDocumentRequests"
    )
) {

    loadAdminDocumentRequests();
}


// =====================================================
// UPDATE PENDING REQUESTS COUNT
// =====================================================

async function updatePendingRequestsCount() {

    const countElement =
        document.getElementById(
            "pendingRequestsCount"
        );


    if (!countElement) {
        return;
    }


    const user =
        getCurrentUser();


    if (!user || !user.id) {

        countElement.textContent =
            "0";

        return;
    }


    let pendingCount = 0;


    function isActiveRequest(status) {

        const currentStatus =
            String(
                status ||
                "Pending"
            ).toLowerCase();


        const completedStatuses = [

            "approved",
            "completed",
            "rejected",
            "cancelled",
            "canceled",
            "served",
            "ready"

        ];


        return !completedStatuses.includes(
            currentStatus
        );
    }


    // =================================================
    // DOCUMENT REQUEST
    // =================================================

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/documents/${user.id}`
            );


        if (response.ok) {

            const data =
                await response.json();


            if (
                data.request &&
                isActiveRequest(
                    data.request.status
                )
            ) {

                pendingCount++;
            }
        }

    }

    catch (error) {

        console.error(
            "Document request count error:",
            error
        );
    }


    // =================================================
    // LEAVE REQUEST
    // =================================================

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/leave/${user.id}`
            );


        if (response.ok) {

            const data =
                await response.json();


            if (
                data.request &&
                isActiveRequest(
                    data.request.status
                )
            ) {

                pendingCount++;
            }
        }

    }

    catch (error) {

        console.error(
            "Leave request count error:",
            error
        );
    }


    // =================================================
    // DIGITAL QUEUE
    // =================================================

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/queue/user/${user.id}`
            );


        if (response.ok) {

            const data =
                await response.json();


            if (
                data.token &&
                isActiveRequest(
                    data.token.status
                )
            ) {

                pendingCount++;
            }
        }

    }

    catch (error) {

        console.error(
            "Queue count error:",
            error
        );
    }


    countElement.textContent =
        pendingCount;
}


if (
    document.getElementById(
        "pendingRequestsCount"
    )
) {

    updatePendingRequestsCount();
}


// =====================================================
// ADMIN CAMPUS OVERVIEW
// =====================================================

async function loadAdminOverview() {

    const totalStudents =
        document.getElementById(
            "totalStudents"
        );

    const pendingRequests =
        document.getElementById(
            "pendingRequests"
        );

    const activeProblems =
        document.getElementById(
            "activeProblems"
        );

    const queueTokens =
        document.getElementById(
            "queueTokens"
        );


    if (
        !totalStudents &&
        !pendingRequests &&
        !activeProblems &&
        !queueTokens
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/admin/stats"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load admin overview."
            );
        }


        if (totalStudents) {
            totalStudents.textContent =
                data.totalStudents ?? 0;
        }


        if (pendingRequests) {
            pendingRequests.textContent =
                data.pendingRequests ?? 0;
        }


        if (activeProblems) {
            activeProblems.textContent =
                data.activeProblems ?? 0;
        }


        if (queueTokens) {
            queueTokens.textContent =
                data.queueTokens ?? 0;
        }

    }

    catch (error) {

        console.error(
            "Admin overview error:",
            error
        );


        if (totalStudents) {
            totalStudents.textContent =
                "0";
        }


        if (pendingRequests) {
            pendingRequests.textContent =
                "0";
        }


        if (activeProblems) {
            activeProblems.textContent =
                "0";
        }


        if (queueTokens) {
            queueTokens.textContent =
                "0";
        }
    }
}


loadAdminOverview();


// =====================================================
// ADMIN - FEE MANAGEMENT
// =====================================================

const feeForm =
    document.getElementById(
        "feeForm"
    );

if (feeForm) {

    feeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const studentId =
                document.getElementById(
                    "studentId"
                ).value.trim();


            const courseFee =
                document.getElementById(
                    "courseFee"
                ).value;


            const hostelFee =
                document.getElementById(
                    "hostelFee"
                ).value;


            const message =
                document.getElementById(
                    "feeMessage"
                );


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/admin/fees",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                studentId:
                                    studentId,

                                courseFee:
                                    Number(
                                        courseFee
                                    ),

                                hostelFee:
                                    Number(
                                        hostelFee
                                    )
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to save fee details."
                    );
                }


                message.style.display =
                    "block";


                message.innerHTML = `

                    <div class="request-card">

                        <h3>
                            Fee Details Saved ✅
                        </h3>

                        <p>
                            ${data.message}
                        </p>

                        <p>
                            <strong>
                                Total Fee:
                            </strong>

                            ₹${Number(
                                data.totalAmount
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </p>

                    </div>

                `;


                feeForm.reset();

            }

            catch (error) {

                console.error(
                    "Fee management error:",
                    error
                );


                message.style.display =
                    "block";


                message.innerHTML = `

                    <div class="request-card">

                        <h3>
                            Unable to Save Fee Details ⚠️
                        </h3>

                        <p>
                            ${escapeHTML(
                                error.message
                            )}
                        </p>

                    </div>

                `;
            }
        }
    );
}


// =====================================================
// ADMIN - LOAD FEE RECORDS
// =====================================================

async function loadAdminFeeRecords() {

    const container =
        document.getElementById(
            "feeRecords"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/admin/fees"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load fee records."
            );
        }


        if (!data.length) {

            container.innerHTML = `

                <div class="request-card">

                    <h3>
                        No Fee Records
                    </h3>

                    <p>
                        No student fee records have been created yet.
                    </p>

                </div>

            `;

            return;
        }


        container.innerHTML = "";


        data.forEach(
            function (fee) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "request-card";


                card.innerHTML = `

                    <div>

                        <h3>
                            ${escapeHTML(
                                fee.name
                            )}
                        </h3>

                        <p>
                            <strong>
                                Registration No:
                            </strong>

                            ${escapeHTML(
                                fee.user_id
                            )}
                        </p>

                        <p>
                            <strong>
                                Department:
                            </strong>

                            ${escapeHTML(
                                fee.department ||
                                "Not available"
                            )}
                        </p>

                        <p>
                            <strong>
                                Course Fee:
                            </strong>

                            ₹${Number(
                                fee.course_fee
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </p>

                        <p>
                            <strong>
                                Hostel Fee:
                            </strong>

                            ₹${Number(
                                fee.hostel_fee
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </p>

                        <p>
                            <strong>
                                Total Fee:
                            </strong>

                            ₹${Number(
                                fee.total_amount
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </p>

                        <p>
                            <strong>
                                Paid:
                            </strong>

                            ₹${Number(
                                fee.paid_amount
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </p>

                        <p>
                            <strong>
                                Remaining:
                            </strong>

                            ₹${Number(
                                fee.remaining_amount
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </p>

                    </div>

                    <span class="status ${
                        fee.payment_status === "Paid"
                            ? "approved"
                            : "pending"
                    }">

                        ${escapeHTML(
                            fee.payment_status
                        )}

                    </span>

                `;


                container.appendChild(
                    card
                );
            }
        );

    }

    catch (error) {

        console.error(
            "Fee records error:",
            error
        );


        container.innerHTML = `

            <div class="request-card">

                <h3>
                    Unable to Load Fee Records ⚠️
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>

        `;
    }
}


if (
    document.getElementById(
        "feeRecords"
    )
) {

    loadAdminFeeRecords();
}


// =====================================================
// STUDENT FEE PAYMENT FORM
// =====================================================

const studentFeePaymentForm =
    document.getElementById(
        "studentFeePaymentForm"
    );


if (studentFeePaymentForm) {

    studentFeePaymentForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const paymentData = {

                name:
                    document.getElementById(
                        "paymentName"
                    ).value.trim(),

                regdNo:
                    document.getElementById(
                        "paymentRegdNo"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "paymentPhone"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "paymentEmail"
                    ).value.trim(),

                course:
                    document.getElementById(
                        "paymentCourse"
                    ).value,

                branch:
                    document.getElementById(
                        "paymentBranch"
                    ).value,

                feeType:
                    document.getElementById(
                        "paymentFeeType"
                    ).value,

                amount:
                    document.getElementById(
                        "paymentAmount"
                    ).value,

                date:
                    document.getElementById(
                        "paymentDate"
                    ).value
            };


            sessionStorage.setItem(
                "campusEasePayment",
                JSON.stringify(
                    paymentData
                )
            );


            window.location.href =
                "payment.html";
        }
    );
}


// =====================================================
// PAYMENT CONFIRMATION PAGE
// =====================================================

const paymentPage =
    document.getElementById(
        "confirmName"
    );


if (paymentPage) {

    const storedPayment =
        sessionStorage.getItem(
            "campusEasePayment"
        );


    if (storedPayment) {

        try {

            const paymentData =
                JSON.parse(
                    storedPayment
                );


            document.getElementById(
                "confirmName"
            ).textContent =
                paymentData.name ||
                "-";


            document.getElementById(
                "confirmRegdNo"
            ).textContent =
                paymentData.regdNo ||
                "-";


            document.getElementById(
                "confirmPhone"
            ).textContent =
                paymentData.phone ||
                "-";


            document.getElementById(
                "confirmEmail"
            ).textContent =
                paymentData.email ||
                "-";


            document.getElementById(
                "confirmCourse"
            ).textContent =
                paymentData.course ||
                "-";


            document.getElementById(
                "confirmBranch"
            ).textContent =
                paymentData.branch ||
                "-";


            document.getElementById(
                "confirmFeeType"
            ).textContent =
                paymentData.feeType ||
                "-";


            document.getElementById(
                "confirmAmount"
            ).textContent =
                "₹" +
                Number(
                    paymentData.amount ||
                    0
                ).toLocaleString(
                    "en-IN"
                );

        }

        catch (error) {

            console.error(
                "Payment data error:",
                error
            );
        }

    }

    else {

        document.getElementById(
            "confirmName"
        ).textContent =
            "No payment data";
    }
}


// =====================================================
// DEMO PAYMENT
// =====================================================

const makePaymentBtn =
    document.getElementById(
        "makePaymentBtn"
    );


if (makePaymentBtn) {

    makePaymentBtn.addEventListener(
        "click",
        async function () {

            const storedPayment =
                sessionStorage.getItem(
                    "campusEasePayment"
                );


            if (!storedPayment) {

                alert(
                    "Payment information not found."
                );

                return;
            }


            const paymentData =
                JSON.parse(
                    storedPayment
                );


            const selectedMethod =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                );


            if (!selectedMethod) {

                alert(
                    "Please select a payment method."
                );

                return;
            }


            const transactionId =
                "CE" +
                Date.now();


            const paymentResult =
                document.getElementById(
                    "paymentResult"
                );


            makePaymentBtn.disabled =
                true;


            makePaymentBtn.textContent =
                "Processing Payment...";


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/fees/pay",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name:
                                    paymentData.name,

                                regdNo:
                                    paymentData.regdNo,

                                phone:
                                    paymentData.phone,

                                email:
                                    paymentData.email,

                                course:
                                    paymentData.course,

                                branch:
                                    paymentData.branch,

                                feeType:
                                    paymentData.feeType,

                                amount:
                                    Number(
                                        paymentData.amount
                                    ),

                                date:
                                    paymentData.date,

                                paymentMethod:
                                    selectedMethod.value,

                                transactionId:
                                    transactionId
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Payment failed."
                    );
                }


                paymentResult.style.display =
                    "block";


                paymentResult.innerHTML = `

                    <div class="payment-success">

                        <h3>
                            Payment Successful ✅
                        </h3>

                        <p>
                            Your payment has been
                            successfully recorded.
                        </p>

                        <p>
                            <strong>
                                Transaction ID:
                            </strong>

                            ${escapeHTML(
                                transactionId
                            )}
                        </p>

                        <p>
                            <strong>
                                Amount Paid:
                            </strong>

                            ₹${Number(
                                paymentData.amount
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </p>

                        <p>
                            <strong>
                                Payment Method:
                            </strong>

                            ${escapeHTML(
                                selectedMethod.value
                            )}
                        </p>

                        <p>
                            <strong>
                                Remaining Fee:
                            </strong>

                            ₹${Number(
                                data.remainingAmount
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </p>

                        <button
                            type="button"
                            class="primary-btn"
                            onclick="window.location.href='dashboard.html'"
                        >
                            Back to Dashboard
                        </button>

                    </div>

                `;


                makePaymentBtn.style.display =
                    "none";


                sessionStorage.setItem(
                    "campusEaseLastPayment",
                    JSON.stringify({

                        ...paymentData,

                        transactionId:
                            transactionId,

                        paymentMethod:
                            selectedMethod.value
                    })
                );

            }

            catch (error) {

                console.error(
                    "Payment error:",
                    error
                );


                alert(
                    error.message
                );


                makePaymentBtn.disabled =
                    false;


                makePaymentBtn.textContent =
                    "Pay Now";
            }
        }
    );
}
// =====================================================
// FACULTY DASHBOARD
// =====================================================

const facultyDashboard =
    document.getElementById("facultyName");

if (facultyDashboard) {

    const facultyUser =
        getCurrentUser();

    if (facultyUser) {

        const facultyName =
            document.getElementById("facultyName");

        const facultyProfileName =
            document.getElementById("facultyProfileName");

        const facultyDepartment =
            document.getElementById("facultyDepartment");

        if (facultyName) {
            facultyName.textContent =
                facultyUser.name || "Faculty";
        }

        if (facultyProfileName) {
            facultyProfileName.textContent =
                facultyUser.name || "Faculty";
        }

        if (facultyDepartment) {
            facultyDepartment.textContent =
                facultyUser.department ||
                "Department";
        }

    }

}
// =====================================================
// FACULTY ATTENDANCE - DATABASE VERSION
// =====================================================

if (document.getElementById("attendanceStudentList")) {

    const currentUser = getCurrentUser();

    const loadStudentsBtn =
        document.getElementById("loadStudentsBtn");

    const attendanceStudentList =
        document.getElementById("attendanceStudentList");

    const attendanceStatus =
        document.getElementById("attendanceStatus");

    const attendanceMessage =
        document.getElementById("attendanceMessage");

    const totalAttendanceStudents =
        document.getElementById("totalAttendanceStudents");

    const presentStudents =
        document.getElementById("presentStudents");

    const absentStudents =
        document.getElementById("absentStudents");

    const attendancePercentage =
        document.getElementById("attendancePercentage");

    const saveAttendanceBtn =
        document.getElementById("saveAttendanceBtn");

    let students = [];


    // -----------------------------------------
    // LOAD STUDENTS
    // -----------------------------------------

    async function loadAttendanceStudents() {

        if (!currentUser) {
            return;
        }

        const section =
            document.getElementById("attendanceSection").value;

        try {

            const response = await fetch(
                `http://localhost:5000/api/faculty/students/${currentUser.id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load students."
                );
            }

            students = data.students || [];

            const filteredStudents =
                section === "All"
                    ? students
                    : students.filter(
                        student =>
                            student.section === section
                    );

            displayAttendanceStudents(
                filteredStudents
            );

        } catch (error) {

            console.error(error);

            attendanceMessage.textContent =
                "Unable to load students.";

        }

    }


    // -----------------------------------------
    // DISPLAY STUDENTS
    // -----------------------------------------

    function displayAttendanceStudents(studentData) {

        attendanceStudentList.innerHTML = "";

        if (studentData.length === 0) {

            attendanceStudentList.innerHTML = `
                <div class="students-empty">
                    No students found.
                </div>
            `;

            return;
        }


        studentData.forEach(student => {

            const row =
                document.createElement("div");

            row.className =
                "attendance-student-row";


            row.innerHTML = `

                <div class="attendance-student-info">

                    <strong>
                        ${student.name}
                    </strong>

                    <span>
                        ${student.user_id}
                    </span>

                </div>


                <div class="attendance-buttons">

                    <label>
                        <input
                            type="radio"
                            name="attendance_${student.id}"
                            value="Present"
                            checked
                            data-student-id="${student.id}"
                        >
                        Present
                    </label>


                    <label>
                        <input
                            type="radio"
                            name="attendance_${student.id}"
                            value="Absent"
                            data-student-id="${student.id}"
                        >
                        Absent
                    </label>

                </div>

            `;


            attendanceStudentList.appendChild(row);

        });


        updateAttendanceSummary();

    }


    // -----------------------------------------
    // UPDATE SUMMARY
    // -----------------------------------------

    function updateAttendanceSummary() {

        const rows =
            attendanceStudentList.querySelectorAll(
                ".attendance-student-row"
            );


        let present = 0;
        let absent = 0;


        rows.forEach(row => {

            const selected =
                row.querySelector(
                    'input[type="radio"]:checked'
                );


            if (!selected) return;


            if (selected.value === "Present") {
                present++;
            } else {
                absent++;
            }

        });


        const total =
            present + absent;


        const percentage =
            total > 0
                ? Math.round(
                    (present / total) * 100
                )
                : 0;


        totalAttendanceStudents.textContent =
            total;

        presentStudents.textContent =
            present;

        absentStudents.textContent =
            absent;

        attendancePercentage.textContent =
            percentage + "%";

    }


    // -----------------------------------------
    // RADIO CHANGE
    // -----------------------------------------

    attendanceStudentList.addEventListener(
        "change",
        updateAttendanceSummary
    );


    // -----------------------------------------
    // LOAD BUTTON
    // -----------------------------------------

    if (loadStudentsBtn) {

        loadStudentsBtn.addEventListener(
            "click",
            loadAttendanceStudents
        );

    }


    // -----------------------------------------
    // SECTION CHANGE
    // -----------------------------------------

    const sectionSelect =
        document.getElementById(
            "attendanceSection"
        );


    if (sectionSelect) {

        sectionSelect.addEventListener(
            "change",
            loadAttendanceStudents
        );

    }


    // -----------------------------------------
    // SAVE ATTENDANCE
    // -----------------------------------------

    if (saveAttendanceBtn) {

        saveAttendanceBtn.addEventListener(
            "click",
            async function () {

                const subject =
                    document.getElementById(
                        "attendanceSubject"
                    ).value;

                const section =
                    document.getElementById(
                        "attendanceSection"
                    ).value;

                const date =
                    document.getElementById(
                        "attendanceDate"
                    ).value;


                if (!subject || !date) {

                    attendanceMessage.textContent =
                        "Please select subject and date.";

                    return;
                }


                const rows =
                    attendanceStudentList.querySelectorAll(
                        ".attendance-student-row"
                    );


                if (rows.length === 0) {

                    attendanceMessage.textContent =
                        "Please load students first.";

                    return;
                }


                const attendanceData = [];


                rows.forEach(row => {

                    const selected =
                        row.querySelector(
                            'input[type="radio"]:checked'
                        );


                    if (selected) {

                        attendanceData.push({
                            studentUserId:
                                selected.dataset.studentId,

                            status:
                                selected.value
                        });

                    }

                });


                try {

                    saveAttendanceBtn.disabled = true;

                    saveAttendanceBtn.textContent =
                        "Saving...";


                    const response =
                        await fetch(
                            "http://localhost:5000/api/faculty/attendance",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    facultyUserId:
                                        currentUser.id,

                                    subject:
                                        subject,

                                    section:
                                        section,

                                    attendanceDate:
                                        date,

                                    students:
                                        attendanceData
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {
                        throw new Error(
                            data.message ||
                            "Failed to save attendance."
                        );
                    }


                    attendanceMessage.textContent =
                        "✓ Attendance saved successfully.";


                } catch (error) {

                    console.error(error);

                    attendanceMessage.textContent =
                        error.message;


                } finally {

                    saveAttendanceBtn.disabled =
                        false;

                    saveAttendanceBtn.textContent =
                        "Save Attendance";

                }

            }
        );

    }

}


// =====================================================
// DEMO STUDENT DATA
// =====================================================

function loadFacultyStudents() {

    const students = [

        {
            id: 1,
            name: "Ananya Das",
            regNo: "CE2026001",
            attendance: 92
        },

        {
            id: 2,
            name: "Riya Sharma",
            regNo: "CE2026002",
            attendance: 88
        },

        {
            id: 3,
            name: "Priya Singh",
            regNo: "CE2026003",
            attendance: 95
        },

        {
            id: 4,
            name: "Sneha Patra",
            regNo: "CE2026004",
            attendance: 84
        },

        {
            id: 5,
            name: "Neha Sahu",
            regNo: "CE2026005",
            attendance: 79
        },

        {
            id: 6,
            name: "Aditya Mishra",
            regNo: "CE2026006",
            attendance: 91
        },

        {
            id: 7,
            name: "Rahul Behera",
            regNo: "CE2026007",
            attendance: 86
        },

        {
            id: 8,
            name: "Sakshi Rout",
            regNo: "CE2026008",
            attendance: 93
        }

    ];


    const container =
        document.getElementById(
            "attendanceStudentList"
        );

    if (!container) return;


    container.innerHTML = "";


    students.forEach(
        function (student, index) {

            const studentCard =
                document.createElement("div");

            studentCard.className =
                "attendance-student";


            studentCard.innerHTML = `

                <div class="student-number">
                    ${index + 1}
                </div>


                <div class="attendance-student-name">

                    <strong>
                        ${student.name}
                    </strong>

                    <span>
                        ${student.regNo}
                    </span>

                </div>


                <div class="student-attendance-percent">

                    Attendance:
                    <strong>
                        ${student.attendance}%
                    </strong>

                </div>


                <div class="attendance-buttons">

                    <button
                        type="button"
                        class="attendance-btn present active"
                        data-student-id="${student.id}"
                        data-status="Present"
                    >
                        ✓ Present
                    </button>


                    <button
                        type="button"
                        class="attendance-btn absent"
                        data-student-id="${student.id}"
                        data-status="Absent"
                    >
                        ✕ Absent
                    </button>

                </div>

            `;


            container.appendChild(
                studentCard
            );

        }
    );


    updateAttendanceSummary();


    document.getElementById(
        "attendanceStatus"
    ).textContent = "Ready";


    document.getElementById(
        "attendanceStatus"
    ).className =
        "status processing";

}


// =====================================================
// PRESENT / ABSENT BUTTONS
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        const attendanceButton =
            event.target.closest(
                ".attendance-btn"
            );

        if (!attendanceButton) {
            return;
        }


        const studentCard =
            attendanceButton.closest(
                ".attendance-student"
            );

        if (!studentCard) {
            return;
        }


        const buttons =
            studentCard.querySelectorAll(
                ".attendance-btn"
            );


        buttons.forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );

            }
        );


        attendanceButton.classList.add(
            "active"
        );


        updateAttendanceSummary();

    }
);


// =====================================================
// UPDATE ATTENDANCE SUMMARY
// =====================================================

function updateAttendanceSummary() {

    const studentCards =
        document.querySelectorAll(
            ".attendance-student"
        );


    const total =
        studentCards.length;


    let present = 0;
    let absent = 0;


    studentCards.forEach(
        function (card) {

            const activeButton =
                card.querySelector(
                    ".attendance-btn.active"
                );


            if (!activeButton) {
                return;
            }


            const status =
                activeButton.dataset.status;


            if (status === "Present") {

                present++;

            } else if (status === "Absent") {

                absent++;

            }

        }
    );


    const percentage =
        total > 0
            ? Math.round(
                (present / total) * 100
            )
            : 0;


    const totalElement =
        document.getElementById(
            "totalAttendanceStudents"
        );

    const presentElement =
        document.getElementById(
            "presentStudents"
        );

    const absentElement =
        document.getElementById(
            "absentStudents"
        );

    const percentageElement =
        document.getElementById(
            "attendancePercentage"
        );


    if (totalElement) {
        totalElement.textContent =
            total;
    }

    if (presentElement) {
        presentElement.textContent =
            present;
    }

    if (absentElement) {
        absentElement.textContent =
            absent;
    }

    if (percentageElement) {
        percentageElement.textContent =
            percentage + "%";
    }

}


// =====================================================
// SAVE ATTENDANCE — DEMO
// =====================================================

const saveAttendanceBtn =
    document.getElementById(
        "saveAttendanceBtn"
    );


if (saveAttendanceBtn) {

    saveAttendanceBtn.addEventListener(
        "click",
        function () {

            const studentCards =
                document.querySelectorAll(
                    ".attendance-student"
                );


            if (studentCards.length === 0) {

                alert(
                    "Please load students first."
                );

                return;
            }


            const subject =
                document.getElementById(
                    "attendanceSubject"
                ).value;


            const section =
                document.getElementById(
                    "attendanceSection"
                ).value;


            const date =
                document.getElementById(
                    "attendanceDate"
                ).value;


            const attendanceRecords = [];


            studentCards.forEach(
                function (card) {

                    const activeButton =
                        card.querySelector(
                            ".attendance-btn.active"
                        );


                    const studentId =
                        activeButton
                            ?.dataset
                            .studentId;


                    const status =
                        activeButton
                            ?.dataset
                            .status;


                    attendanceRecords.push({

                        studentId:
                            studentId,

                        status:
                            status

                    });

                }
            );


            console.log(
                "Attendance Saved:",
                {
                    subject,
                    section,
                    date,
                    attendanceRecords
                }
            );


            const message =
                document.getElementById(
                    "attendanceMessage"
                );


            if (message) {

                message.textContent =
                    "Attendance saved successfully for " +
                    subject +
                    " — Section " +
                    section +
                    " on " +
                    date +
                    ".";

            }


            document.getElementById(
                "attendanceStatus"
            ).textContent =
                "Saved";


            document.getElementById(
                "attendanceStatus"
            ).className =
                "status processing";


            alert(
                "Attendance saved successfully!"
            );

        }
    );

}
// =====================================================
// FACULTY STUDENTS
// =====================================================

const facultyStudentsList =
    document.getElementById(
        "facultyStudentsList"
    );


if (facultyStudentsList) {

    const currentUser = getCurrentUser();

    let facultyStudents = [];

    async function loadFacultyStudents() {

        if (!currentUser || currentUser.role !== "faculty") {
            facultyStudentsList.innerHTML = `
                <div class="students-empty">
                    <h3>Faculty login required</h3>
                </div>
            `;
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:5000/api/faculty/students/${currentUser.id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load students"
                );
            }

            facultyStudents = data.students || [];

            displayFacultyStudents();

        } catch (error) {

            console.error(
                "Faculty students error:",
                error
            );

            facultyStudentsList.innerHTML = `
                <div class="students-empty">
                    <div style="font-size:35px;">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load students
                    </h3>

                    <p>
                        Please make sure the CampusEase server is running.
                    </p>
                </div>
            `;
        }
    }


    function displayFacultyStudents() {

        const searchInput =
            document.getElementById("studentSearch");

        const sectionFilter =
            document.getElementById("studentSectionFilter");


        const search =
            searchInput
                ? searchInput.value.trim().toLowerCase()
                : "";


        const section =
            sectionFilter
                ? sectionFilter.value
                : "all";


        const filteredStudents =
            facultyStudents.filter(function (student) {

                const name =
                    String(student.name || "").toLowerCase();

                const regNo =
                    String(student.user_id || "").toLowerCase();


                const matchesSearch =
                    name.includes(search) ||
                    regNo.includes(search);


                const matchesSection =
                    section === "all" ||
                    student.section === section;


                return (
                    matchesSearch &&
                    matchesSection
                );

            });


        facultyStudentsList.innerHTML = "";


        if (filteredStudents.length === 0) {

            facultyStudentsList.innerHTML = `

                <div class="students-empty">

                    <div style="font-size:35px;">
                        🔍
                    </div>

                    <h3>
                        No students found
                    </h3>

                    <p>
                        No matching students were found
                        in your department and section.
                    </p>

                </div>

            `;

            updateStudentSummary(facultyStudents);

            return;
        }


        filteredStudents.forEach(function (student) {

            const initials =
                String(student.name || "Student")
                    .split(" ")
                    .map(word =>
                        word.charAt(0)
                    )
                    .join("")
                    .substring(0, 2);


            const card =
                document.createElement("div");


            card.className =
                "faculty-student-card";


            card.innerHTML = `

                <div class="faculty-student-top">

                    <div class="faculty-student-avatar">
                        ${initials}
                    </div>

                    <div class="faculty-student-name">

                        <h3>
                            ${student.name}
                        </h3>

                        <p>
                            ${student.user_id || "No ID"}
                        </p>

                    </div>

                </div>


                <div class="faculty-student-details">

                    <div class="faculty-student-detail">

                        <span>
                            Department
                        </span>

                        <strong>
                            ${student.department || "—"}
                        </strong>

                    </div>


                    <div class="faculty-student-detail">

                        <span>
                            Section
                        </span>

                        <strong>
                            ${student.section || "—"}
                        </strong>

                    </div>


                    <div class="faculty-student-detail">

                        <span>
                            Email
                        </span>

                        <strong>
                            ${student.email || "—"}
                        </strong>

                    </div>


                    <div class="faculty-student-detail">

                        <span>
                            Status
                        </span>

                        <strong>
                            Active
                        </strong>

                    </div>

                </div>


                <div class="faculty-student-attendance">

                    <div class="faculty-student-attendance-header">

                        <span>
                            Attendance
                        </span>

                        <strong>
                            —
                        </strong>

                    </div>


                    <div class="attendance-progress">

                        <div
                            class="attendance-progress-bar"
                            style="width:0%"
                        ></div>

                    </div>

                </div>

            `;


            facultyStudentsList.appendChild(card);

        });


        updateStudentSummary(facultyStudents);

    }


    function updateStudentSummary(students) {

        const total =
            students.length;


        const sectionA =
            students.filter(
                student =>
                    student.section === "A"
            ).length;


        const sectionB =
            students.filter(
                student =>
                    student.section === "B"
            ).length;


        const totalElement =
            document.getElementById(
                "studentsTotal"
            );

        const sectionAElement =
            document.getElementById(
                "studentsSectionA"
            );

        const sectionBElement =
            document.getElementById(
                "studentsSectionB"
            );

        const averageElement =
            document.getElementById(
                "studentsAverageAttendance"
            );

        const statusElement =
            document.getElementById(
                "studentListStatus"
            );


        if (totalElement) {
            totalElement.textContent = total;
        }

        if (sectionAElement) {
            sectionAElement.textContent = sectionA;
        }

        if (sectionBElement) {
            sectionBElement.textContent = sectionB;
        }

        if (averageElement) {
            averageElement.textContent = "—";
        }

        if (statusElement) {
            statusElement.textContent =
                total + " Students";
        }

    }


    const searchInput =
        document.getElementById(
            "studentSearch"
        );


    const sectionFilter =
        document.getElementById(
            "studentSectionFilter"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            displayFacultyStudents
        );

    }


    if (sectionFilter) {

        sectionFilter.addEventListener(
            "change",
            displayFacultyStudents
        );

    }


    loadFacultyStudents();

}
// =====================================================
// FACULTY ASSIGNMENTS - DATABASE VERSION
// =====================================================

if (document.getElementById("facultyAssignmentForm")) {

    const currentUser = getCurrentUser();

    const assignmentForm =
        document.getElementById("facultyAssignmentForm");

    const assignmentList =
        document.getElementById("facultyAssignmentList");

    const assignmentMessage =
        document.getElementById("assignmentMessage");

    const assignmentTotal =
        document.getElementById("assignmentTotal");

    const assignmentActive =
        document.getElementById("assignmentActive");

    const assignmentDueSoon =
        document.getElementById("assignmentDueSoon");

    const assignmentOverdue =
        document.getElementById("assignmentOverdue");


    let assignments = [];


    // -----------------------------------------
    // LOAD ASSIGNMENTS
    // -----------------------------------------

    async function loadAssignments() {

        if (!currentUser) return;

        try {

            const response = await fetch(
                `http://localhost:5000/api/faculty/assignments/${currentUser.id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load assignments."
                );
            }

            assignments =
                data.assignments || [];

            displayAssignments();

        } catch (error) {

            console.error(error);

            assignmentMessage.textContent =
                "Unable to load assignments.";

        }
    }


    // -----------------------------------------
    // DISPLAY ASSIGNMENTS
    // -----------------------------------------

    function displayAssignments() {

        assignmentList.innerHTML = "";

        let active = 0;
        let dueSoon = 0;
        let overdue = 0;


        assignments.forEach(assignment => {

            const today =
                new Date();

            const dueDate =
                new Date(
                    assignment.due_date
                );


            const difference =
                Math.ceil(
                    (
                        dueDate - today
                    ) /
                    (1000 * 60 * 60 * 24)
                );


            let status =
                "Active";


            if (difference < 0) {

                status = "Overdue";
                overdue++;

            } else if (difference <= 3) {

                status = "Due Soon";
                dueSoon++;

            } else {

                active++;

            }


            const card =
                document.createElement("div");

            card.className =
                "faculty-assignment-card";


            card.innerHTML = `

                <div class="assignment-card-header">

                    <div>

                        <h3>
                            ${assignment.title}
                        </h3>

                        <p>
                            ${assignment.subject}
                            • Section ${assignment.section}
                        </p>

                    </div>

                    <span class="assignment-status">
                        ${status}
                    </span>

                </div>


                <div class="assignment-card-body">

                    <p>
                        ${assignment.description || "No description provided."}
                    </p>

                    <div class="assignment-due">

                        <strong>
                            Due:
                        </strong>

                        ${assignment.due_date}

                    </div>

                </div>


                <div class="assignment-card-actions">

                    <button
                        class="delete-assignment-btn"
                        data-id="${assignment.id}"
                    >
                        Delete
                    </button>

                </div>

            `;


            assignmentList.appendChild(card);

        });


        if (assignmentTotal) {
            assignmentTotal.textContent =
                assignments.length;
        }

        if (assignmentActive) {
            assignmentActive.textContent =
                active;
        }

        if (assignmentDueSoon) {
            assignmentDueSoon.textContent =
                dueSoon;
        }

        if (assignmentOverdue) {
            assignmentOverdue.textContent =
                overdue;
        }


        if (assignments.length === 0) {

            assignmentList.innerHTML = `
                <div class="students-empty">
                    <h3>No assignments yet</h3>
                    <p>Create your first assignment above.</p>
                </div>
            `;

        }

    }


    // -----------------------------------------
    // CREATE ASSIGNMENT
    // -----------------------------------------

    assignmentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const title =
                document.getElementById(
                    "assignmentTitle"
                ).value.trim();

            const subject =
                document.getElementById(
                    "assignmentSubject"
                ).value;

            const section =
                document.getElementById(
                    "assignmentSection"
                ).value;

            const dueDate =
                document.getElementById(
                    "assignmentDueDate"
                ).value;

            const description =
                document.getElementById(
                    "assignmentDescription"
                ).value.trim();


            if (
                !title ||
                !subject ||
                !section ||
                !dueDate
            ) {

                assignmentMessage.textContent =
                    "Please fill all required fields.";

                return;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/faculty/assignments",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                facultyUserId:
                                    currentUser.id,

                                title:
                                    title,

                                subject:
                                    subject,

                                section:
                                    section,

                                dueDate:
                                    dueDate,

                                description:
                                    description

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to create assignment."
                    );
                }


                assignmentMessage.textContent =
                    "✓ Assignment created successfully.";

                assignmentForm.reset();

                loadAssignments();


            } catch (error) {

                console.error(error);

                assignmentMessage.textContent =
                    error.message;

            }

        }
    );


    // -----------------------------------------
    // DELETE ASSIGNMENT
    // -----------------------------------------

    assignmentList.addEventListener(
        "click",
        async function (event) {

            if (
                !event.target.classList.contains(
                    "delete-assignment-btn"
                )
            ) {
                return;
            }


            const id =
                event.target.dataset.id;


            if (!confirm(
                "Delete this assignment?"
            )) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `http://localhost:5000/api/faculty/assignments/${id}`,
                        {
                            method: "DELETE"
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to delete assignment."
                    );
                }


                loadAssignments();


            } catch (error) {

                console.error(error);

                assignmentMessage.textContent =
                    error.message;

            }

        }
    );


    loadAssignments();

}
// =====================================================
// FACULTY REQUESTS - DATABASE VERSION
// =====================================================

if (document.getElementById("facultyRequestList")) {

    const currentUser = getCurrentUser();

    const requestList =
        document.getElementById("facultyRequestList");

    const requestTotal =
        document.getElementById("requestTotal");

    const requestPending =
        document.getElementById("requestPending");

    const requestApproved =
        document.getElementById("requestApproved");

    const requestRejected =
        document.getElementById("requestRejected");

    const requestStatus =
        document.getElementById("requestStatus");

    let facultyRequests = [];


    // -----------------------------------------
    // LOAD REQUESTS
    // -----------------------------------------

    async function loadFacultyRequests() {

        if (!currentUser) return;

        try {

            const response = await fetch(
                `http://localhost:5000/api/faculty/requests/${currentUser.id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load requests."
                );
            }

            facultyRequests =
                data.requests || [];

            displayFacultyRequests();

        } catch (error) {

            console.error(error);

            if (requestStatus) {
                requestStatus.textContent =
                    "Unable to load requests.";
            }
        }
    }


    // -----------------------------------------
    // DISPLAY REQUESTS
    // -----------------------------------------

    function displayFacultyRequests() {

        requestList.innerHTML = "";

        let pending = 0;
        let approved = 0;
        let rejected = 0;


        facultyRequests.forEach(request => {

            if (request.status === "Pending") {
                pending++;
            }

            if (request.status === "Approved") {
                approved++;
            }

            if (request.status === "Rejected") {
                rejected++;
            }


            const card =
                document.createElement("div");

            card.className =
                "faculty-request-card";


            card.innerHTML = `

                <div class="request-card-header">

                    <div>

                        <h3>
                            ${request.request_type}
                        </h3>

                        <p>
                            ${request.student_name}
                            • ${request.student_id}
                        </p>

                    </div>

                    <span class="request-status-badge">
                        ${request.status}
                    </span>

                </div>


                <div class="request-card-body">

                    ${
                        request.subject
                            ? `<p>
                                <strong>Subject:</strong>
                                ${request.subject}
                               </p>`
                            : ""
                    }

                    <p>
                        ${request.message}
                    </p>

                    <small>
                        Request Date:
                        ${request.request_date}
                    </small>

                </div>


                ${
                    request.status === "Pending"
                    ?
                    `
                    <div class="request-card-actions">

                        <button
                            class="approve-request-btn"
                            data-id="${request.id}"
                        >
                            Approve
                        </button>

                        <button
                            class="reject-request-btn"
                            data-id="${request.id}"
                        >
                            Reject
                        </button>

                    </div>
                    `
                    :
                    ""
                }

            `;


            requestList.appendChild(card);

        });


        if (requestTotal)
            requestTotal.textContent =
                facultyRequests.length;

        if (requestPending)
            requestPending.textContent =
                pending;

        if (requestApproved)
            requestApproved.textContent =
                approved;

        if (requestRejected)
            requestRejected.textContent =
                rejected;


        if (facultyRequests.length === 0) {

            requestList.innerHTML = `
                <div class="students-empty">

                    <h3>
                        No student requests
                    </h3>

                    <p>
                        New academic requests will appear here.
                    </p>

                </div>
            `;
        }
    }


    // -----------------------------------------
    // APPROVE / REJECT
    // -----------------------------------------

    requestList.addEventListener(
        "click",
        async function (event) {

            let status = null;

            if (
                event.target.classList.contains(
                    "approve-request-btn"
                )
            ) {
                status = "Approved";
            }

            if (
                event.target.classList.contains(
                    "reject-request-btn"
                )
            ) {
                status = "Rejected";
            }

            if (!status) return;


            const requestId =
                event.target.dataset.id;


            try {

                const response =
                    await fetch(
                        `http://localhost:5000/api/faculty/requests/${requestId}/status`,
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


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to update request."
                    );
                }


                if (requestStatus) {

                    requestStatus.textContent =
                        `Request ${status.toLowerCase()} successfully.`;
                }


                loadFacultyRequests();


            } catch (error) {

                console.error(error);

                if (requestStatus) {
                    requestStatus.textContent =
                        error.message;
                }
            }

        }
    );


    loadFacultyRequests();

}
// =====================================================
// FACULTY NOTICES - DATABASE VERSION
// =====================================================

if (document.getElementById("facultyNoticeForm")) {

    const currentUser = getCurrentUser();

    const noticeForm =
        document.getElementById("facultyNoticeForm");

    const noticeList =
        document.getElementById("facultyNoticeList");

    const noticeMessageStatus =
        document.getElementById("noticeMessageStatus");

    const noticeTotal =
        document.getElementById("noticeTotal");

    const noticeAcademic =
        document.getElementById("noticeAcademic");

    const noticeExam =
        document.getElementById("noticeExam");

    const noticeImportant =
        document.getElementById("noticeImportant");

    let notices = [];


    async function loadNotices() {

        try {

            const response = await fetch(
                `http://localhost:5000/api/faculty/notices/${currentUser.id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load notices."
                );
            }

            notices = data.notices || [];

            displayNotices();

        } catch (error) {

            console.error(error);

            noticeMessageStatus.textContent =
                "Unable to load notices.";

        }
    }


    function displayNotices() {

        noticeList.innerHTML = "";

        let academic = 0;
        let exam = 0;
        let important = 0;


        notices.forEach(notice => {

            if (notice.category === "Academic") academic++;
            if (notice.category === "Examination") exam++;
            if (notice.category === "Important") important++;


            const card =
                document.createElement("div");

            card.className =
                "faculty-notice-card";


            card.innerHTML = `

                <div class="notice-card-header">

                    <div>

                        <h3>
                            ${notice.title}
                        </h3>

                        <p>
                            ${notice.category}
                            • ${notice.audience}
                        </p>

                    </div>

                    <span>
                        ${notice.notice_date}
                    </span>

                </div>


                <div class="notice-card-body">

                    <p>
                        ${notice.message}
                    </p>

                </div>


                <div class="notice-card-actions">

                    <button
                        class="delete-notice-btn"
                        data-id="${notice.id}"
                    >
                        Delete
                    </button>

                </div>

            `;


            noticeList.appendChild(card);

        });


        if (noticeTotal)
            noticeTotal.textContent = notices.length;

        if (noticeAcademic)
            noticeAcademic.textContent = academic;

        if (noticeExam)
            noticeExam.textContent = exam;

        if (noticeImportant)
            noticeImportant.textContent = important;


        if (notices.length === 0) {

            noticeList.innerHTML = `
                <div class="students-empty">
                    <h3>No notices yet</h3>
                    <p>Create your first notice above.</p>
                </div>
            `;

        }
    }


    noticeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const title =
                document.getElementById("noticeTitle")
                    .value.trim();

            const category =
                document.getElementById("noticeCategory")
                    .value;

            const audience =
                document.getElementById("noticeAudience")
                    .value;

            const noticeDate =
                document.getElementById("noticeDate")
                    .value;

            const message =
                document.getElementById("noticeMessage")
                    .value.trim();


            if (
                !title ||
                !category ||
                !audience ||
                !noticeDate ||
                !message
            ) {

                noticeMessageStatus.textContent =
                    "Please fill all notice fields.";

                return;
            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/faculty/notices",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                facultyUserId:
                                    currentUser.id,

                                title:
                                    title,

                                category:
                                    category,

                                audience:
                                    audience,

                                noticeDate:
                                    noticeDate,

                                message:
                                    message

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to post notice."
                    );
                }


                noticeMessageStatus.textContent =
                    "✓ Notice posted successfully.";

                noticeForm.reset();

                loadNotices();


            } catch (error) {

                console.error(error);

                noticeMessageStatus.textContent =
                    error.message;

            }

        }
    );


    noticeList.addEventListener(
        "click",
        async function (event) {

            if (
                !event.target.classList.contains(
                    "delete-notice-btn"
                )
            ) {
                return;
            }


            const id =
                event.target.dataset.id;


            if (!confirm("Delete this notice?")) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `http://localhost:5000/api/faculty/notices/${id}`,
                        {
                            method: "DELETE"
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to delete notice."
                    );
                }


                loadNotices();


            } catch (error) {

                console.error(error);

                noticeMessageStatus.textContent =
                    error.message;

            }

        }
    );


    loadNotices();

}
document.addEventListener("DOMContentLoaded", () => {

    const leaveList = document.getElementById("leaveRequestList");

    const total = document.getElementById("totalLeaveRequests");
    const pending = document.getElementById("pendingLeaveRequests");
    const approved = document.getElementById("approvedLeaveRequests");
    const rejected = document.getElementById("rejectedLeaveRequests");


    async function loadLeaveRequests() {

        try {

            const response = await fetch(
                "http://localhost:5000/api/leave"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load requests.");
            }

            const requests = data.requests || data || [];


            /* SUMMARY */

            total.textContent = requests.length;

            pending.textContent =
                requests.filter(
                    r => String(r.status).toLowerCase() === "pending"
                ).length;

            approved.textContent =
                requests.filter(
                    r => String(r.status).toLowerCase() === "approved"
                ).length;

            rejected.textContent =
                requests.filter(
                    r => String(r.status).toLowerCase() === "rejected"
                ).length;


            /* EMPTY */

            if (requests.length === 0) {

                leaveList.innerHTML = `
                    <div class="leave-empty">

                        <h3>
                            No Leave Requests
                        </h3>

                        <p>
                            There are currently no student leave applications.
                        </p>

                    </div>
                `;

                return;
            }


            /* DISPLAY */

            leaveList.innerHTML = requests.map(request => {

                const status =
                    String(request.status || "Pending").toLowerCase();

                const studentName =
                    request.student_name ||
                    request.name ||
                    "Student";

                const studentId =
                    request.student_id ||
                    request.user_id ||
                    "N/A";

                const leaveType =
                    request.leave_type ||
                    request.type ||
                    "General Leave";

                const fromDate =
                    request.from_date ||
                    request.start_date ||
                    "-";

                const toDate =
                    request.to_date ||
                    request.end_date ||
                    "-";

                const reason =
                    request.reason ||
                    "No reason provided";


                return `

                    <div class="request-card">

                        <div>

                            <h3>
                                ${studentName}
                            </h3>

                            <p>
                                <strong>Student ID:</strong>
                                ${studentId}
                            </p>

                            <div class="leave-details">

                                <p>
                                    <strong>Leave Type:</strong>
                                    ${leaveType}
                                </p>

                                <p>
                                    <strong>From:</strong>
                                    ${fromDate}
                                </p>

                                <p>
                                    <strong>To:</strong>
                                    ${toDate}
                                </p>

                                <p>
                                    <strong>Reason:</strong>
                                    ${reason}
                                </p>

                            </div>


                            ${
                                status === "pending"
                                ? `

                                <div class="leave-actions">

                                    <button
                                        class="approve-leave-btn"
                                        onclick="updateLeaveStatus(${request.id}, 'Approved')"
                                    >
                                        ✓ Approve
                                    </button>

                                    <button
                                        class="reject-leave-btn"
                                        onclick="updateLeaveStatus(${request.id}, 'Rejected')"
                                    >
                                        ✕ Reject
                                    </button>

                                </div>

                                `
                                : ""
                            }

                        </div>


                        <span class="status ${status}">
                            ${request.status || "Pending"}
                        </span>

                    </div>

                `;

            }).join("");


        } catch (error) {

            console.error("Leave request error:", error);

            leaveList.innerHTML = `

                <div class="leave-empty">

                    <h3>
                        Unable to Load Leave Requests
                    </h3>

                    <p>
                        ${error.message}
                    </p>

                </div>

            `;

        }

    }


    window.updateLeaveStatus = async function(id, status) {

        try {

            const response = await fetch(
                `http://localhost:5000/api/leave/${id}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "Failed to update leave request."
                );

            }


            alert(
                `Leave request ${status.toLowerCase()} successfully.`
            );


            loadLeaveRequests();


        } catch (error) {

            console.error(error);

            alert(
                "Failed to update leave request: " +
                error.message
            );

        }

    };


    loadLeaveRequests();

});