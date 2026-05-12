const worldSearchForm = document.getElementById("worldSearchForm");
const worldSearchInput = document.getElementById("worldSearchInput");
const countryCards = document.getElementById("countryCards");
const modalElement = document.getElementById("countryModal");
const modalInstance = new bootstrap.Modal(modalElement);
const modalBody = document.getElementById("modalBody");
const regionButtons = document.querySelectorAll("[data-region]");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

//Skapar en tom lista där alla länder från API:et ska sparas
let allCountries = [];

const showError = (message) => {
  errorMessage.textContent = message;
  errorMessage.classList.remove("d-none");
};

const hideError = () => {
  errorMessage.classList.add("d-none");
};

//Hämtar data via API
const getCountry = async () => {
  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,capital,flags,region,population,subregion,languages,currencies",
    );

    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }

    return await response.json();
  } catch (error) {
    showError("Something went wrong while loading countries.");
    return [];
  }
};

//Sorterar i bokstavsordning
const sortCountries = (countries) => {
  return countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
};

//Filtrera efter sökning
const filterBySearch = (searchTerm) => {
  return allCountries.filter((country) =>
    country.name.common.toLowerCase().includes(searchTerm.toLowerCase()),
  );
};

//Filtrera efter region
const filterByRegion = (region) => {
  if (region === "all") {
    return allCountries;
  }
  return allCountries.filter(
    (country) => country.region.toLowerCase() === region,
  );
};

//Hämta valutor från land
const getCurrencies = (country) => {
  if (!country.currencies) return "N/A";
  return Object.values(country.currencies)
    .map((c) => c.name)
    .join(", ");
};

//Hämta språk från land
const getLanguages = (country) => {
  if (!country.languages) return "N/A";
  return Object.values(country.languages).join(", ");
};

//Hämta huvudstad från land
const getCapital = (country) => {
  return country.capital?.[0] || "N/A";
};

// Öppnar detaljkort (modal) för varje land
const openModal = (country) => {
  const currencies = getCurrencies(country);
  const languages = getLanguages(country);
  const capital = getCapital(country);

  modalBody.innerHTML = `
    <h2>${country.name.common}</h2>
    <img src="${country.flags.png}" class="img-fluid mb-3">

    <p><strong>Region:</strong> ${country.region}</p>
    <p><strong>Subregion:</strong> ${country.subregion || "N/A"}</p>
    <p><strong>Capital:</strong> ${capital}</p>
    <p><strong>Languages:</strong> ${languages}</p>
    <p><strong>Currency:</strong> ${currencies}</p>
    <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
  `;

  modalInstance.show();
};

//Loadingstate
const showLoading = () => {
  loading.classList.remove("d-none");
};

const hideLoading = () => {
  loading.classList.add("d-none");
};

//Renderar countrycards
const renderCountries = (countries) => {
  countryCards.innerHTML = "";

  const sorted = sortCountries(countries);

  sorted.forEach((country) => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    col.innerHTML = `
      <div class="card h-100 shadow-sm bg-dark text-light">
        <img src="${country.flags.svg}" 
             class="card-img-top" 
             alt="Flag of ${country.name.common}">
             
        <div class="card-body">
          <h5 class="card-title">${country.name.common}</h5>
          <p class="card-text mb-1"><strong>Region:</strong> ${country.region}</p>
          <p class="card-text"><strong>Capital:</strong> ${getCapital(country)}</p>
        </div>
      </div>
    `;

    col.querySelector(".card").addEventListener("click", () => {
      openModal(country);
    });

    countryCards.appendChild(col);
  });
};

// Återställ senaste sökning eller region
const restoreState = () => {
  const savedRegion = localStorage.getItem("lastRegion");
  const savedSearch = localStorage.getItem("lastSearch");

  if (savedRegion && savedRegion !== "all") {
    renderCountries(filterByRegion(savedRegion));
  } else if (savedSearch) {
    worldSearchInput.value = savedSearch;
    renderCountries(filterBySearch(savedSearch));
  } else {
    renderCountries(allCountries);
  }
};

// Fetch once on page load
window.addEventListener("DOMContentLoaded", async () => {
  showLoading();
  hideError();

  allCountries = await getCountry();

  setTimeout(() => {
    hideLoading();

    if (allCountries.length > 0) {
      restoreState();
      countryCards.classList.remove("d-none");
    }
  }, 200);
});

//Eventlyssnare sökknapp
worldSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  hideError();
  showLoading();

  const searchValue = worldSearchInput.value.trim().toLowerCase();
  localStorage.setItem("lastSearch", searchValue);
  localStorage.removeItem("lastRegion");

  // Felhantering vid tomt inputfält
  if (searchValue === "") {
    hideLoading();
    showError("Please enter a country name.");
    return;
  }

  const filtered = filterBySearch(searchValue);

  setTimeout(() => {
    hideLoading();

    // Felhantering om det inte hittas något resultat
    if (filtered.length === 0) {
      countryCards.innerHTML = "";
      showError("No countries found.");
      return;
    }

    renderCountries(filtered);
  }, 200);

  worldSearchInput.value = "";
});

//Eventlysnare regionsknappar
regionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    hideError();
    const region = button.dataset.region;
    localStorage.setItem("lastRegion", region);
    localStorage.removeItem("lastSearch");

    renderCountries(filterByRegion(region));
  });
});

// Tar bort felmeddelande när användaren börjar skriva igen
worldSearchInput.addEventListener("input", () => {
  hideError();
});
