const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.armalife.com.tr/yeni-gelenler";
const baseURL = "https://www.armalife.com.tr";
async function getProductsData(link) {
  console.log(link)
  var productsDetails = [];
  try {
    const response = await axios.get(link);
    const outerhtml = response.data;
    const $ = cheerio.load(outerhtml);


    const element =
      Number($('script:contains("var PRODUCT_ID			= ")').html().split("var PRODUCT_ID			= ")[1]
        .split("var FCODE				= ")[0].replace(";", "").replace(/['"]+/g, ''));
    console.log(element)
    const eq = $('script:contains("var PRODUCT_ID			= ")').html().split("var Eq = ")[1]
      .split("if")[0].replace(/['"]+/g, '');

    const { data: el } = await axios.get(`https://farktorapi.com/new/Fr-5500172/${element}${eq}`)

    let discountPerc = null;
    if (el.campaigns.length > 0) {
      discountPerc = el.campaigns[0].discount
    }


    productsDetails.push({
      name: el.name,
      imageUrl: "https://images.farktorcdn.com/img/780x1170/Library/Upl/5500172/Product/" + el.photo,
      orjprice: el.priceSale.toFixed(2).replace(".", ",") + " TL",
      price: el.priceSale.toFixed(2).replace(".", ",") + " TL",
      description: el.desc,
      images: el.photos.map(i => ("https://images.farktorcdn.com/img/780x1170/Library/Upl/5500172/Product/" + i.photo)),
      prodURL: baseURL + "/" + el.seoUrl + "_" + el.productId,
      sizes: el.sizes.map(i => {
        if (i.qty > 0) {
          return i.name
        }
      }).filter(n => n),
      colors: el.colors.map(i => i.name),
      group_url: link,
      product_source: "Armalife",
    })


    if (productsDetails[0].sizes.length === 0) {
      return productsDetails = []
    }

    return productsDetails;
  } catch (error) {
    console.log(error)
    productsDetails = [];
    return productsDetails;
  }
}
module.exports = {
  getProductsData,
};
