const worldSearchForm = document.getElementById("worldSearchForm");
const worldSearchInput = document.getElementById("worldSearchInput");
const countryCards = document.getElementById("countryCards");
const modalElement = document.getElementById("countryModal");
const modalInstance = new bootstrap.Modal(modalElement);
const modalBody = document.getElementById("modalBody");
const regionButtons = document.querySelectorAll(".btn-group button");
const loading = document.getElementById("loading");

let allCountries = [];

const getCountry = async () => {
  const response = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,capital,flags,region,population,subregion,languages,currencies",
  );

  return await response.json();
};

//Sorterar i bokstavsordning
const sortCountries = (countries) => {
  return countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
};

// Öppnar detaljkort för varje land
const openModal = (country) => {
  const currencies = country.currencies
    ? Object.values(country.currencies)
        .map((c) => c.name)
        .join(", ")
    : "N/A";

  modalBody.innerHTML = `
    <h2>${country.name.common}</h2>
    <img src="${country.flags.png}" class="img-fluid mb-3">

    <p><strong>Region:</strong> ${country.region}</p>
    <p><strong>Subregion:</strong> ${country.subregion || "N/A"}</p>
    <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
    <p><strong>Languages:</strong> ${
      country.languages ? Object.values(country.languages).join(", ") : "N/A"
    }</p>
    <p><strong>Currency:</strong> ${currencies}</p>
    <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
  `;

  modalInstance.show();
};

const showLoading = () => {
  loading.classList.remove("d-none");
};

const hideLoading = () => {
  loading.classList.add("d-none");
};

const renderCountries = (countries) => {
  countryCards.innerHTML = "";

  const sorted = sortCountries(countries);

  sorted.forEach((country) => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3";

    col.innerHTML = `
      <div class="card h-100 shadow-sm bg-dark text-light">
        <img src="${country.flags.svg}" 
             class="card-img-top" 
             alt="Flag of ${country.name.common}">
             
        <div class="card-body">
          <h5 class="card-title">${country.name.common}</h5>
          <p class="card-text mb-1"><strong>Region:</strong> ${country.region}</p>
          <p class="card-text"><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
        </div>
      </div>
    `;

    col.querySelector(".card").addEventListener("click", () => {
      openModal(country);
    });

    countryCards.appendChild(col);
  });
};

// Fetch once on page load
window.addEventListener("DOMContentLoaded", async () => {
  showLoading();

  allCountries = await getCountry();

  setTimeout(() => {
    hideLoading();
    renderCountries(allCountries);
  }, 200);
});

worldSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  showLoading();

  const searchValue = worldSearchInput.value.trim().toLowerCase();

  const filtered = allCountries.filter((country) =>
    country.name.common.toLowerCase().includes(searchValue),
  );

  setTimeout(() => {
    renderCountries(filtered);
    hideLoading();
  }, 200);

  worldSearchInput.value = "";
});

regionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const region = button.dataset.region;

    if (region === "all") {
      renderCountries(allCountries);
      return;
    }

    const filtered = allCountries.filter(
      (country) => country.region.toLowerCase() === region,
    );

    renderCountries(filtered);
  });
});
