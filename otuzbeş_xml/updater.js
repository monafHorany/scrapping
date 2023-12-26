const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.otuzbesshoes.com/";
const baseURL = "https://www.otuzbesshoes.com/";
const xml2js = require("xml2js");
const parser = new xml2js.Parser();

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    const html = response.data;
    // const $ = cheerio.load(html, { xml: true });
    let jsonResult;
    parser.parseString(html, function (err, result) {
      jsonResult = result;
    });

    const allProducts = [];
    for (let i = 0; i < jsonResult.Products.Product.length; i++) {
      const productsDetails = [];
      const element = jsonResult.Products.Product[i];
      const name = element.$.Name;
      const price = element.$.Price;
      const description = element.$.FullDescription;
      const colors = ["No Colors Available"];
      const sizes = element.Combinations[0].Combination.map(
        (s) => s.Attributes[0].Attribute[0].$.Value
      );
      const images =
        element?.Pictures.length > 0 && element?.Pictures[0].Picture
          ? element?.Pictures[0].Picture?.map((i) => i.$.Path)
          : ["No Images"];
      const imageUrl =
        element?.Pictures.length > 0 && element?.Pictures[0].Picture
          ? element?.Pictures[0].Picture[0]?.$?.Path
          : "No Image";
      productsDetails.push({
        name,
        price,
        description,
        colors,
        sizes,
        imageUrl,
        images,
        prodURL: element.$.Url,
      });
      allProducts.push(productsDetails);
    }
    return allProducts;
  } catch (error) {
    console.log(error);
    allProducts = [];
    return allProducts;
  }
}

async function getProductsData(link, urls = []) {
  try {
    return await getProduct(link);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getProductsData,
};
