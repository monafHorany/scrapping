const axios = require("axios");
var cheerio = require("cheerio");
const baseURL = "https://www.trendyol-milla.com";

if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {

  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "LegalRequirementConfirmed=confirmed"
      }
    });
    const productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "T-milla";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const brand = cheerio(".pr-new-br", html).contents().first().text();
    const strorjprice = cheerio(".prc-org", html).first().text();
    const strprice = cheerio(".prc-dsc", html).first().text();
    let price = strprice.split('.').join("");
    let orjprice = strorjprice.split('.').join("");
    //......
    if (orjprice === '') {
      orjprice = price
    }
    const Variants = $('script:contains("allVariants")').html();
    const NameTag = JSON.parse(Variants.split("window.__PRODUCT_DETAIL_APP_INITIAL_STATE__=")[1].split("};")[0] + "}")
    const VariantsTag = Variants.match(/"allVariants":\[(.*?)\]/i)[1];
    const VariantsTagJson = "[" + VariantsTag + "]";
    const VariantsTagParsed = JSON.parse(VariantsTagJson);
    const otherVariantsTag = Variants.match(/"otherMerchantVariants":\[(.*?)\]/i)[1];
    const otherVariantsTagJson = "[" + otherVariantsTag + "]";
    const otherVariantsTagParsed = JSON.parse(otherVariantsTagJson);
    let name = NameTag.product.name;

    const pricesArr = VariantsTagParsed.map(e => {
      if (e.inStock) {
        if (typeof e.price !== "string")
          return e.price
      }
    }).filter((n) => n)

    let description = [];
    let jsonData;
    const scriptTag = $('script:contains("window.__PRODUCT_DETAIL_APP_INITIAL_STATE__")').html();
    if (scriptTag) {
      jsonData = JSON.parse(scriptTag.split("window.__PRODUCT_DETAIL_APP_INITIAL_STATE__=")[1].split(";window.TYPageName")[0])
      for (let i = 0; i < jsonData.product.attributes.length; i++) {
        const element = jsonData.product.attributes[i];
        description.push({ [element.key.name]: element.value.name })
      }
    }

    if (pricesArr.length > 0) {
      orjprice = (Math.max(...pricesArr) + " TL").includes(".") ? (Math.max(...pricesArr) + " TL").replace(".", ",") : (Math.max(...pricesArr) + " TL")
      price = (Math.max(...pricesArr) + " TL").includes(".") ? (Math.max(...pricesArr) + " TL").replace(".", ",") : (Math.max(...pricesArr) + " TL")
    }


    $(VariantsTagParsed).each(function (i, elm) {
      if (elm["inStock"] == true) {
        sizes.push(elm["value"]);
      }
    });
    if (otherVariantsTagParsed.length > 0) {
      $(otherVariantsTagParsed).each(function (i, elm) {
        if (elm["inStock"] == true) {
          sizes.push(elm["value"]);
        }
      });
    }

    const propiteam = cheerio(".prop-item", html).text();
    const PID = $('script:contains("productGroup")').html();
    var value = PID.match(/"productGroupId":(\d+)/i)[1];
    const imageUrls = PID.match(/"images":\[(.*?)\]/g);
    const imageUrl_extract = imageUrls.toString().match(/\[(.*?)\]/g);
    const imageUrl_array = JSON.parse(imageUrl_extract);
    $(imageUrl_array).each(function (key, img) {
      images.push("https://cdn.dsmcdn.com" + img);
    });

    if (name.includes(NameTag.product.productCode)) {
      name = name.replace(NameTag.product.productCode, "");
    }
    if (description !== null || description !== '') {
      description = JSON.stringify(description)
    }
    productsDetails.push({
      name,
      description,
      orjprice,
      price,
      images,
      prodURL,
      sizes,
    });

    return productsDetails;
  } catch (error) {
    console.log(error);
    productsDetails = [];
    return productsDetails;
  }
}

async function getProductsData(link, urls = []) {
  try {
    console.log("Requesting : " + link);
    const productUrl = link;
    urls.push(productUrl);

    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
