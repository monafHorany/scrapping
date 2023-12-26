const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.gizce.com/kombinler";
const baseURL = "https://www.gizce.com";

if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie:
          "currency=TRY; _gcl_au=1.1.2130659055.1672065435; language=tr-tr; OCSESSID=84aa9fc4b518aac237876e57c7; _gid=GA1.2.2112965375.1672236061; __cf_bm=yTzNpKCapAbq0DRQJ4XFtbBgoR8a5x7b.Gpljx1e2V8-1672236978-0-AeXJFhgULQ1AGSHgCt4HzIkmGOSwuIkwH8K7Yrno0g8Mo431DnZ/8tSmJU82f1o1w09x1ZFjqkQy9U++2lq2YjNEMC21mzTgh1+WBNs+83gbKoB4cjXsTPBO3JdAea81qwu7fdWF73YRjO+p1nh1Mc0=; jrv=7145,5347,4309; _gat_gtag_UA_143840231_1=1; _ga_PLTCSC767W=GS1.1.1672236061.3.1.1672237573.0.0.0; _ga=GA1.2.1212020984.1672065435",
      },
    });
    const productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "gizce";
    const group_url = link;
    const name = $("div.title.page-title").text();
    const orjprice = $("div.product-price-old")
      .first()
      .text()
      .replace("T", " T");
    const price = $("div.product-price-new").first().text().replace("T", " T");
    const description = $("div.panel-body.block-content").first().text();
    const propiteam = "item";
    const imageUrl = $(".swiper-slide").first().find("img").attr("src");
    var images = [];
    $(".swiper-wrapper")
      .first()
      .find(".swiper-slide")
      .map((index, element) => {
        images.push($(element).find("img").attr("src"));
      });

    // const PA = jsonvalue.Colors;
    const colors = [];
    const size = [];
    $(".option-value").map((index, element) => {
      if ($(element).css("text-decoration") !== "line-through") {
        size.push($(element).text());
      }
    });

    var sizes = size.filter(onlyUnique);
    productsDetails.push({
      name,
      // orjprice: orjprice.includes(".") ? orjprice.replace(".", "") : orjprice,
      // price: price.includes(".") ? price.replace(".", "") : price,
      orjprice,
      price,
      description,
      imageUrl,
      prodURL,
      sizes,
      propiteam,
      colors,
      group_url,
      product_source,
      images,
    });
    return productsDetails;
  } catch (error) {
    console.log(error);
    productsDetails = [];
    return productsDetails;
  }
}
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
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
