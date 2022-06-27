const CountryList = require('../model/countryList.js');

const allCountry = async (req, res, next) => {
  try {
    const list = await (await CountryList.getAll()).sort();
    res.send(list);
  } catch (error) {
    res.status(421).send(`Can't get country list`);
  }
};

const searchCountry = async (req, res, next) => {
  try {
    const searchToken = req.params.c_name;
    const result = await CountryList.searchCountry(searchToken);
    res.send(result);
  } catch (err) {
    res.status(400).send('Something went wrong');
    console.log(err);
  }
};

module.exports = {
  searchCountry,
  allCountry
}