const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.trendyol.com/erkek+ceket";
const baseURL = "https://www.trendyol.com";


// // Imports the Google Cloud client library
// const { Translate } = require('@google-cloud/translate').v2;
// const CREDENTIALS = require('./spry-starlight-273319-373651bf69f3.json');

// // Creates a client
// const translate = new Translate({
//   credentials: CREDENTIALS,
//   projectId: CREDENTIALS.project_id
// });
// /**
//  * 

//  * TODO(developer): Uncomment the following lines before running the sample.
//  */
// // const text = 'Hello, world!';
// // const target = 'tr';

// async function translateText(text, target) {
//   // Translates the text into the target language. "text" can be a string for
//   // translating a single piece of text, or an array of strings for translating
//   // multiple texts.
//   return translations = await translate.translate(text, target);
//   // console.log(translations[0]);
// }

// // translateText();

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
    const product_source = "Trendyol";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const brand = cheerio(".pr-new-br", html).contents().first().text();

    // const resName = await fetch("https://libretranslate.com/translate", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     q: cheerio(".pr-new-br span", html).text(),
    //     source: "tr",
    //     target: "ar",
    //     format: "text",
    //     api_key: "1eb92343-68c6-47e4-9f8d-2ae520d33275"
    //   }),
    //   headers: { "Content-Type": "application/json" }
    // });
    // const { translatedText: name } = await resName.json();
    const transName = await translateText(cheerio(".pr-new-br span", html).text(), 'ar');
    const name = transName[0];
    const strorjprice = cheerio(".prc-org", html).first().text();
    const strprice = cheerio(".prc-dsc", html).first().text();
    let price = strprice.split('.').join("");
    let orjprice = strorjprice.split('.').join("");
    //......
    if (orjprice === '') {
      orjprice = price
    }
    let description = '';
    const Variants = $('script:contains("allVariants")').html();
    const VariantsTag = Variants.match(/"allVariants":\[(.*?)\]/i)[1];
    const VariantsTagJson = "[" + VariantsTag + "]";
    const VariantsTagParsed = JSON.parse(VariantsTagJson);
    const otherVariantsTag = Variants.match(/"otherMerchantVariants":\[(.*?)\]/i)[1];
    const otherVariantsTagJson = "[" + otherVariantsTag + "]";
    const otherVariantsTagParsed = JSON.parse(otherVariantsTagJson);

    const Description = JSON.parse(Variants.split("\"faq\":[],\"description\":")[1].split(",\"productGroupId\"")[0]);
    if (Description.length > 0) {
      Description.forEach(element => {
        if (element.priority === 0) {
          description += element.text
        }
      });
      const tranDesc = await translateText(description, 'ar');
      description = tranDesc[0]
    }
    else {
      description = '';
    }
    const pricesArr = VariantsTagParsed.map(e => {
      if (e.inStock) {
        if (typeof e.price !== "string")
          return e.price
      }
    }).filter((n) => n)
    // const resDesc = await fetch("https://libretranslate.com/translate", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     q: description,
    //     source: "tr",
    //     target: "ar",
    //     format: "html",
    //     api_key: "1eb92343-68c6-47e4-9f8d-2ae520d33275"
    //   }),
    //   headers: { "Content-Type": "application/json" }
    // });

    // const { translatedText } = await resDesc.json()
    // description = translatedText

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
      images.push("https://cdn.dsmcdn.com/" + img);
    });

    const productsAttrebuites = await axios.get(
      "https://public.trendyol.com/discovery-web-productgw-service/api/productGroup/" +
      value
    );
    if (productsAttrebuites.data.result.slicingAttributes[0]) {
      color = productsAttrebuites.data.result.slicingAttributes[0].attributes;
      $(color).each(function (i, elm) {
        colors.push(elm["name"]);
      });
    } else {
      colors.push("No Colors Available");
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
