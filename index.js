const worldSearchForm = document.getElementById("worldSearchForm");
const worldSearchInput = document.getElementById("worldSearchInput");
const countryCards = document.getElementById("countryCards");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const regionButtons = document.querySelectorAll(".btn-group button");

let allCountries = [];

const getCountry = async () => {
  const response = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,capital,flags,region,population,subregion,languages",
  );

  return await response.json();
};

//Sorterar i bokstavsordning
const sortCountries = (countries) => {
  return countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
};

// Öppnar detaljkort för varje land
const openModal = (country) => {
  modalBody.innerHTML = `
    <h2>${country.name.common}</h2>
    <img src="${country.flags.png}" width="150">
    <p><strong>Region:</strong> ${country.region}</p>
    <p><strong>Subregion:</strong> ${country.subregion || "N/A"}</p>
    <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
    <p><strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(", ") : "N/A"}</p>
    <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
  `;

  modal.classList.remove("hidden");
};

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// stäng om man klickar utanför modal
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

const renderCountries = (countries) => {
  countryCards.innerHTML = "";

  const sorted = sortCountries(countries);

  sorted.forEach((country) => {
    const card = document.createElement("div");

    card.innerHTML = `
      <img src="${country.flags.png}" alt="Flag of ${country.name.common}" width="100">
      <h3>${country.name.common}</h3>
      <p>Region: ${country.region}</p>
      <p>Capital: ${country.capital?.[0] || "N/A"}</p>
    `;

    card.addEventListener("click", () => {
      openModal(country);
    });

    countryCards.appendChild(card);
  });
};

// Fetch once on page load
window.addEventListener("DOMContentLoaded", async () => {
  allCountries = await getCountry();
  renderCountries(allCountries);
});

worldSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const searchValue = worldSearchInput.value.trim().toLowerCase();

  const filtered = allCountries.filter((country) =>
    country.name.common.toLowerCase().includes(searchValue),
  );

  renderCountries(filtered);
});

regionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const region = button.dataset.region;

    const filtered = allCountries.filter(
      (country) => country.region.toLowerCase() === region,
    );

    renderCountries(filtered);
  });
});
