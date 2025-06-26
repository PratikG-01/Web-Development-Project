let currentPage = 0;

function checkAuthAndRenderProfile() {
  fetch("https://search-college-backend.vercel.app/api/user/myProfile", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res) => {
      if (currentPage === 0) {
        document.getElementById("mostVisitedCollegesContainer").style.display =
          "block";
      }
      if (res.statusCode === 200) {
        document.getElementById("loginPrompt").style.display = "none";
        document.getElementById("savedData").style.display = "block";
        document.getElementById("profileInfo").innerHTML = `
        <div class="dropdown show">
          <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            ${res.data.email}
          </button>
          <div class="dropdown-menu">
            <a class="dropdown-item" id="logoutBtn" href="#">Logout</a>
          </div>
        </div>
        `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
          fetch("https://search-college-backend.vercel.app/api/user/logout", {
            method: "POST",
            credentials: "include",
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.statusCode === 200) {
                window.location.href = "/index.html";
              } else {
                alert(
                  `${res.message}, session expired try logging in again!!!`
                );
                window.location.href = "/index.html";
              }
            })
            .catch((err) => {
              // console.log(err);
            });
        });
      } else {
        document.getElementById("loginPrompt").style.display = "block";
        document.getElementById("savedData").style.display = "none";
        document.getElementById("profileInfo").innerHTML = `
        <a
          class="btn btn-outline-primary ms-lg-3 mt-2 mt-lg-0"
          href="/login.html"
          id="loginBtn"
        >Login</a>
        `;
      }
    })
    .catch((err) => {
      // console.log(err);
    });
}

window.onload = checkAuthAndRenderProfile;

const mostVisitedColleges = () => {
  document.getElementById("loadingScreen").style.display = "block";

  fetch(
    `https://search-college-backend.vercel.app/api/viewedColleges/history/views`
  )
    .then((res) => res.json())
    .then((res) => {
      // console.log(res);
      res.data.map((item) => {
        // Create a link that wraps the whole card
        const collegeLink = document.createElement("a");
        collegeLink.href = `/InsideCollege.html?id=${item._id}`;
        collegeLink.classList.add("college-link"); // You can add a class for additional styling if needed
        collegeLink.target = "_blank";
        const collegeCard = document.createElement("div");
        collegeCard.classList.add("college-card", "card", "flex-shrink-0");

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        const collegeName = document.createElement("h5");
        collegeName.classList.add("card-title");
        collegeName.innerHTML = `🏫 ${item.name}`;

        // Apply dynamic styles to handle multi-line title
        collegeName.style.display = "block"; // Allow block-level to occupy full width
        collegeName.style.overflow = "hidden"; // Hide text overflow
        collegeName.style.whiteSpace = "normal"; // Allow text wrapping
        collegeName.style.textOverflow = "ellipsis"; // Show ellipsis when text overflows
        collegeName.style.lineHeight = "1.5em"; // Adjust line height for multi-line text
        collegeName.style.height = "3em"; // Limit height to 2 lines, adjust if needed

        const collegeViews = document.createElement("p");
        collegeViews.classList.add("card-text");
        collegeViews.innerHTML = `Visited - ${item.views}`;

        // Append elements to the card body and the card
        cardBody.appendChild(collegeName);
        cardBody.appendChild(collegeViews);
        collegeCard.appendChild(cardBody);

        // Append the card to the link and the link to the container
        collegeLink.appendChild(collegeCard);
        document.getElementById("mostVisitedColleges").appendChild(collegeLink);
      });
    })
    .catch((err) => {
      // console.log(err);
    })
    .finally(() => {
      document.getElementById("loadingScreen").style.display = "none";
    });
};

mostVisitedColleges();

let coursePage = 1; // Pagination tracker

const container = document.getElementById("courses-container");
const loadMoreBtn = document.getElementById("loadMoreCoursesBtn");

const reloadCourses = () => {
  currentPage = 0; // If used elsewhere
  coursePage = 1; // Reset to first page
  container.innerHTML = ""; // Clear the container
  loadCourses(coursePage); // Corrected this line
};

function loadCourses(page) {
  fetch(
    `https://search-college-backend.vercel.app/api/colleges/courses/all?page=${page}`
  )
    .then((res) => res.json())
    .then((res) => {
      // console.log("Page:", page, res);

      if (page > 1) {
        document.getElementById("goBack").style.display = "inline-block";
      } else {
        document.getElementById("goBack").style.display = "none";
      }

      res.data.forEach((item) => {
        const courseName = item._id;
        if (!courseName || courseName === "N/A") return;

        const col = document.createElement("div");
        col.className = "col-auto";

        const btn = document.createElement("button");
        btn.className =
          "btn btn-outline-primary rounded-pill px-3 py-1 shadow-sm";
        btn.textContent = courseName;

        // Navigate on click with query param (optional)
        btn.addEventListener("click", () => {
          window.location.href = `CourseCollege.html?course=${encodeURIComponent(
            courseName
          )}`;
        });

        col.appendChild(btn);
        container.appendChild(col);
      });

      if (!res.data || res.data.length === 0) {
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "inline";
      }
      document.getElementById("loadMreBtn").style.display = "block";
    })
    .catch((err) => {
      // console.error("Fetch error:", err);
    });
}

// Initial load
loadCourses(coursePage);

// Load more on button click
loadMoreBtn.addEventListener("click", () => {
  coursePage++;
  loadCourses(coursePage);
});
