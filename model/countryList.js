const fetch =  require('node-fetch');

class Country {
  constructor() {
    this.url = 'https://api.first.org/data/v1/countries';
  }

  #fetchCountry = async (url) => {
    try {
      const countryList = await fetch(url, { method: 'GET' });
      return countryList.json();
    } catch (err) {
      Promise.reject(url);
    }
  };
  getAll = async () => {
    const res = await this.#fetchCountry(this.url);
    return this.#normalize(res.data);
  };
  searchCountry = async (token) => {
    const url = `${this.url}?q=${token}`;
    const res = await this.#fetchCountry(url);
    const result = this.#normalize(res.data);
    if (result.length > 0) {
      return result;
    }
    return false;
  };
  #normalize = (obj) => Object.values(obj).map((el) => el.country);
}

const CountryList = new Country();
module.exports = CountryList;
