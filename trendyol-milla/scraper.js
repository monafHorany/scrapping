const axios = require("axios");
let cheerio = require("cheerio");
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
    const product_source = "Trendyol-milla";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const brand = cheerio(".pr-new-br", html).contents().first().text();
    const strorjprice = cheerio(".prc-org", html).first().text();
    const strprice = cheerio(".prc-dsc", html).first().text();
    let price = strprice.split('.').join("");
    let orjprice = strorjprice.split('.').join("");
    if (orjprice === '') {
      orjprice = price
    }
    let description = '';
    const Variants = $('script:contains("allVariants")').html();
    const NameTag = JSON.parse(Variants.split("window.__PRODUCT_DETAIL_APP_INITIAL_STATE__=")[1].split("};")[0] + "}")
    const VariantsTag = Variants.match(/"allVariants":\[(.*?)\]/i)[1];
    const VariantsTagJson = "[" + VariantsTag + "]";
    const VariantsTagParsed = JSON.parse(VariantsTagJson);

    const otherVariantsTag = Variants.match(/"otherMerchantVariants":\[(.*?)\]/i)[1];
    const otherVariantsTagJson = "[" + otherVariantsTag + "]";
    const otherVariantsTagParsed = JSON.parse(otherVariantsTagJson);


    // const Description = JSON.parse(Variants.split("\"faq\":[],\"description\":")[1].split(",\"productGroupId\"")[0]);
    let name = NameTag.product.name;
    // if (Description.length > 0) {
    //   Description.forEach(element => {
    //     if (element.priority === 0) {
    //       description += element.text
    //     }
    //   });
    // }
    // else {
    //   description = '';
    // }
    const pricesArr = VariantsTagParsed.map(e => {
      if (e.inStock) {
        if (typeof e.price !== "string")
          return e.price
      }
    }).filter((n) => n)



    if (pricesArr.length > 0) {
      // if (Math.max(...pricesArr) !== Math.min(...pricesArr)) {
      orjprice = (Math.max(...pricesArr) + " TL").includes(".") ? (Math.max(...pricesArr) + " TL").replace(".", ",") : (Math.max(...pricesArr) + " TL")
      price = (Math.max(...pricesArr) + " TL").includes(".") ? (Math.max(...pricesArr) + " TL").replace(".", ",") : (Math.max(...pricesArr) + " TL")
      // }
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
    // const Description = JSON.parse(Variants.split("\"faq\":[],\"description\":")[1].split(",\"productGroupId\"")[0]);
    // if (Description.length > 0) {
    //   Description.forEach(element => {
    //     if (element.priority === 0) {
    //       description += element.text
    //     }
    //   });
    //   // const tranDesc = await translateText(description, 'ar');
    //   description = tranDesc[0]
    // }
    // else {
    //   description = '';
    // }

    const propiteam = cheerio(".prop-item", html).text();
    const PID = $('script:contains("productGroup")').html();
    var value = PID.match(/"productGroupId":(\d+)/i)[1];
    const imageUrls = PID.match(/"images":\[(.*?)\]/g);
    const imageUrl_extract = imageUrls.toString().match(/\[(.*?)\]/g);
    const imageUrl_array = JSON.parse(imageUrl_extract);
    const imageUrl = "https://cdn.dsmcdn.com/" + imageUrl_array[0];
    if (name.includes(NameTag.product.productCode)) {
      name = name.replace(NameTag.product.productCode, "");
    }

    productsDetails.push({
      name,
      brand,
      orjprice,
      price,
      description,
      imageUrl,
      prodURL,
      sizes,
      propiteam,
      group_url,
      product_source,
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
    const response = await axios.get(link, {
      headers: {
        Cookie: "LegalRequirementConfirmed=confirmed"
      }
    });

    const outerhtml = response.data;

    const dataTable = cheerio(
      ".srch-prdcts-cntnr .prdct-cntnr-wrppr .p-card-wrppr",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl = baseURL + cheerio(this).find("a").attr("href");

      urls.push(productUrl);
    });
    // return await getProduct(urls[0]);

    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
