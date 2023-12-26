const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.otuzbesshoes.com/";
const baseURL = "https://www.otuzbesshoes.com/";
const xml2js = require("xml2js");
const parser = new xml2js.Parser();
const fs = require("fs");

async function getProduct() {
  console.log("called2");

  try {
    const { data } = await axios.get(
      "https://www.barrelsandoil.com/XMLExport/5A129437D48C4C11B78F85D530836AB1"
    );

    console.log("got response");
    // return data;
    // const $ = cheerio.load(html, { xml: true });
    let jsonResult;
    parser.parseString(data, function (err, result) {
      jsonResult = result;
    });
    fs.writeFileSync("data.json", JSON.stringify(jsonResult));
    return;
    // const allProducts = [];
    // for (let i = 0; i < jsonResult.Products.Product.length; i++) {
    //   const productsDetails = [];
    //   const element = jsonResult.Products.Product[i];
    //   const name = element.$.Name;
    //   const price = element.$.Price;
    //   const description = element.$.FullDescription;
    //   const colors = ["No Colors Available"];
    //   const sizes = element.Combinations[0].Combination.map(
    //     (s) => s.Attributes[0].Attribute[0].$.Value
    //   );
    //   const images =
    //     element?.Pictures.length > 0 && element?.Pictures[0].Picture
    //       ? element?.Pictures[0].Picture?.map((i) => i.$.Path)
    //       : ["No Images"];
    //   const imageUrl =
    //     element?.Pictures.length > 0 && element?.Pictures[0].Picture
    //       ? element?.Pictures[0].Picture[0]?.$?.Path
    //       : "No Image";
    //   productsDetails.push({
    //     name,
    //     price,
    //     description,
    //     colors,
    //     sizes,
    //     imageUrl,
    //     images,
    //     prodURL: element.$.Url,
    //   });
    //   allProducts.push(productsDetails);
    // }
  } catch (error) {
    console.log(error);
    allProducts = [];
    return allProducts;
  }
}

function getProductsData() {
  console.log("called");
  try {
    return getProduct();
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getProductsData,
};

//"https://www.otuzbesshoes.com/FaprikaXml/A9KHRS/1/"
