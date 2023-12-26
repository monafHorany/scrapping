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
          "_gcl_au=1.1.1676996500.1682753812; OCSESSID=d827a19f3cfeb4281bd4411964; language=tr-tr; currency=TRY; _gid=GA1.2.872284670.1685692924; _gac_UA-143840231-1=1.1685692924.CjwKCAjwpuajBhBpEiwA_ZtfhUb67QJBcRlnE86bUc6OsNa8hb3z6RoVvRcu4-pYip59a1KWex--TxoCLFUQAvD_BwE; _gat_gtag_UA_143840231_1=1; _gcl_aw=GCL.1685692924.CjwKCAjwpuajBhBpEiwA_ZtfhUb67QJBcRlnE86bUc6OsNa8hb3z6RoVvRcu4-pYip59a1KWex--TxoCLFUQAvD_BwE; __cf_bm=QHraNlwalQYwLhV_asRPEY9d4FGJfUmJEXLp7MtCDlw-1685692925-0-AQHnErcKiLu7uo/jFnxyvDIi/RamGhmVraHlxUrLTgag+PaifGB494hhP8iCRAeHKlF4ToacAT4HftbBii5Yf+ZJRSfgCVsLbHzW8n3pklQh; jrv=6056; _ga_PLTCSC767W=GS1.1.1685692924.6.1.1685692933.0.0.0; _ga=GA1.1.1212020984.1672065435",
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
      orjprice: orjprice.includes(".") ? orjprice.replace(".", "") : orjprice,
      price: price.includes(".") ? price.replace(".", "") : price,
      description,
      imageUrl,
      prodURL,
      sizes: sizes.filter((n) => n),
      propiteam,
      colors: colors.filter((n) => n),
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
    const response = await axios.get(link, {
      headers: {
        Cookie:
          "_gcl_au=1.1.1676996500.1682753812; OCSESSID=d827a19f3cfeb4281bd4411964; language=tr-tr; currency=TRY; _gid=GA1.2.872284670.1685692924; _gac_UA-143840231-1=1.1685692924.CjwKCAjwpuajBhBpEiwA_ZtfhUb67QJBcRlnE86bUc6OsNa8hb3z6RoVvRcu4-pYip59a1KWex--TxoCLFUQAvD_BwE; _gat_gtag_UA_143840231_1=1; _gcl_aw=GCL.1685692924.CjwKCAjwpuajBhBpEiwA_ZtfhUb67QJBcRlnE86bUc6OsNa8hb3z6RoVvRcu4-pYip59a1KWex--TxoCLFUQAvD_BwE; __cf_bm=QHraNlwalQYwLhV_asRPEY9d4FGJfUmJEXLp7MtCDlw-1685692925-0-AQHnErcKiLu7uo/jFnxyvDIi/RamGhmVraHlxUrLTgag+PaifGB494hhP8iCRAeHKlF4ToacAT4HftbBii5Yf+ZJRSfgCVsLbHzW8n3pklQh; jrv=6056; _ga_PLTCSC767W=GS1.1.1685692924.6.1.1685692933.0.0.0; _ga=GA1.1.1212020984.1672065435",
      },
    });

    const outerhtml = response.data;

    const dataTable = cheerio(
      ".main-products.product-grid > .product-layout",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl = cheerio(this).find("a").attr("href");
      urls.push(productUrl);
    });
    // return await getProduct(urls[0], link);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
